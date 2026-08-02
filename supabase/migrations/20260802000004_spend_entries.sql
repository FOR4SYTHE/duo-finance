-- Migration: 20260802000004_spend_entries.sql
-- Description: Create spend_entries table for Spend Jar and Cartify

create table public.spend_entries (
    id uuid primary key default gen_random_uuid(),
    household_id uuid references public.households(id) on delete cascade not null,
    created_by uuid references public.profiles(id) on delete set null,
    amount numeric not null,
    currency text not null check (currency in ('PHP', 'ZAR')),
    category text,
    note text,
    timestamp_unix bigint not null,
    trip_id text,
    source_bill_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for efficient querying
create index idx_spend_entries_household_id on public.spend_entries(household_id);
create index idx_spend_entries_timestamp on public.spend_entries(timestamp_unix desc);
create index idx_spend_entries_trip_id on public.spend_entries(trip_id);

-- Enable RLS
alter table public.spend_entries enable row level security;

-- Policies (Recursion-safe via get_user_household_id)
create policy "Users can view expenses in their household"
    on public.spend_entries for select
    using (household_id = public.get_user_household_id());

create policy "Users can insert expenses in their household"
    on public.spend_entries for insert
    with check (household_id = public.get_user_household_id());

create policy "Users can update expenses in their household"
    on public.spend_entries for update
    using (household_id = public.get_user_household_id());

create policy "Users can delete expenses in their household"
    on public.spend_entries for delete
    using (household_id = public.get_user_household_id());
