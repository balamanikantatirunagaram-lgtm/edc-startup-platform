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
ALTER TABLE public.investor_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.incubator_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_bookmarks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.viksit_bharat_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_impact_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts DISABLE ROW LEVEL SECURITY;
