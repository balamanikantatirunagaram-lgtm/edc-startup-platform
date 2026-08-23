-- ============================================================================
-- Migration 003 (v2): Remap legacy mentor ids -> auth.users (SAFE VERSION)
--
-- Context: students request mentorship with an id from the public `mentors`
-- profile table. When a mentor was created via web-admin, that row's id IS the
-- auth.users id, so everything already matches. Only hand-seeded legacy rows
-- (random UUIDs, absent from auth.users) need remapping.
--
-- Matching (mentors has NO username column): compares the mentor's NAME against
-- each auth account's metadata.username or email local-part (@mentor.com).
-- Rows whose mentor_id is already a valid auth id are left untouched, so this
-- is always safe to run and typically updates 0 rows.
-- ============================================================================

-- mentorship_requests.mentor_id
UPDATE public.mentorship_requests mr
SET mentor_id = au.id
FROM public.mentors m
JOIN auth.users au
  ON lower(au.raw_user_meta_data->>'username') = lower(m.name)
  OR split_part(lower(au.email), '@', 1) = lower(m.name)
WHERE mr.mentor_id = m.id
  AND NOT EXISTS (SELECT 1 FROM auth.users x WHERE x.id = mr.mentor_id);

-- mentor_messages.mentor_id
UPDATE public.mentor_messages mm
SET mentor_id = au.id
FROM public.mentors m
JOIN auth.users au
  ON lower(au.raw_user_meta_data->>'username') = lower(m.name)
  OR split_part(lower(au.email), '@', 1) = lower(m.name)
WHERE mm.mentor_id = m.id
  AND NOT EXISTS (SELECT 1 FROM auth.users x WHERE x.id = mm.mentor_id);

-- mentor_messages.sender_id (mentor sending a reply)
UPDATE public.mentor_messages mm
SET sender_id = au.id
FROM public.mentors m
JOIN auth.users au
  ON lower(au.raw_user_meta_data->>'username') = lower(m.name)
  OR split_part(lower(au.email), '@', 1) = lower(m.name)
WHERE mm.sender_id = m.id
  AND NOT EXISTS (SELECT 1 FROM auth.users x WHERE x.id = mm.sender_id);
