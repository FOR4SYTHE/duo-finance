-- Migration: 20260804000001_child_care.sql
-- Description: Create child_profiles and child_selections tables with household RLS

-- Create child_profiles table
CREATE TABLE IF NOT EXISTS public.child_profiles (
    id UUID PRIMARY KEY,
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
    nickname TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_child_profiles_household_id ON public.child_profiles(household_id);

ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view child profiles in their household"
    ON public.child_profiles FOR SELECT
    USING (household_id = get_user_household_id());

CREATE POLICY "Users can insert child profiles in their household"
    ON public.child_profiles FOR INSERT
    WITH CHECK (household_id = get_user_household_id());

CREATE POLICY "Users can update child profiles in their household"
    ON public.child_profiles FOR UPDATE
    USING (household_id = get_user_household_id());

CREATE POLICY "Users can delete child profiles in their household"
    ON public.child_profiles FOR DELETE
    USING (household_id = get_user_household_id());

-- Add updated_at trigger for child_profiles
CREATE TRIGGER handle_updated_at_child_profiles
    BEFORE UPDATE ON public.child_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create child_selections table
CREATE TABLE IF NOT EXISTS public.child_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
    child_id UUID REFERENCES public.child_profiles(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('school', 'activity', 'hospital')),
    item_id TEXT,
    item_name TEXT,
    item_data JSONB,
    mode TEXT DEFAULT 'Configured',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_child_selections_household_id ON public.child_selections(household_id);
CREATE INDEX IF NOT EXISTS idx_child_selections_child_id ON public.child_selections(child_id);

ALTER TABLE public.child_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view child selections in their household"
    ON public.child_selections FOR SELECT
    USING (household_id = get_user_household_id());

CREATE POLICY "Users can insert child selections in their household"
    ON public.child_selections FOR INSERT
    WITH CHECK (household_id = get_user_household_id());

CREATE POLICY "Users can update child selections in their household"
    ON public.child_selections FOR UPDATE
    USING (household_id = get_user_household_id());

CREATE POLICY "Users can delete child selections in their household"
    ON public.child_selections FOR DELETE
    USING (household_id = get_user_household_id());
