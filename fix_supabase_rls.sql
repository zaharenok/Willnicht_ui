-- ========================================
-- FIX SUPABASE RLS POLICIES FOR WILLNICHT
-- ========================================
-- Run this in Supabase Dashboard → SQL Editor
-- This fixes the 403 Forbidden error when saving listings

-- Step 1: Add user_id column to listings table
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS user_id UUID
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Step 2: Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);

-- Step 3: Update existing records to assign them to the current user
-- (This ensures any orphaned records get assigned)
UPDATE listings
SET user_id = auth.uid()
WHERE user_id IS NULL;

-- Step 4: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can insert their own listings" ON listings;
DROP POLICY IF EXISTS "Users can view their own listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Enable read access for all users" ON listings;

-- Step 5: Create new RLS policies with user_id
CREATE POLICY "Users can insert their own listings"
ON listings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own listings"
ON listings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
ON listings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
ON listings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Step 6: Verify the policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'listings';

-- Success message
SELECT '✅ RLS policies updated successfully!' as status;
