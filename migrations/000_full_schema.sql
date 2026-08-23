-- ============================================================================
-- EDC STARTUP PLATFORM — FULL DATABASE SCHEMA (v1.0, 2026-08-23)
-- ============================================================================
-- Complete, IDEMPOTENT schema for the whole platform (3 portals, 1 Supabase
-- project). Reconstructed from the LIVE database and cross-checked against
-- every query in edc-website / mentor-web / web-admin (3 full scans).
--
-- Safe to run on an EMPTY project OR on the existing project (everything is
-- guarded with IF NOT EXISTS / DO blocks). Order matters: extensions → tables
-- → constraints → indexes → triggers → RLS → storage → seeds.
--
-- Tables covered (31):
--   Core:     students, teams, team_members, startups, tasks,
--             startup_journey_stages, startup_documents
--   Mentors:  mentors (profile/marketing), mentorship_requests, mentor_messages
--   Jobs:     job_postings, job_applications
--   Content:  events, event_registrations, resources, resource_templates,
--             courses, course_modules, course_enrollments
--   Funding:  funding_opportunities, funding_applications, incubator_profiles,
--             investor_profiles, startup_bookmarks
--   Gamification/other: gamification_points, viksit_bharat_categories,
--             startup_impact_scores, meeting_requests, notifications,
--             ai_prompts, admins
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. IDENTITY-ADJACENT TABLES (reference auth.users)
-- ----------------------------------------------------------------------------

-- Students mirror auth.users 1:1 (id == auth.users.id)
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

-- Admin portal credentials (password should be bcrypt-hashed; login upgrades
-- plaintext automatically — see web-admin/src/services/auth.service.ts)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentor directory/profiles. Rows created via web-admin carry
-- id == auth.users.id so cross-portal flows resolve; legacy seeded rows may
-- have their own UUIDs (display-only fallback).
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

