-- Add config JSONB column to budgets
alter table public.budgets add column config jsonb default '{}'::jsonb not null;
