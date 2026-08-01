-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- HOUSEHOLDS
create table public.households (
  id uuid default uuid_generate_v4() primary key,
  invite_code text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  household_id uuid references public.households(id) on delete set null,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Function to get the user's household_id bypassing RLS
create or replace function public.get_user_household_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select household_id from public.profiles where id = auth.uid();
$$;

-- RLS for households
alter table public.households enable row level security;

-- Users can view their own household
create policy "Users can view their own household"
on public.households
for select
to authenticated
using (id = public.get_user_household_id());

-- Users can update their own household
create policy "Users can update their own household"
on public.households
for update
to authenticated
using (id = public.get_user_household_id());

-- Allow anyone to create a household
create policy "Users can create households"
on public.households
for insert
to authenticated
with check (true);

-- RLS for profiles
alter table public.profiles enable row level security;

-- Users can view their own profile, or profiles in their household
create policy "Profiles are viewable by self and household members"
on public.profiles
for select
to authenticated
using (
  id = auth.uid() or 
  household_id = public.get_user_household_id()
);

-- Users can insert their own profile
create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

-- Users can update their own profile
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid());

-- HOUSEHOLD SETTINGS
create table public.household_settings (
  household_id uuid references public.households(id) on delete cascade primary key,
  primary_currency text default 'PHP' not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.household_settings enable row level security;

create policy "Users can view their household settings"
on public.household_settings
for select
to authenticated
using (household_id = public.get_user_household_id());

create policy "Users can insert their household settings"
on public.household_settings
for insert
to authenticated
with check (household_id = public.get_user_household_id());

create policy "Users can update their household settings"
on public.household_settings
for update
to authenticated
using (household_id = public.get_user_household_id());

-- BUDGETS
create table public.budgets (
  id uuid default uuid_generate_v4() primary key,
  household_id uuid references public.households(id) on delete cascade not null,
  period text not null default 'monthly',
  hero_target numeric default 0 not null,
  categories jsonb default '[]'::jsonb not null,
  goals jsonb default '[]'::jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(household_id)
);

alter table public.budgets enable row level security;

create policy "Users can view their household budget"
on public.budgets
for select
to authenticated
using (household_id = public.get_user_household_id());

create policy "Users can insert their household budget"
on public.budgets
for insert
to authenticated
with check (household_id = public.get_user_household_id());

create policy "Users can update their household budget"
on public.budgets
for update
to authenticated
using (household_id = public.get_user_household_id());

-- Set up auto-profile creation on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RPC for securely joining a household by invite code
create or replace function public.join_household(invite_code_input text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  target_household_id uuid;
begin
  select id into target_household_id from public.households where invite_code = invite_code_input;
  
  if target_household_id is null then
    return false;
  end if;
  
  update public.profiles set household_id = target_household_id where id = auth.uid();
  return true;
end;
$$;
