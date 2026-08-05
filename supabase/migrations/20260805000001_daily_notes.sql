-- Create partner_notes table
CREATE TABLE public.partner_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    caption TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + interval '12 hours')
);

-- Function to delete existing non-expired notes from the same sender
CREATE OR REPLACE FUNCTION public.before_insert_partner_notes()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete any existing note for this sender in this household
    DELETE FROM public.partner_notes
    WHERE household_id = NEW.household_id
      AND sender_id = NEW.sender_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce the one-note-per-sender rule
CREATE TRIGGER enforce_single_active_note
BEFORE INSERT ON public.partner_notes
FOR EACH ROW
EXECUTE FUNCTION public.before_insert_partner_notes();

-- Create note_reactions table
CREATE TABLE public.note_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES public.partner_notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.partner_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_reactions ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for partner_notes
CREATE POLICY "Users can view notes in their household"
ON public.partner_notes
FOR SELECT
USING (
    household_id = public.get_user_household_id()
);

CREATE POLICY "Users can insert notes in their household"
ON public.partner_notes
FOR INSERT
WITH CHECK (
    household_id = public.get_user_household_id()
    AND sender_id = auth.uid()
);

CREATE POLICY "Users can delete their own notes"
ON public.partner_notes
FOR DELETE
USING (
    sender_id = auth.uid()
);

-- Setup RLS Policies for note_reactions
CREATE POLICY "Users can view reactions in their household"
ON public.note_reactions
FOR SELECT
USING (
    note_id IN (
        SELECT id FROM public.partner_notes WHERE household_id = public.get_user_household_id()
    )
);

CREATE POLICY "Users can insert reactions on notes in their household"
ON public.note_reactions
FOR INSERT
WITH CHECK (
    note_id IN (
        SELECT id FROM public.partner_notes WHERE household_id = public.get_user_household_id()
    )
    AND user_id = auth.uid()
);

CREATE POLICY "Users can delete their own reactions"
ON public.note_reactions
FOR DELETE
USING (
    user_id = auth.uid()
);

-- Setup Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('daily_notes', 'daily_notes', true) ON CONFLICT (id) DO NOTHING;

-- Setup Storage Policies
CREATE POLICY "Authenticated users can upload note photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'daily_notes'
);

CREATE POLICY "Authenticated users can view note photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'daily_notes'
);

CREATE POLICY "Users can delete their own note photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'daily_notes' AND
    auth.uid() = owner
);

-- Enable Realtime
-- Note: Supabase UI handles publications, but via SQL we add it to the 'supabase_realtime' publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.note_reactions;
