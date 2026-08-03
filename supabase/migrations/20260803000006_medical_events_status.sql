-- Migration: 20260803000006_medical_events_status.sql
-- Description: Add status column to medical_events for claim resolution

alter table public.medical_events 
add column status text not null default 'Resolved';

-- Create an index to quickly find pending claims
create index idx_medical_events_status on public.medical_events(status);
