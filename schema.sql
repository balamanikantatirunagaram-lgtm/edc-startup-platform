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

-- Notify PostgREST to reload the schema cache so the APIs can see the new tables immediately
NOTIFY pgrst, 'reload schema';

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

-- Insert existing users from auth.users into the students table
INSERT INTO public.students (id, name, email, niat_id, academic_year)
SELECT 
  id, 
  raw_user_meta_data->>'name',
  email,
  raw_user_meta_data->>'niat_id',
  '2nd Year'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Trigger to automatically add new users to the students table upon registration
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.students (id, name, email, niat_id, academic_year)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
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

-- Notify PostgREST to reload again just to be safe
NOTIFY pgrst, 'reload schema';
