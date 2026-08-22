-- ============================================================================
-- Migration: Add missing FK team_members.student_id -> public.students(id)
-- Run in Supabase SQL Editor (Dashboard → SQL → New query → paste → Run)
--
-- WHY: team_members.student_id currently references auth.users(id) only.
-- PostgREST cannot detect a relationship between team_members and students
-- without this FK, so every `.select('..., students(...)')` embed fails with:
--   PGRST200: Could not find a relationship between 'team_members' and 'students'
-- That made approved members invisible on startup dashboards.
--
-- Safe to run multiple times (guarded by constraint-exists check).
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_team_members_student'
  ) THEN
    -- Backfill any orphaned membership rows so the FK can validate cleanly
    INSERT INTO public.students (id, name, email, niat_id, academic_year)
    SELECT
      u.id,
      COALESCE(
        u.raw_user_meta_data->>'name',
        u.raw_user_meta_data->>'full_name',
        split_part(u.email, '@', 1),
        u.id::text
      ),
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
      FOREIGN KEY (student_id)
      REFERENCES public.students(id)
      ON DELETE CASCADE;

    RAISE NOTICE 'Created fk_team_members_student successfully.';
  ELSE
    RAISE NOTICE 'fk_team_members_student already exists — nothing to do.';
  END IF;
END $$;
