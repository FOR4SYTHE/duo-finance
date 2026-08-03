-- Migration: 20260803000002_bills.sql
-- Create bills table with household isolation and RLS policies

CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'PHP',
    due_day INTEGER NOT NULL,
    due_month INTEGER,
    due_year INTEGER,
    category TEXT NOT NULL,
    budget_category_id TEXT,
    is_recurring BOOLEAN NOT NULL DEFAULT true,
    reminder_enabled BOOLEAN NOT NULL DEFAULT false,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Policies for bills
CREATE POLICY "Users can view bills in their household"
    ON public.bills FOR SELECT
    USING (household_id = public.get_user_household_id());

CREATE POLICY "Users can insert bills in their household"
    ON public.bills FOR INSERT
    WITH CHECK (household_id = public.get_user_household_id());

CREATE POLICY "Users can update bills in their household"
    ON public.bills FOR UPDATE
    USING (household_id = public.get_user_household_id())
    WITH CHECK (household_id = public.get_user_household_id());

CREATE POLICY "Users can delete bills in their household"
    ON public.bills FOR DELETE
    USING (household_id = public.get_user_household_id());

-- Create index for faster querying
CREATE INDEX idx_bills_household_id ON public.bills(household_id);
