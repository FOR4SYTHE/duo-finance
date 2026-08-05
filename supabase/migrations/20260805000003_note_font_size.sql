-- Add font_size column to partner_notes
ALTER TABLE public.partner_notes 
ADD COLUMN IF NOT EXISTS font_size integer DEFAULT 28;
