create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    household_id uuid references public.households(id) on delete cascade not null,
    from_user_id uuid references auth.users(id) on delete cascade not null,
    to_user_id uuid references auth.users(id) on delete cascade not null,
    type text not null,
    message text,
    read boolean default false not null
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Users can read their own notifications"
    on public.notifications for select
    using (auth.uid() = to_user_id);

create policy "Users can insert notifications for their household"
    on public.notifications for insert
    with check (
        auth.uid() = from_user_id and 
        exists (
            select 1 from public.profiles 
            where profiles.id = auth.uid() 
            and profiles.household_id = notifications.household_id
        )
    );

create policy "Users can update their own notifications"
    on public.notifications for update
    using (auth.uid() = to_user_id)
    with check (auth.uid() = to_user_id);

create policy "Users can delete their own notifications"
    on public.notifications for delete
    using (auth.uid() = to_user_id);

-- Add realtime replica identity
alter publication supabase_realtime add table public.notifications;