-- ----------------------------------------------------------------------------
-- 2. CORE TEAM / STARTUP TABLES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  leader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  problem_statement TEXT,
  proposed_solution TEXT,
  stage TEXT,
  industry TEXT,
  tagline TEXT,
  target_customers TEXT,
  business_model TEXT,
  revenue_model TEXT,
  pitch_deck_url TEXT,
  website_url TEXT,
  demo_video_url TEXT,
  status TEXT DEFAULT 'pending',
  documents TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circular FK: teams.startup_id -> startups.id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_startup') THEN
    ALTER TABLE public.teams
      ADD CONSTRAINT fk_startup FOREIGN KEY (startup_id)
      REFERENCES public.startups(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('approved','pending','invited','rejected')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One membership row per (team, student); only ONE approved team per student
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_members_team_id_student_id_key') THEN
    ALTER TABLE public.team_members
      ADD CONSTRAINT team_members_team_id_student_id_key UNIQUE (team_id, student_id);
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_approved_team_per_student
  ON public.team_members (student_id) WHERE status = 'approved';

-- Missing FK that broke PostgREST embeds (migration 001). Backfills orphans first.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_team_members_student') THEN
    INSERT INTO public.students (id, name, email, niat_id, academic_year)
    SELECT u.id,
           COALESCE(u.raw_user_meta_data->>'name', u.raw_user_meta_data->>'full_name',
                    split_part(u.email, '@', 1), u.id::text),
           u.email,
           u.raw_user_meta_data->>'niat_id',
           '2nd Year'
    FROM public.team_members tm
    JOIN auth.users u ON u.id = tm.student_id
    LEFT JOIN public.students s ON s.id = tm.student_id
    WHERE s.id IS NULL
    ON CONFLICT (id) DO NOTHING;

    ALTER TABLE public.team_members
      ADD CONSTRAINT fk_team_members_student
      FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_team_members_student ON public.team_members (student_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members (team_id);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending','in_progress','completed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tasks_team ON public.tasks (team_id);

CREATE TABLE IF NOT EXISTS public.startup_journey_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  feedback TEXT,
  approved_by UUID,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_journey_stage_unique
  ON public.startup_journey_stages (startup_id, stage_name);

CREATE TABLE IF NOT EXISTS public.startup_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL,
  title TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missing FK that broke PostgREST embeds (migration 002)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_startup_documents_startup') THEN
    DELETE FROM public.startup_documents sd
    WHERE NOT EXISTS (SELECT 1 FROM public.startups s WHERE s.id = sd.startup_id);

    ALTER TABLE public.startup_documents
      ADD CONSTRAINT fk_startup_documents_startup
      FOREIGN KEY (startup_id) REFERENCES public.startups(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 3. MENTORSHIP & MESSAGING
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.mentorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  -- auth.users id of the mentor account (mentor portal identity)
  mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending','accepted','declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'mentorship_requests_team_id_mentor_id_key') THEN
    ALTER TABLE public.mentorship_requests
      ADD CONSTRAINT mentorship_requests_team_id_mentor_id_key UNIQUE (team_id, mentor_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.mentor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_mentor_messages_thread
  ON public.mentor_messages (team_id, mentor_id, created_at);

-- ----------------------------------------------------------------------------
-- 4. JOBS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES public.startups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  role_type TEXT NOT NULL,
  location TEXT,
  stipend_salary TEXT,
  skills_required TEXT[],
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','reviewed','accepted','rejected')),
  cover_letter TEXT,
  resume_url TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'job_applications_job_id_student_id_key') THEN
    ALTER TABLE public.job_applications
      ADD CONSTRAINT job_applications_job_id_student_id_key UNIQUE (job_id, student_id);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5. CONTENT (events, resources, learning)
-- ----------------------------------------------------------------------------

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

CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'event_registrations_event_id_student_id_key') THEN
    ALTER TABLE public.event_registrations
      ADD CONSTRAINT event_registrations_event_id_student_id_key UNIQUE (event_id, student_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  link TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resource_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'course_enrollments_course_id_student_id_key') THEN
    ALTER TABLE public.course_enrollments
      ADD CONSTRAINT course_enrollments_course_id_student_id_key UNIQUE (course_id, student_id);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 6. FUNDING / NETWORK
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.funding_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  provider TEXT,
  amount TEXT,
  deadline TEXT,
  type TEXT,
  description TEXT,
  requirements TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.funding_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
  funding_opportunity_id UUID REFERENCES public.funding_opportunities(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  pitch_deck_url TEXT,
  amount_requested TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'funding_applications_startup_id_funding_opportunity_id_key') THEN
    ALTER TABLE public.funding_applications
      ADD CONSTRAINT funding_applications_startup_id_funding_opportunity_id_key UNIQUE (startup_id, funding_opportunity_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.incubator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  focus_areas TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- id must be an existing auth account (provisioned via admin panel)
CREATE TABLE IF NOT EXISTS public.investor_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  investment_stage TEXT[],
  portfolio_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.startup_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'startup_bookmarks_investor_id_startup_id_key') THEN
    ALTER TABLE public.startup_bookmarks
      ADD CONSTRAINT startup_bookmarks_investor_id_startup_id_key UNIQUE (investor_id, startup_id);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 7. GAMIFICATION / IMPACT / MISC
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.gamification_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  awarded_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
  score INTEGER,
  verified_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'startup_impact_scores_startup_id_category_id_key') THEN
    ALTER TABLE public.startup_impact_scores
      ADD CONSTRAINT startup_impact_scores_startup_id_category_id_key UNIQUE (startup_id, category_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.meeting_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  startup_id UUID REFERENCES public.startups(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  message TEXT,
  meeting_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, read);

CREATE TABLE IF NOT EXISTS public.ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. TRIGGERS — auto-create students row on signup
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (id, name, email, niat_id, academic_year)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'fullName'),
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

-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- All app services call Supabase either with the user's bearer token
-- (authenticated) or the service-role key (bypasses RLS), so policies below
-- follow the principle: content readable by authenticated users, personal rows
-- writable by owners, everything else service-role only.

ALTER TABLE public.students               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_templates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_opportunities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incubator_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_bookmarks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_points    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viksit_bharat_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_impact_scores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts             ENABLE ROW LEVEL SECURITY;

-- Students: own row only
DROP POLICY IF EXISTS "Students can view own profile" ON public.students;
CREATE POLICY "Students can view own profile" ON public.students
  FOR SELECT USING (id = auth.uid());
DROP POLICY IF EXISTS "Students can update own profile" ON public.students;
CREATE POLICY "Students can update own profile" ON public.students
  FOR UPDATE USING (id = auth.uid());

-- Public content: readable by any authenticated user; writes are service-role only
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'events','resources','resource_templates','courses','course_modules',
    'mentors','funding_opportunities','incubator_profiles','ai_prompts',
    'viksit_bharat_categories'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (auth.role() = ''authenticated'');',
                   t || '_read', t);
  END LOOP;
END $$;

-- Teams / startups / tasks / journey / docs: members of the ecosystem can read
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'teams','startups','tasks','startup_journey_stages','startup_documents',
    'team_members','job_postings'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_read', t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (auth.role() = ''authenticated'');',
                   t || '_read', t);
  END LOOP;
END $$;

