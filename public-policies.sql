-- Enable RLS and add public read policies for content tables
-- This ensures the website (using anon key) can read the data, while only admins can write.

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

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
