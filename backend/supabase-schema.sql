-- ==============================================================================
-- PlacePrep AI Database Schema for Supabase (PostgreSQL)
-- Run this script in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  target_role TEXT DEFAULT 'Software Engineer',
  college_year TEXT DEFAULT 'Final Year (Class of 2026)',
  preparation_progress INTEGER DEFAULT 0 CHECK (preparation_progress >= 0 AND preparation_progress <= 100),
  daily_streak INTEGER DEFAULT 1 CHECK (daily_streak >= 0),
  interviews_completed INTEGER DEFAULT 0 CHECK (interviews_completed >= 0),
  topics_covered INTEGER DEFAULT 0 CHECK (topics_covered >= 0),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- 3. Trigger to automatically refresh updated_at on record changes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow backend service / API calls to interact with users
-- If using SUPABASE_SERVICE_ROLE_KEY, it bypasses RLS automatically.
-- For anon key access, we define a policy for public backend access.
CREATE POLICY "Allow service and public backend access"
ON public.users
FOR ALL
TO public
USING (true)
WITH CHECK (true);
