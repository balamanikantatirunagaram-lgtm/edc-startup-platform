-- Create admins table
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
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
