-- Migration: 20260803000001_cartify.sql
-- Description: Create cartify_templates and cartify_saved_trips tables

-- Templates for Planned Trips
create table public.cartify_templates (
    id uuid primary key default gen_random_uuid(),
    household_id uuid references public.households(id) on delete cascade not null,
    created_by uuid references public.profiles(id) on delete set null,
    name text not null,
    items jsonb not null default '[]'::jsonb,
    created_at timestamptz default now()
);

-- In-progress trips saved for later
create table public.cartify_saved_trips (
    id uuid primary key default gen_random_uuid(),
    household_id uuid references public.households(id) on delete cascade not null,
    created_by uuid references public.profiles(id) on delete set null,
    budget numeric not null,
    mode text not null,
    items jsonb not null default '[]'::jsonb,
    scheduled_trip_id uuid,
    created_at timestamptz default now()
);

-- RLS Policies for cartify_templates
alter table public.cartify_templates enable row level security;

create policy "Users can view templates in their household"
    on public.cartify_templates for select
    using (household_id = public.get_user_household_id());

create policy "Users can insert templates in their household"
    on public.cartify_templates for insert
    with check (household_id = public.get_user_household_id());

create policy "Users can update templates in their household"
    on public.cartify_templates for update
    using (household_id = public.get_user_household_id());

create policy "Users can delete templates in their household"
    on public.cartify_templates for delete
    using (household_id = public.get_user_household_id());

-- RLS Policies for cartify_saved_trips
alter table public.cartify_saved_trips enable row level security;

create policy "Users can view saved trips in their household"
    on public.cartify_saved_trips for select
    using (household_id = public.get_user_household_id());

create policy "Users can insert saved trips in their household"
    on public.cartify_saved_trips for insert
    with check (household_id = public.get_user_household_id());

create policy "Users can update saved trips in their household"
    on public.cartify_saved_trips for update
    using (household_id = public.get_user_household_id());

create policy "Users can delete saved trips in their household"
    on public.cartify_saved_trips for delete
    using (household_id = public.get_user_household_id());
