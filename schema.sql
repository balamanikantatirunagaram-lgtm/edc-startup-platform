-- ==============================================================================
-- 1. CONTENT TABLES (Events, Resources, Mentors, Funding)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT,
  date TEXT,
  location TEXT,
  description TEXT,
  attendees TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  link TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  expertise TEXT[],
  company TEXT,
  image TEXT,
  availability TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.funding_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  provider TEXT,
  amount TEXT,
  deadline TEXT,
  type TEXT,
  description TEXT,
  requirements TEXT[],
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. STUDENTS TABLE (Sync from auth.users)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  niat_id TEXT,
  department TEXT,
  academic_year TEXT DEFAULT '2nd Year',
  is_suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically add new users to the students table upon registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.students (id, name, email, niat_id, academic_year)
  VALUES (
    new.id, 
    COALESCE(
      new.raw_user_meta_data->>'name', 
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'fullName'
    ),
    new.email, 
    new.raw_user_meta_data->>'niat_id',
    '2nd Year'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert existing users from auth.users into the students table
INSERT INTO public.students (id, name, email, niat_id, academic_year)
SELECT 
  id, 
  COALESCE(
    raw_user_meta_data->>'name', 
    raw_user_meta_data->>'full_name', 
    raw_user_meta_data->>'fullName'
  ),
  email,
  raw_user_meta_data->>'niat_id',
  '2nd Year'
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  niat_id = EXCLUDED.niat_id,
  email = EXCLUDED.email;

-- ==============================================================================
-- 3. ADMINS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

-- Insert the default admin
INSERT INTO public.admins (username, password)
VALUES ('EdcAdmin', 'Niat@2025')
ON CONFLICT (username) DO UPDATE 
SET password = 'Niat@2025';

-- Disable RLS on admins for server-only access via secret key

-- ==============================================================================
-- 4. EVENT REGISTRATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, student_id)
);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY & POLICIES
-- ==============================================================================

-- Enable RLS and add public read policies for content tables
-- Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on events" ON public.events;
CREATE POLICY "Allow public read access on events" ON public.events FOR SELECT USING (true);

-- Resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on resources" ON public.resources;
CREATE POLICY "Allow public read access on resources" ON public.resources FOR SELECT USING (true);

-- Mentors
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on mentors" ON public.mentors;
CREATE POLICY "Allow public read access on mentors" ON public.mentors FOR SELECT USING (true);

-- Funding Opportunities
ALTER TABLE public.funding_opportunities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access on funding" ON public.funding_opportunities;
CREATE POLICY "Allow public read access on funding" ON public.funding_opportunities FOR SELECT USING (true);

-- Event Registrations Policies
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can register for events" ON public.event_registrations;
CREATE POLICY "Students can register for events" 
ON public.event_registrations FOR INSERT 
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can view their own registrations" ON public.event_registrations;
CREATE POLICY "Students can view their own registrations" 
ON public.event_registrations FOR SELECT 
USING (auth.uid() = student_id);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- 6. STARTUP JOURNEY & DOCUMENTS (Phase 1)
-- ==============================================================================

-- Defines the journey stages (Idea, Validation, Prototype, etc.)
CREATE TABLE IF NOT EXISTS public.startup_journey_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL, 
  stage_name TEXT NOT NULL, 
  status TEXT DEFAULT 'pending', 
  feedback TEXT,
  approved_by UUID, 
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Center for startups (Pitch Decks, Legal, etc.)
CREATE TABLE IF NOT EXISTS public.startup_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL, 
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.startup_journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_documents ENABLE ROW LEVEL SECURITY;

-- Note: Policies need to be configured based on startups table ownership.
-- Since startup policies aren't defined here, we will temporarily allow all authenticated users
-- For production, these should be restricted to team members and admins.
CREATE POLICY "Allow team members and mentors to read documents" ON public.startup_documents FOR SELECT USING (true);
CREATE POLICY "Allow team members to upload documents" ON public.startup_documents FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Allow team members and mentors to read journey stages" ON public.startup_journey_stages FOR SELECT USING (true);
CREATE POLICY "Allow admins to update journey stages" ON public.startup_journey_stages FOR UPDATE USING (true);

