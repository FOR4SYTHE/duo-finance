-- 1. FORCE DROP the old 1-note-per-person trigger (this was the culprit!)
DROP TRIGGER IF EXISTS enforce_single_active_note ON public.partner_notes;
DROP FUNCTION IF EXISTS public.before_insert_partner_notes();

-- 2. Drop the old column
ALTER TABLE public.partner_notes DROP COLUMN IF EXISTS expires_at;

-- 3. Create the Midnight Sweeper (Lazy Delete for previous days)
CREATE OR REPLACE FUNCTION public.sweep_old_notes_manila_time()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.partner_notes
  WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila')::date < (now() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila')::date;
  RETURN NEW;
END;
$$;

-- 4. Attach Midnight Sweeper as a BEFORE INSERT trigger
DROP TRIGGER IF EXISTS trigger_sweep_old_notes ON public.partner_notes;
CREATE TRIGGER trigger_sweep_old_notes
  BEFORE INSERT ON public.partner_notes
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.sweep_old_notes_manila_time();

-- 5. Add the missing UPDATE policy so you can edit/replace notes!
DROP POLICY IF EXISTS "Users can update their own notes" ON public.partner_notes;
CREATE POLICY "Users can update their own notes"
ON public.partner_notes
FOR UPDATE
USING ( sender_id = auth.uid() )
WITH CHECK ( sender_id = auth.uid() );
