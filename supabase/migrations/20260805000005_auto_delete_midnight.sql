-- 1. Create a function that deletes notes created before today (Manila time)
CREATE OR REPLACE FUNCTION public.sweep_old_notes_manila_time()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete all notes where the creation date in Manila time is strictly before 
  -- the current date in Manila time.
  DELETE FROM public.partner_notes
  WHERE (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila')::date < (now() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Manila')::date;
  
  RETURN NEW;
END;
$$;

-- 2. Attach it as a BEFORE INSERT trigger
DROP TRIGGER IF EXISTS trigger_sweep_old_notes ON public.partner_notes;
CREATE TRIGGER trigger_sweep_old_notes
  BEFORE INSERT ON public.partner_notes
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.sweep_old_notes_manila_time();
