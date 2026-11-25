-- User-entered demo policies. Owner-only access, with a server-side trigger
-- that keeps every policy attached to a patient the owner actually owns.

create table public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  patient_kind text not null check (patient_kind in ('self', 'family')),
  patient_id uuid not null,
  provider_id uuid not null references public.insurance_providers (id) on delete restrict,
  provider_name text not null,
  plan_name text not null check (char_length(btrim(plan_name)) between 1 and 120),
  policy_number text not null check (char_length(btrim(policy_number)) between 1 and 60),
  member_id text not null check (char_length(btrim(member_id)) between 1 and 60),
  start_date date not null,
  end_date date not null,
  sum_insured numeric(14, 2) not null check (sum_insured > 0),
  covered_member_ids uuid[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint insurance_policies_dates_ordered check (end_date >= start_date)
);

create index insurance_policies_owner_id_idx on public.insurance_policies (owner_id);
create index insurance_policies_patient_idx on public.insurance_policies (patient_id);

create trigger set_insurance_policies_updated_at
  before update on public.insurance_policies
  for each row
  execute function public.set_updated_at();

create or replace function public.assert_policy_patient_owned()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  member uuid;
begin
  if new.patient_kind = 'self' then
    if new.patient_id <> new.owner_id then
      raise exception 'A self policy must belong to the account owner.';
    end if;
  elsif not exists (
    select 1
    from public.family_members
    where family_members.id = new.patient_id
      and family_members.owner_id = new.owner_id
  ) then
    raise exception 'A family policy must belong to one of the account family members.';
  end if;

  foreach member in array new.covered_member_ids loop
    if member = new.owner_id then
      continue;
    end if;
    if not exists (
      select 1
      from public.family_members
      where family_members.id = member
        and family_members.owner_id = new.owner_id
    ) then
      raise exception 'Covered members must belong to the same account.';
    end if;
  end loop;

  return new;
end;
$$;

create trigger validate_policy_patient
  before insert or update on public.insurance_policies
  for each row
  execute function public.assert_policy_patient_owned();

-- Removing a family member removes policies assigned to that member and
-- clears their coverage from other policies, matching the demo repository.
create or replace function public.remove_deleted_member_policies()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.insurance_policies
  where owner_id = old.owner_id
    and patient_id = old.id;

  update public.insurance_policies
  set covered_member_ids = array_remove(covered_member_ids, old.id)
  where owner_id = old.owner_id
    and old.id = any (covered_member_ids);

  return old;
end;
$$;

create trigger remove_family_member_policies
  after delete on public.family_members
  for each row
  execute function public.remove_deleted_member_policies();

alter table public.insurance_policies enable row level security;

create policy "Owners can read their policies"
  on public.insurance_policies
  for select
  to authenticated
  using (owner_id = auth.uid());

create policy "Owners can add policies"
  on public.insurance_policies
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "Owners can update their policies"
  on public.insurance_policies
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Owners can remove their policies"
  on public.insurance_policies
  for delete
  to authenticated
  using (owner_id = auth.uid());
