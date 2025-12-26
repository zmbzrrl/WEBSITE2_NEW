-- 🏗️ ADD FEEDBACK TABLE AND STORAGE BUCKET
-- Run this in your Supabase SQL Editor to add feedback functionality

-- ===== CREATE FEEDBACK TABLE =====
CREATE TABLE IF NOT EXISTS public.feedback (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    user_email TEXT NOT NULL,
    screenshots TEXT[] DEFAULT '{}', -- Array of screenshot URLs
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_agent TEXT,
    url TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== CREATE INDEXES FOR PERFORMANCE =====
CREATE INDEX IF NOT EXISTS idx_feedback_user_email ON public.feedback(user_email);
CREATE INDEX IF NOT EXISTS idx_feedback_timestamp ON public.feedback(timestamp);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);

-- ===== SET UP ROW LEVEL SECURITY =====
-- Disable RLS for development (enable in production)
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;

-- ===== GRANT PERMISSIONS =====
GRANT ALL ON public.feedback TO anon;
GRANT ALL ON public.feedback TO authenticated;

-- ===== CREATE STORAGE BUCKET FOR SCREENSHOTS =====
-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-screenshots', 'feedback-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- ===== SET UP STORAGE POLICIES =====
-- Allow anyone to upload screenshots (for feedback)
CREATE POLICY "Allow public uploads for feedback screenshots" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'feedback-screenshots');

-- Allow anyone to view screenshots (for admin review)
CREATE POLICY "Allow public access to feedback screenshots" ON storage.objects
FOR SELECT USING (bucket_id = 'feedback-screenshots');

-- ===== VERIFY SETUP =====
SELECT 'Feedback table and storage bucket setup complete!' as status;
SELECT COUNT(*) as feedback_count FROM public.feedback;
