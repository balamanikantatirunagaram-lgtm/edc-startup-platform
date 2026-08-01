-- Sync all existing names, emails, and niat_ids from auth.users to public.students
-- This will restore any missing names that got removed.

UPDATE public.students
SET 
  name = COALESCE(
    auth.users.raw_user_meta_data->>'name', 
    auth.users.raw_user_meta_data->>'full_name', 
    auth.users.raw_user_meta_data->>'fullName'
  ),
  niat_id = auth.users.raw_user_meta_data->>'niat_id',
  email = auth.users.email
FROM auth.users
WHERE public.students.id = auth.users.id;

-- And optionally insert any missing users that failed to insert previously
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
ON CONFLICT (id) DO NOTHING;
