-- Create handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create insurance_policies table
CREATE TABLE IF NOT EXISTS public.insurance_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE NOT NULL,
    
    provider_name TEXT NOT NULL,
    plan_name TEXT,
    plan_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    policy_number TEXT,
    
    covered_members TEXT[] DEFAULT '{}'::TEXT[],
    
    premium_amount NUMERIC(10, 2) DEFAULT 0,
    premium_frequency TEXT NOT NULL DEFAULT 'Annual',
    coverage_limit NUMERIC(15, 2) DEFAULT 0,
    
    start_date DATE,
    expiry_date DATE,
    renewal_date DATE,
    
    custom_fields JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_insurance_policies_household_id ON public.insurance_policies(household_id);

-- Enable RLS
ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

-- Standard household RLS policies
CREATE POLICY "Users can view their household's insurance policies"
    ON public.insurance_policies FOR SELECT
    USING (household_id = get_user_household_id());

CREATE POLICY "Users can insert their household's insurance policies"
    ON public.insurance_policies FOR INSERT
    WITH CHECK (household_id = get_user_household_id());

CREATE POLICY "Users can update their household's insurance policies"
    ON public.insurance_policies FOR UPDATE
    USING (household_id = get_user_household_id())
    WITH CHECK (household_id = get_user_household_id());

CREATE POLICY "Users can delete their household's insurance policies"
    ON public.insurance_policies FOR DELETE
    USING (household_id = get_user_household_id());

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at_insurance_policies
    BEFORE UPDATE ON public.insurance_policies
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
