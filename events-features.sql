-- Create event_registrations table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, student_id)
);

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Allow public (authenticated) to insert their own registration
DROP POLICY IF EXISTS "Students can register for events" ON public.event_registrations;
CREATE POLICY "Students can register for events" 
ON public.event_registrations FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Allow public (authenticated) to read their own registration
DROP POLICY IF EXISTS "Students can view their own registrations" ON public.event_registrations;
CREATE POLICY "Students can view their own registrations" 
ON public.event_registrations FOR SELECT 
USING (auth.uid() = student_id);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
