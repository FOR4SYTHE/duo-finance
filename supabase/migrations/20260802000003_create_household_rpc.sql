-- RPC for securely creating a household and joining it immediately
create or replace function public.create_household(invite_code_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household_id uuid;
begin
  -- 1. Insert the new household
  insert into public.households (invite_code)
  values (invite_code_input)
  returning id into new_household_id;
  
  -- 2. Update the caller's profile to belong to this new household
  update public.profiles 
  set household_id = new_household_id 
  where id = auth.uid();
  
  -- 3. Initialize household settings
  insert into public.household_settings (household_id, primary_currency)
  values (new_household_id, 'PHP');

  -- 4. Initialize an empty budget
  insert into public.budgets (household_id)
  values (new_household_id);

  return new_household_id;
exception
  when unique_violation then
    -- If the invite_code already exists, return null so the client can retry
    return null;
end;
$$;
