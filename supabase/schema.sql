-- ========================================
-- Willnicht - Supabase Database Schema
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLE: profiles
-- Extends Supabase Auth users with additional fields
-- ========================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- User preferences
    language TEXT DEFAULT 'ru' CHECK (language IN ('ru', 'en', 'de')),
    marketplace_language TEXT DEFAULT 'de' CHECK (marketplace_language IN ('de', 'en', 'ru')),
    
    -- Subscription info
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'pro_monthly', 'pro_yearly')),
    evaluations_used INTEGER DEFAULT 0,
    evaluations_limit INTEGER DEFAULT 3,
    subscription_expires_at TIMESTAMP WITH TIME ZONE
);

-- Create index on email for faster lookups
CREATE INDEX profiles_email_idx ON public.profiles(email);

-- ========================================
-- TABLE: listings
-- Stores product evaluations/listings for each user
-- ========================================
CREATE TABLE public.listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Product information
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'Sonstiges',
    
    -- Price information
    market_price_min DECIMAL(10, 2) NOT NULL,
    market_price_max DECIMAL(10, 2) NOT NULL,
    recommended_price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    
    -- Image data (base64 encoded or URL)
    image_data TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Additional fields from webhook
    webhook_id TEXT,
    confidence DECIMAL(3, 2),
    
    -- Language information
    user_language TEXT,
    marketplace_language TEXT
);

-- Create indexes for performance
CREATE INDEX listings_user_id_idx ON public.listings(user_id);
CREATE INDEX listings_created_at_idx ON public.listings(created_at DESC);
CREATE INDEX listings_user_created_idx ON public.listings(user_id, created_at DESC);

-- ========================================
-- TRIGGER: Update updated_at timestamp
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to listings table
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- TRIGGER: Create profile on user signup
-- Automatically creates a profile when a new user signs up
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Enable RLS on listings
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Users can only read their own listings
CREATE POLICY "Users can view own listings"
    ON public.listings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own listings
CREATE POLICY "Users can insert own listings"
    ON public.listings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
    ON public.listings
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings"
    ON public.listings
    FOR DELETE
    USING (auth.uid() = user_id);

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to get user's evaluation count
CREATE OR REPLACE FUNCTION public.get_user_evaluations_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.listings
        WHERE user_id = user_uuid
        AND created_at >= date_trunc('month', timezone('utc'::text, now()))
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create evaluation
CREATE OR REPLACE FUNCTION public.can_create_evaluation(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_limit INTEGER;
    evaluations_count INTEGER;
BEGIN
    SELECT evaluations_limit INTO user_limit
    FROM public.profiles
    WHERE id = user_uuid;
    
    evaluations_count := public.get_user_evaluations_count(user_uuid);
    
    RETURN evaluations_count < user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- VIEWS
-- ========================================

-- View for user listings with profile info
CREATE OR REPLACE VIEW public.user_listings_view AS
SELECT
    l.id,
    l.user_id,
    l.title,
    l.description,
    l.category,
    l.market_price_min,
    l.market_price_max,
    l.recommended_price,
    l.currency,
    l.image_data,
    l.created_at,
    l.updated_at,
    l.webhook_id,
    l.confidence,
    p.email,
    p.language AS user_language,
    p.marketplace_language,
    p.subscription_plan
FROM public.listings l
JOIN public.profiles p ON l.user_id = p.id;

-- ========================================
-- SAMPLE DATA (for testing - remove in production)
-- ========================================
-- Uncomment to add sample data:
/*
INSERT INTO public.listings (user_id, title, description, category, market_price_min, market_price_max, recommended_price, image_data)
VALUES (
    (SELECT id FROM public.profiles LIMIT 1),
    'Vintage Omega Uhr',
    'Mechanische Omega Seamaster Uhr aus den 1960er Jahren in ausgezeichnetem Zustand.',
    'Uhren & Schmuck',
    150.00,
    200.00,
    179.00,
    'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
);
*/
