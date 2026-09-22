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


-- ==============================================================================
-- PlacePrep Chat History: conversations + messages
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  sources JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations (user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages (conversation_id);

DROP TRIGGER IF EXISTS set_conversations_updated_at ON public.conversations;
CREATE TRIGGER set_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service and public backend access"
ON public.conversations
FOR ALL
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service and public backend access"
ON public.messages
FOR ALL
TO public
USING (true)
WITH CHECK (true);


-- ==============================================================================
-- PlacePrep Interview History: completed mock interview evaluations
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.interview_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  technical_score INTEGER NOT NULL,
  relevance_score INTEGER NOT NULL,
  communication_score INTEGER NOT NULL,
  strengths JSONB DEFAULT '[]'::jsonb,
  improvements JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  question_reviews JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interview_history_user_id ON public.interview_history (user_id);
CREATE INDEX IF NOT EXISTS idx_interview_history_session_id ON public.interview_history (session_id);
CREATE INDEX IF NOT EXISTS idx_interview_history_completed_at ON public.interview_history (completed_at DESC);

ALTER TABLE public.interview_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service and public backend access"
ON public.interview_history
FOR ALL
TO public
USING (true)
WITH CHECK (true);


-- ==============================================================================
-- PlacePrep Roadmap History: personalized placement curricula
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.roadmap_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  level TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  daily_hours NUMERIC NOT NULL,
  total_weeks INTEGER NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  weeks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_roadmap_history_user_id ON public.roadmap_history (user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_history_created_at ON public.roadmap_history (created_at DESC);

DROP TRIGGER IF EXISTS set_roadmap_history_updated_at ON public.roadmap_history;
CREATE TRIGGER set_roadmap_history_updated_at
BEFORE UPDATE ON public.roadmap_history
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.roadmap_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service and public backend access"
ON public.roadmap_history
FOR ALL
TO public
USING (true)
WITH CHECK (true);