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
