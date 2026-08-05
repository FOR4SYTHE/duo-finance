-- 1. Fix the Nudge notifications regression (Table is already in publication, skipping)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 2. Drop the old before_insert_partner_notes trigger and function
DROP TRIGGER IF EXISTS before_insert_partner_notes ON public.partner_notes;
DROP FUNCTION IF EXISTS public.handle_partner_notes_insert();

-- 3. Drop expires_at column from partner_notes entirely
ALTER TABLE public.partner_notes DROP COLUMN IF EXISTS expires_at;

-- NOTE: The 30-note limit is now handled manually in the frontend via a confirmation dialog,
-- rather than a silent auto-delete database trigger.