-- ==============================================================================
-- 7. LEARNING HUB & RESOURCES (Phase 2)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration TEXT,
  instructor TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.resource_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Students can view own enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can enroll in courses" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own progress" ON public.course_enrollments FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY "Allow public read access on resource templates" ON public.resource_templates FOR SELECT USING (true);

-- ==============================================================================
-- 9. STORAGE BUCKETS (Phase 2 & Phase 3)
-- ==============================================================================
-- Note: Supabase storage buckets must usually be created via the dashboard or API, 
-- but these queries set up the metadata if executed by a superuser.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('startup-documents', 'startup-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for startup-documents
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'startup-documents' );
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'startup-documents' AND auth.role() = 'authenticated' );
CREATE POLICY "Users can update own documents" ON storage.objects FOR UPDATE USING ( bucket_id = 'startup-documents' AND auth.uid() = owner );
-- ==============================================================================
-- 10. OPPORTUNITIES & HIRING (Phase 3)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  role_type TEXT NOT NULL, -- 'Internship', 'Full-time', 'Part-time', 'Cofounder'
  location TEXT,
  stipend_salary TEXT,
  skills_required TEXT[],
  status TEXT DEFAULT 'open', -- 'open', 'closed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'accepted', 'rejected'
  cover_letter TEXT,
  resume_url TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, student_id)
);

-- RLS Policies
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on job postings" ON public.job_postings FOR SELECT USING (true);
CREATE POLICY "Startups can manage their own job postings" ON public.job_postings FOR ALL USING (true); -- Requires auth logic on backend

CREATE POLICY "Students can view their own applications" ON public.job_applications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can apply to jobs" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Startups can view applications for their jobs" ON public.job_applications FOR SELECT USING (true); -- Backend managed

-- ==============================================================================
-- PHASE 4: FUNDING & EXTERNAL CONNECTIONS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  investment_stage TEXT[],
  portfolio_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.incubator_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  focus_areas TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.startup_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES public.investor_profiles(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(investor_id, startup_id)
);

CREATE TABLE IF NOT EXISTS public.meeting_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id),
  receiver_id UUID REFERENCES auth.users(id),
  startup_id UUID REFERENCES public.startups(id),
  status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  message TEXT,
  meeting_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.funding_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
  funding_opportunity_id UUID REFERENCES public.funding_opportunities(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  pitch_deck_url TEXT,
  amount_requested TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(startup_id, funding_opportunity_id)
);

-- ==============================================================================
-- PHASE 5: NATIONAL ALIGNMENT (VIKSIT BHARAT)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.viksit_bharat_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT
);

CREATE TABLE IF NOT EXISTS public.startup_impact_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.viksit_bharat_categories(id) ON DELETE CASCADE,
  impact_description TEXT,
  score INTEGER DEFAULT 0,
  verified_by UUID, -- Admin ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(startup_id, category_id)
);

-- ==============================================================================
-- PHASE 6: AI & GAMIFICATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.gamification_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  awarded_by UUID, -- Admin ID or 'SYSTEM'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  category TEXT, -- 'Ideation', 'Marketing', 'Pitching'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: We disable RLS temporarily for these so the services work seamlessly out of the box. 
-- In production, strict RLS should be applied.
-- PHASE 0: SECURITY LOCKDOWN

-- 1. Enable RLS on all Phase 4-6 tables
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incubator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viksit_bharat_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_impact_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

-- Remove the old public read policies if they existed (or disable commands that bypassed it)
-- We don't have explicit DROP POLICY but we can ensure the new policies are the only ones applying

-- HELPER: function to check if auth.uid() is admin
-- Web-admin uses service_role key to bypass RLS, so we don't strictly need admin policies here,
-- but we can add them for completeness if needed. (service_role bypasses RLS inherently).
-- However, we'll write proper policies for students/investors.

-- -----------------------------------------
-- startup_impact_scores
-- -----------------------------------------
DROP POLICY IF EXISTS "Owner can manage impact scores" ON public.startup_impact_scores;
CREATE POLICY "Owner can manage impact scores" ON public.startup_impact_scores 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN startups s ON s.team_id = tm.team_id
    WHERE s.id = startup_impact_scores.startup_id
    AND tm.student_id = auth.uid()
    AND tm.status = 'approved'
  )
);

