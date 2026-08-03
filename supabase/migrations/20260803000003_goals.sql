-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    target_amount NUMERIC NOT NULL,
    target_date TEXT,
    saved_amount NUMERIC NOT NULL DEFAULT 0,
    is_emergency_fund BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Policies for goals
CREATE POLICY "Users can view goals in their household"
    ON goals FOR SELECT
    USING (household_id = get_user_household_id());

CREATE POLICY "Users can insert goals in their household"
    ON goals FOR INSERT
    WITH CHECK (household_id = get_user_household_id());

CREATE POLICY "Users can update goals in their household"
    ON goals FOR UPDATE
    USING (household_id = get_user_household_id())
    WITH CHECK (household_id = get_user_household_id());

CREATE POLICY "Users can delete goals in their household"
    ON goals FOR DELETE
    USING (household_id = get_user_household_id());

-- Data Migration: Extract existing goals from budgets table
INSERT INTO goals (id, household_id, created_by, name, icon, target_amount, target_date, saved_amount, is_emergency_fund, updated_at)
SELECT 
    g->>'id' as id,
    b.household_id,
    (SELECT id FROM profiles WHERE household_id = b.household_id LIMIT 1) as created_by,
    g->>'name' as name,
    g->>'icon' as icon,
    COALESCE((g->>'targetAmount')::numeric, 0) as target_amount,
    g->>'targetDate' as target_date,
    COALESCE((g->>'savedAmount')::numeric, 0) as saved_amount,
    (g->>'id' = 'goal-1') as is_emergency_fund,
    b.updated_at
FROM budgets b
CROSS JOIN jsonb_array_elements(b.goals) as g
ON CONFLICT (id) DO NOTHING;
