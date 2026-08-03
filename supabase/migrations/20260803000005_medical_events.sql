-- Migration: 20260803000005_medical_events.sql
-- Description: Create medical_events table for tracking history and integrating out-of-pocket costs to the spend jar

create table public.medical_events (
    id uuid primary key default gen_random_uuid(),
    household_id uuid references public.households(id) on delete cascade not null,
    visit_date date not null,
    provider_name text not null,
    reason text,
    total_cost numeric not null default 0,
    policy_id uuid references public.insurance_policies(id) on delete set null,
    covered_amount numeric default 0,
    uncovered_amount numeric default 0,
    spend_entry_id uuid references public.spend_entries(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for efficient querying
create index idx_medical_events_household on public.medical_events(household_id);
create index idx_medical_events_visit_date on public.medical_events(visit_date desc);

-- Enable RLS
alter table public.medical_events enable row level security;

-- RLS Policies (Recursion-safe via get_user_household_id)
create policy "Users can view medical events in their household"
    on public.medical_events for select
    using (household_id = public.get_user_household_id());

create policy "Users can insert medical events in their household"
    on public.medical_events for insert
    with check (household_id = public.get_user_household_id());

create policy "Users can update medical events in their household"
    on public.medical_events for update
    using (household_id = public.get_user_household_id());

create policy "Users can delete medical events in their household"
    on public.medical_events for delete
    using (household_id = public.get_user_household_id());
