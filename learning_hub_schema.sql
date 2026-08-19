-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access on course modules" ON public.course_modules FOR SELECT USING (true);

-- Create buckets for courses
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-thumbnails', 'course-thumbnails', true),
       ('course-videos', 'course-videos', true)
ON CONFLICT (id) DO NOTHING;
