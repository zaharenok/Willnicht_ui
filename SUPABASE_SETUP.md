# Supabase Integration Guide

This guide explains how to set up and use Supabase with the Willnicht application for user authentication and data storage.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Supabase Project](#step-1-create-supabase-project)
4. [Step 2: Set Up Database Schema](#step-2-set-up-database-schema)
5. [Step 3: Configure Authentication](#step-3-configure-authentication)
6. [Step 4: Configure the Application](#step-4-configure-the-application)
7. [Step 5: Test the Integration](#step-5-test-the-integration)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Willnicht application now supports Supabase for:
- **User Authentication**: Email/password-based authentication with secure session management
- **Data Storage**: Persistent storage of product evaluations in the cloud
- **Data Isolation**: Row Level Security (RLS) ensures users only see their own data
- **Fallback Support**: Graceful fallback to localStorage if Supabase is not configured

### Key Features

- ✅ Secure email/password authentication
- ✅ Automatic session management and token refresh
- ✅ User registration with email confirmation
- ✅ Product evaluations stored per user
- ✅ Monthly evaluation limits per subscription plan
- ✅ Row Level Security for data isolation
- ✅ Graceful fallback to localStorage

---

## Prerequisites

Before starting, ensure you have:
- A Supabase account (free at [supabase.com](https://supabase.com))
- Basic understanding of SQL (for database setup)
- Node.js or npm installed (optional, for local development)

---

## Step 1: Create Supabase Project

### 1.1 Sign Up / Log In

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or log in if you already have an account
3. Click "New Project"

### 1.2 Configure Project

1. **Name**: Enter a project name (e.g., `willnicht`)
2. **Database Password**: Set a strong database password (save it securely!)
3. **Region**: Choose the region closest to your users (e.g., `Europe West`)
4. Click "Create new project"

### 1.3 Wait for Setup

Supabase will take 1-2 minutes to set up your project. Wait for the setup to complete.

### 1.4 Get API Credentials

Once the project is ready:

1. Navigate to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL**: Looks like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: Looks like `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**⚠️ IMPORTANT**: Never share your `service_role` key! Only use the `anon/public` key in frontend code.

---

## Step 2: Set Up Database Schema

### 2.1 Open SQL Editor

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query

### 2.2 Run Schema SQL

Copy the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and paste it into the SQL Editor.

**Or run these commands manually:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    language TEXT DEFAULT 'ru' CHECK (language IN ('ru', 'en', 'de')),
    marketplace_language TEXT DEFAULT 'de' CHECK (marketplace_language IN ('de', 'en', 'ru')),
    subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'pro_monthly', 'pro_yearly')),
    evaluations_used INTEGER DEFAULT 0,
    evaluations_limit INTEGER DEFAULT 3,
    subscription_expires_at TIMESTAMP WITH TIME ZONE
);

-- Create listings table
CREATE TABLE public.listings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'Sonstiges',
    market_price_min DECIMAL(10, 2) NOT NULL,
    market_price_max DECIMAL(10, 2) NOT NULL,
    recommended_price DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    image_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    webhook_id TEXT,
    confidence DECIMAL(3, 2),
    user_language TEXT,
    marketplace_language TEXT
);

-- Create indexes
CREATE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX listings_user_id_idx ON public.listings(user_id);
CREATE INDEX listings_created_at_idx ON public.listings(created_at DESC);
```

### 2.3 Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Users can only view their own listings
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
```

### 2.4 Create Trigger for New Users

```sql
-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### 2.5 Click "Run"

Execute the SQL to create your tables and policies.

---

## Step 3: Configure Authentication

### 3.1 Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure email settings:
   - **Confirm email**: Enable email confirmation (recommended for production)
   - **Secure email change**: Enable
   - **Enable email confirmations**: Yes

### 3.2 Configure Email Templates (Optional)

For production, configure custom email templates:

1. Go to **Authentication** → **Email Templates**
2. Customize:
   - **Confirm signup** email
   - **Reset password** email
   - **Email change** email

### 3.3 Test Email Delivery

1. Go to **Authentication** → **Users**
2. Click "Add user" to create a test user
3. Send a test email to verify SMTP is working

---

## Step 4: Configure the Application

### 4.1 Update Supabase Client Configuration

Open [`supabase/client.js`](supabase/client.js) and update the credentials:

```javascript
const SUPABASE_CONFIG = {
    // Replace these with your actual Supabase project credentials
    url: 'YOUR_SUPABASE_PROJECT_URL_HERE',
    anonKey: 'YOUR_SUPABASE_ANON_KEY_HERE',
    
    // Optional: Additional client options
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storage: window.localStorage
        }
    }
};
```

**Where to find these values:**
- Go to your Supabase project → **Settings** → **API**
- Copy the **Project URL** and **anon/public** key

### 4.2 Verify Client Library is Loaded

The application automatically loads the Supabase client from CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase/client.js"></script>
```

### 4.3 Test Configuration

1. Open the browser's Developer Console (F12)
2. Look for the message: `Supabase client initialized successfully`
3. If you see `Supabase credentials not configured`, check your credentials

---

## Step 5: Test the Integration

### 5.1 Test User Registration

1. Open `app.html` in your browser
2. Click "Зарегистрироваться" (Register)
3. Enter a valid email and password (min 6 characters)
4. Submit the form

**Expected Result:**
- User is created in Supabase
- Profile is automatically created in the `profiles` table
- Confirmation email is sent (if enabled)
- Success notification appears

### 5.2 Test User Login

1. Click "Войти" (Login) link
2. Enter the same email and password
3. Submit the form

**Expected Result:**
- User is authenticated
- Session is stored
- App interface is shown
- User email is displayed in the header

### 5.3 Test Listing Creation

1. Upload a product photo
2. Click "Получить оценку" (Get evaluation)
3. Wait for the webhook response

**Expected Result:**
- Listing is saved to Supabase `listings` table
- Listing is linked to the authenticated user via `user_id`
- Evaluation count is incremented
- Listing appears in the history

### 5.4 Test Data Isolation

1. Log out
2. Register a different user
3. Log in as the new user
4. Check the history

**Expected Result:**
- New user sees only their own listings
- Previous user's listings are not visible
- RLS is working correctly

---

## Security Best Practices

### 🔐 API Key Security

- **Never commit** the `service_role` key to version control
- **Only use** the `anon/public` key in frontend code
- **Use environment variables** for sensitive data in production
- **Rotate keys** periodically if compromised

### 🔒 Row Level Security (RLS)

The schema includes comprehensive RLS policies:

```sql
-- Users can only access their own data
USING (auth.uid() = user_id)
```

**Benefits:**
- Users cannot access other users' data
- Even if they modify the frontend, database blocks unauthorized access
- No need for complex backend logic

### 📧 Password Security

- Minimum password length: 6 characters
- Passwords are hashed by Supabase (bcrypt)
- Never store passwords in plain text
- Encourage users to use strong passwords

### 🌐 HTTPS

- Always use HTTPS in production
- Supabase provides HTTPS by default
- Configure custom domains with SSL certificates

### 📊 Rate Limiting

Supabase provides built-in rate limiting:
- Configure in **Project Settings** → **API**
- Set limits per user/IP
- Prevents abuse and DDoS attacks

---

## Troubleshooting

### Issue: "Supabase credentials not configured"

**Solution:**
1. Check [`supabase/client.js`](supabase/client.js)
2. Verify `SUPABASE_CONFIG.url` and `SUPABASE_CONFIG.anonKey` are set
3. Ensure you copied the correct values from Supabase dashboard

### Issue: "User already exists" error

**Solution:**
1. Check the `auth.users` table in Supabase dashboard
2. Delete the test user if needed
3. Or use a different email for testing

### Issue: Email confirmation not received

**Solution:**
1. Check **Authentication** → **Email Templates** in Supabase
2. Verify SMTP settings are correct
3. Check spam folder in email client
4. Try resending the confirmation email

### Issue: RLS policies not working

**Solution:**
1. Verify RLS is enabled: `ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;`
2. Check policy syntax in SQL Editor
3. Test with different users to confirm isolation

### Issue: Data not saving to Supabase

**Solution:**
1. Check browser console for errors
2. Verify user is authenticated
3. Check if `CONFIG.useSupabase` is `true`
4. The app will fall back to localStorage if Supabase is not configured

### Issue: CORS errors

**Solution:**
1. Add your domain to **Project Settings** → **Authentication** → **URL Configuration**
2. Add both development and production URLs
3. Example: `http://localhost:8000` for local testing

---

## Database Schema Reference

### Tables

#### `profiles` Table

| Column | Type | Description |
|---------|-------|-------------|
| `id` | UUID (PK) | References `auth.users.id` |
| `email` | TEXT | User email address |
| `created_at` | TIMESTAMPTZ | Account creation time |
| `updated_at` | TIMESTAMPTZ | Last update time |
| `language` | TEXT | User interface language (ru/en/de) |
| `marketplace_language` | TEXT | Marketplace language (de/en/ru) |
| `subscription_plan` | TEXT | Current plan (free/starter/pro_monthly/pro_yearly) |
| `evaluations_used` | INTEGER | Evaluations this month |
| `evaluations_limit` | INTEGER | Monthly limit |
| `subscription_expires_at` | TIMESTAMPTZ | Subscription expiry |

#### `listings` Table

| Column | Type | Description |
|---------|-------|-------------|
| `id` | UUID (PK) | Unique listing ID |
| `user_id` | UUID (FK) | References `profiles.id` |
| `title` | TEXT | Product title (German) |
| `description` | TEXT | Product description (German) |
| `category` | TEXT | Product category |
| `market_price_min` | DECIMAL(10,2) | Minimum market price |
| `market_price_max` | DECIMAL(10,2) | Maximum market price |
| `recommended_price` | DECIMAL(10,2) | Recommended selling price |
| `currency` | TEXT | Currency code (EUR) |
| `image_data` | TEXT | Base64 encoded image or URL |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `webhook_id` | TEXT | Webhook response ID |
| `confidence` | DECIMAL(3,2) | AI confidence score |
| `user_language` | TEXT | User's language preference |
| `marketplace_language` | TEXT | Marketplace language used |

### Helper Functions

#### `get_user_evaluations_count(user_uuid)`

Returns the number of evaluations a user has created this month.

#### `can_create_evaluation(user_uuid)`

Returns `TRUE` if the user can create a new evaluation (under limit), `FALSE` otherwise.

---

## API Reference

### Authentication Functions

```javascript
// Sign up a new user
await signUp(email, password);

// Sign in existing user
await signIn(email, password);

// Sign out current user
await signOut();

// Get current session
await getSession();

// Get current user
await getCurrentUser();

// Listen to auth state changes
onAuthStateChange((event, session) => {
    console.log(event, session);
});
```

### Database Functions

```javascript
// Fetch user's listings
await fetchListings({ limit: 50, offset: 0 });

// Fetch single listing
await fetchListingById(id);

// Create new listing
await createListing({
    title: 'Product Title',
    description: 'Description...',
    category: 'Category',
    market_price_min: 100,
    market_price_max: 200,
    recommended_price: 150,
    currency: 'EUR',
    image_data: 'base64...',
    webhook_id: 'webhook-id',
    confidence: 0.95
});

// Update listing
await updateListing(id, { title: 'New Title' });

// Delete listing
await deleteListing(id);
```

### Profile Functions

```javascript
// Fetch user profile
await fetchProfile();

// Update user profile
await updateProfile({
    language: 'de',
    marketplace_language: 'de'
});
```

### Utility Functions

```javascript
// Check if Supabase is configured
isSupabaseConfigured();

// Get user's evaluation count
await getUserEvaluationCount();

// Check if user can create evaluation
await canCreateEvaluation();
```

---

## Performance Considerations

### Database Indexes

The schema includes indexes for optimal query performance:

```sql
CREATE INDEX listings_user_id_idx ON public.listings(user_id);
CREATE INDEX listings_created_at_idx ON public.listings(created_at DESC);
```

**Benefits:**
- Fast lookups by user_id
- Efficient sorting by creation date
- Optimized pagination

### Query Optimization

- Use `select()` with specific columns instead of `select('*')`
- Implement pagination with `range()` and `limit()`
- Cache frequently accessed data in frontend state

### Image Storage

**Current Implementation:**
- Images are stored as base64 in `image_data` column
- Suitable for small images and simple deployment

**For Large Images:**
- Consider using Supabase Storage
- Upload images to Storage buckets
- Store only URLs in the database

---

## Deployment

### Environment Variables

For production deployment, use environment variables:

```bash
# .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Build Configuration

Update the build process to inject environment variables:

```javascript
// In supabase/client.js
const SUPABASE_CONFIG = {
    url: import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL_HERE',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE',
};
```

---

## Support and Resources

- **Supabase Documentation**: [https://supabase.com/docs](https://supabase.com/docs)
- **Supabase JavaScript Client**: [https://github.com/supabase/supabase-js](https://github.com/supabase/supabase-js)
- **Row Level Security Guide**: [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)
- **Willnicht GitHub**: [https://github.com/zaharenok/Willnicht_ui](https://github.com/zaharenok/Willnicht_ui)

---

## License

This integration is part of the Willnicht project. See the main [LICENSE](LICENSE) file for details.
