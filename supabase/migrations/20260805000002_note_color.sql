-- Add color column to partner_notes
ALTER TABLE public.partner_notes 
ADD COLUMN IF NOT EXISTS color text DEFAULT 'white';
