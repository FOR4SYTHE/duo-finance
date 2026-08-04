-- Migration: 20260804000002_schools_cache.sql
-- Description: Create shared cache table for AI grounded school estimates

CREATE TABLE IF NOT EXISTS public.ai_schools_cache (
    location_query TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.ai_schools_cache ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to SELECT (read) the cache
CREATE POLICY "Authenticated users can read ai_schools_cache"
    ON public.ai_schools_cache FOR SELECT
    USING (auth.role() = 'authenticated');

-- No INSERT or UPDATE policies for users.
-- The API route will use the service_role key to bypass RLS for writing to this table.