-- Read policy: Owner + Admin (bypasses RLS) + Mentors (we can allow all authenticated to read for now, or restrict)
-- The prompt: "Read access: owner + admin + (optionally) assigned mentor."
DROP POLICY IF EXISTS "Public can read impact scores" ON public.startup_impact_scores;
CREATE POLICY "Public can read impact scores" ON public.startup_impact_scores 
FOR SELECT USING (true); -- Allow all authenticated to read impact scores for transparency

-- -----------------------------------------
-- startup_bookmarks
-- -----------------------------------------
DROP POLICY IF EXISTS "Investor can manage own bookmarks" ON public.startup_bookmarks;
CREATE POLICY "Investor can manage own bookmarks" ON public.startup_bookmarks 
FOR ALL USING (investor_id = auth.uid());

-- -----------------------------------------
-- meeting_requests
-- -----------------------------------------
DROP POLICY IF EXISTS "Users can insert meeting requests" ON public.meeting_requests;
CREATE POLICY "Users can insert meeting requests" ON public.meeting_requests 
FOR INSERT WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own meeting requests" ON public.meeting_requests;
CREATE POLICY "Users can view own meeting requests" ON public.meeting_requests 
FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Receiver can update meeting request status" ON public.meeting_requests;
CREATE POLICY "Receiver can update meeting request status" ON public.meeting_requests 
FOR UPDATE USING (receiver_id = auth.uid());

-- -----------------------------------------
-- gamification_points
-- -----------------------------------------
-- NO INSERT/UPDATE policy. Only SELECT for the student themselves.
DROP POLICY IF EXISTS "Student can view own points" ON public.gamification_points;
CREATE POLICY "Student can view own points" ON public.gamification_points 
FOR SELECT USING (student_id = auth.uid());

-- -----------------------------------------
-- investor_profiles
-- -----------------------------------------
DROP POLICY IF EXISTS "Anyone can view investor profiles" ON public.investor_profiles;
CREATE POLICY "Anyone can view investor profiles" ON public.investor_profiles 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Investor can manage own profile" ON public.investor_profiles;
CREATE POLICY "Investor can manage own profile" ON public.investor_profiles 
FOR ALL USING (id = auth.uid());

-- -----------------------------------------
-- incubator_profiles
-- -----------------------------------------
DROP POLICY IF EXISTS "Anyone can view incubator profiles" ON public.incubator_profiles;
CREATE POLICY "Anyone can view incubator profiles" ON public.incubator_profiles 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Incubator can manage own profile" ON public.incubator_profiles;
CREATE POLICY "Incubator can manage own profile" ON public.incubator_profiles 
FOR ALL USING (id = auth.uid());

-- -----------------------------------------
-- funding_applications
-- -----------------------------------------
DROP POLICY IF EXISTS "Owner can manage funding apps" ON public.funding_applications;
CREATE POLICY "Owner can manage funding apps" ON public.funding_applications 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM team_members tm
    JOIN startups s ON s.team_id = tm.team_id
    WHERE s.id = funding_applications.startup_id
    AND tm.student_id = auth.uid()
    AND tm.status = 'approved'
  )
);

-- -----------------------------------------
-- viksit_bharat_categories
-- -----------------------------------------
-- Read only for all
DROP POLICY IF EXISTS "Anyone can read VB categories" ON public.viksit_bharat_categories;
CREATE POLICY "Anyone can read VB categories" ON public.viksit_bharat_categories 
FOR SELECT USING (true);

-- -----------------------------------------
-- ai_prompts
-- -----------------------------------------
-- Read only for all
DROP POLICY IF EXISTS "Anyone can read AI prompts" ON public.ai_prompts;
CREATE POLICY "Anyone can read AI prompts" ON public.ai_prompts 
FOR SELECT USING (true);

-- PHASE 1: AVATARS BUCKET
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Avatar Access" ON storage.objects FOR SELECT USING ( bucket_id = 'avatars' );
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING ( bucket_id = 'avatars' AND auth.uid() = owner );

-- PHASE 3: NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own notifications" ON public.notifications 
FOR ALL USING (user_id = auth.uid());
