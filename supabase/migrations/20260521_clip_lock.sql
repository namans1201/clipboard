-- Add a per-clip "internal lock" flag. When TRUE, the dashboard hides the
-- clip's content behind a cover (the "locked card" visual) until the user
-- clicks Unlock. This is purely a UI affordance — it doesn't gate read
-- access at the API layer (RLS already restricts each user to their own
-- clips).
--
-- Safe to re-run.
ALTER TABLE public.clips
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;
