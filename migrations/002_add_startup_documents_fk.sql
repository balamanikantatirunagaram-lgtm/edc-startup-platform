-- ============================================================================
-- Migration 002: Add missing FK startup_documents.startup_id -> startups(id)
-- Run in Supabase SQL Editor.
--
-- WHY: PostgREST cannot embed startups(...) on startup_documents without an
-- FK, so the Documents pages in web-admin and mentor-web fail with:
--   PGRST200: Could not find a relationship between 'startup_documents' and 'startups'
--
-- Safe to run multiple times.
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_startup_documents_startup'
  ) THEN
    -- Clean orphaned rows so the constraint validates
    DELETE FROM public.startup_documents sd
    WHERE NOT EXISTS (SELECT 1 FROM public.startups s WHERE s.id = sd.startup_id);

    ALTER TABLE public.startup_documents
      ADD CONSTRAINT fk_startup_documents_startup
      FOREIGN KEY (startup_id)
      REFERENCES public.startups(id)
      ON DELETE CASCADE;

    RAISE NOTICE 'Created fk_startup_documents_startup successfully.';
  ELSE
    RAISE NOTICE 'fk_startup_documents_startup already exists — nothing to do.';
  END IF;
END $$;
