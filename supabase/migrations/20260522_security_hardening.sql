-- ============================================================================
-- Security hardening migration
--
-- 1. Tighten RLS UPDATE policies on `clips` and `groups` by adding WITH CHECK,
--    so a user can't reassign one of their rows' `user_id` to someone else
--    via UPDATE (the policy previously only constrained USING/SELECT side).
--
-- 2. Replace the client-modifiable session-expiry stored in `user_metadata`
--    with a server-side `user_sessions` table. RLS makes it read-only for
--    the user; writes go through a SECURITY DEFINER function which caps
--    durations (15 min for public devices, 30 days for trusted devices).
--
-- Safe to re-run.
-- ============================================================================

-- ── 1. UPDATE policies with WITH CHECK ─────────────────────────────────────
DROP POLICY IF EXISTS "Users can update their own clips" ON public.clips;
CREATE POLICY "Users can update their own clips"
    ON public.clips FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own groups" ON public.groups;
CREATE POLICY "Users can update their own groups"
    ON public.groups FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ── 2. user_sessions table + SECURITY DEFINER setter ───────────────────────

CREATE TABLE IF NOT EXISTS public.user_sessions (
    user_id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public_device BOOLEAN     NOT NULL DEFAULT FALSE,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- expires_at is the authoritative point at which middleware will sign
    -- the user out and redirect them to /login?reason=session_expired.
    expires_at       TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- The user is allowed to read their own row (the client-side heartbeat
-- uses it to pre-empt the server-side cutoff and present a clean exit
-- instead of letting the user's next request 307 to login). NO write
-- policies — INSERT/UPDATE/DELETE are blocked for everyone except the
-- SECURITY DEFINER function below.
DROP POLICY IF EXISTS "Read own session" ON public.user_sessions;
CREATE POLICY "Read own session"
    ON public.user_sessions FOR SELECT
    USING (auth.uid() = user_id);

-- record_session_start(is_public)
-- ---------------------------------
-- Called on every successful login. Computes the expiry server-side and
-- upserts the row. SECURITY DEFINER lets it bypass RLS while still
-- restricting to the calling user via auth.uid().
CREATE OR REPLACE FUNCTION public.record_session_start(p_is_public BOOLEAN)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid     UUID := auth.uid();
  v_expires TIMESTAMPTZ;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Caps enforced here in SQL — the client cannot extend them.
  -- Public device:  15 minutes total (matches the old
  --                 PUBLIC_DEVICE_SESSION_DURATION_MS).
  -- Trusted device: 30 days total (previously unbounded ~400d cookie).
  IF p_is_public THEN
    v_expires := NOW() + INTERVAL '15 minutes';
  ELSE
    v_expires := NOW() + INTERVAL '30 days';
  END IF;

  INSERT INTO public.user_sessions (user_id, is_public_device, started_at, expires_at)
  VALUES (v_uid, p_is_public, NOW(), v_expires)
  ON CONFLICT (user_id) DO UPDATE
    SET is_public_device = EXCLUDED.is_public_device,
        started_at       = EXCLUDED.started_at,
        expires_at       = EXCLUDED.expires_at;

  RETURN v_expires;
END;
$$;

REVOKE ALL ON FUNCTION public.record_session_start(BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_session_start(BOOLEAN) TO authenticated;

-- Helpful index — though the table has at most one row per user (PK),
-- we may want to query by expiry later for cleanup jobs.
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at
    ON public.user_sessions(expires_at);
