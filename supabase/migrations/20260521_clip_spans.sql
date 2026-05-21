-- Add per-clip layout span columns so the user can resize cards by
-- dragging the bottom-right corner and have surrounding clips reflow.
--
-- - width_span  : 1-3 grid columns (clamped to the current breakpoint at render).
-- - height_span : 1-3 grid row units (each row unit ≈ one default card height).
--
-- Existing rows default to 1x1 (current visual behaviour), so this is a
-- non-breaking deploy: pre-migration UIs ignore the unknown columns; the
-- post-migration UI shows everything as 1x1 until the user resizes.
--
-- Safe to re-run.
ALTER TABLE public.clips
  ADD COLUMN IF NOT EXISTS width_span  INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS height_span INT NOT NULL DEFAULT 1;

-- Constrain values to the supported range. Wrapped in DO blocks so the
-- script remains idempotent (re-running won't error on existing constraints).
DO $$ BEGIN
  ALTER TABLE public.clips
    ADD CONSTRAINT clips_width_span_range  CHECK (width_span  BETWEEN 1 AND 3);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.clips
    ADD CONSTRAINT clips_height_span_range CHECK (height_span BETWEEN 1 AND 3);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