-- Notifications: own rows only
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Job applications: students see/manage their own
DROP POLICY IF EXISTS "Students manage own applications" ON public.job_applications;
CREATE POLICY "Students manage own applications" ON public.job_applications
  FOR ALL USING (student_id = auth.uid());

-- Event registrations: own
DROP POLICY IF EXISTS "Students manage own registrations" ON public.event_registrations;
CREATE POLICY "Students manage own registrations" ON public.event_registrations
  FOR ALL USING (student_id = auth.uid());

-- Course enrollments: own
DROP POLICY IF EXISTS "Students manage own enrollments" ON public.course_enrollments;
CREATE POLICY "Students manage own enrollments" ON public.course_enrollments
  FOR ALL USING (student_id = auth.uid());

-- Mentorship requests / messages: participants (any authenticated read keeps
-- both portals working; writes go through service-role server actions)
DROP POLICY IF EXISTS "Authenticated read mentorship_requests" ON public.mentorship_requests;
CREATE POLICY "Authenticated read mentorship_requests" ON public.mentorship_requests
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Authenticated read mentor_messages" ON public.mentor_messages;
CREATE POLICY "Authenticated read mentor_messages" ON public.mentor_messages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Meeting requests: sender or receiver
DROP POLICY IF EXISTS "Meeting requests participants" ON public.meeting_requests;
CREATE POLICY "Meeting requests participants" ON public.meeting_requests
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Impact scores: transparent read, owner-team writes are service-role
DROP POLICY IF EXISTS "Impact scores readable" ON public.startup_impact_scores;
CREATE POLICY "Impact scores readable" ON public.startup_impact_scores
  FOR SELECT USING (auth.role() = 'authenticated');

-- Gamification: student sees own points
DROP POLICY IF EXISTS "Student can view own points" ON public.gamification_points;
CREATE POLICY "Student can view own points" ON public.gamification_points
  FOR SELECT USING (student_id = auth.uid());

-- Investors: public read, self-manage
DROP POLICY IF EXISTS "Anyone can view investor profiles" ON public.investor_profiles;
CREATE POLICY "Anyone can view investor profiles" ON public.investor_profiles
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Investor can manage own profile" ON public.investor_profiles;
CREATE POLICY "Investor can manage own profile" ON public.investor_profiles
  FOR ALL USING (id = auth.uid());

-- Admins: no policy (service-role only access from web-admin server actions)

-- ----------------------------------------------------------------------------
-- 10. STORAGE BUCKETS + POLICIES
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES
  ('startup-documents', 'startup-documents', true),
  ('avatars',           'avatars',           true),
  ('event-banners',     'event-banners',     true),
  ('course-thumbnails', 'course-thumbnails', true),
  ('course-videos',     'course-videos',     true),
  ('resumes',           'resumes',           true)
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE b TEXT;
BEGIN
  FOREACH b IN ARRAY ARRAY[
    'startup-documents','avatars','event-banners','course-thumbnails',
    'course-videos','resumes'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects;', b || '_public_read');
    EXECUTE format('CREATE POLICY %I ON storage.objects FOR SELECT USING (bucket_id = %L);',
                   b || '_public_read', b);
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects;', b || '_auth_upload');
    EXECUTE format(
      'CREATE POLICY %I ON storage.objects FOR INSERT WITH CHECK (bucket_id = %L AND auth.role() = ''authenticated'');',
      b || '_auth_upload', b);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- 11. SEED DATA (safe re-runs)
-- ----------------------------------------------------------------------------

-- Default admin — CHANGE THE PASSWORD after first login (login auto-upgrades
-- to bcrypt). TODO: rotate before production.
INSERT INTO public.admins (username, password)
VALUES ('EdcAdmin', 'Niat@2025')
ON CONFLICT (username) DO NOTHING;

-- Viksit Bharat categories (module currently stubbed in UI; table ready)
INSERT INTO public.viksit_bharat_categories (name, description, icon) VALUES
  ('Innovation', 'Novelty and originality of the solution', 'lightbulb'),
  ('Employment Potential', 'Jobs created or enabled', 'users'),
  ('Sustainability', 'Environmental and social sustainability', 'leaf'),
  ('Digital Inclusion', 'Reach across digital divides', 'globe')
ON CONFLICT (name) DO NOTHING;

-- Backfill students for users that predate the trigger (idempotent)
INSERT INTO public.students (id, name, email, niat_id, academic_year)
SELECT u.id,
       COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
       u.email,
       u.raw_user_meta_data->>'niat_id',
       '2nd Year'
FROM auth.users u
LEFT JOIN public.students s ON s.id = u.id
WHERE s.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
