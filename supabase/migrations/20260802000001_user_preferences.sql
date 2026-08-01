-- Add preferences JSONB column to profiles
alter table public.profiles add column preferences jsonb default '{}'::jsonb not null;
