-- Owner-scoped simulated cashless and reimbursement tracking. Claim codes and
-- statuses are demo records, not communications from an insurer or hospital.

create table public.cashless_preauthorizations (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^MP-PA-[0-9]{8}-[A-Z0-9]{5}$'),
  owner_id uuid not null references auth.users (id) on delete cascade,
  patient_id uuid not null,
  patient_kind text not null check (patient_kind in ('self', 'family')),
  policy_id uuid not null references public.insurance_policies (id) on delete cascade,
  hospital_id uuid not null references public.hospitals (id) on delete restrict,
  prepared_documents text[] not null default '{}',
  status text not null default 'not-started' check (status in ('not-started', 'documents-pending', 'submitted-demo', 'under-review-demo', 'approved-simulated', 'rejected-simulated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reimbursement_claims (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^MP-RC-[0-9]{8}-[A-Z0-9]{5}$'),
  owner_id uuid not null references auth.users (id) on delete cascade,
  patient_id uuid not null,
  patient_kind text not null check (patient_kind in ('self', 'family')),
  policy_id uuid not null references public.insurance_policies (id) on delete cascade,
  hospital_id uuid not null references public.hospitals (id) on delete restrict,
  checklist jsonb not null default '{}'::jsonb check (jsonb_typeof(checklist) = 'object'),
  status text not null default 'not-started' check (status in ('not-started', 'documents-pending', 'submitted-demo', 'under-review-demo', 'approved-simulated', 'rejected-simulated')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cashless_preauthorizations_owner_id_idx on public.cashless_preauthorizations (owner_id, created_at desc);
create index cashless_preauthorizations_policy_id_idx on public.cashless_preauthorizations (policy_id);
create index cashless_preauthorizations_hospital_id_idx on public.cashless_preauthorizations (hospital_id);
create index reimbursement_claims_owner_id_idx on public.reimbursement_claims (owner_id, created_at desc);
create index reimbursement_claims_policy_id_idx on public.reimbursement_claims (policy_id);
create index reimbursement_claims_hospital_id_idx on public.reimbursement_claims (hospital_id);

create trigger set_cashless_preauthorizations_updated_at
  before update on public.cashless_preauthorizations
  for each row
  execute function public.set_updated_at();

create trigger set_reimbursement_claims_updated_at
  before update on public.reimbursement_claims
  for each row
  execute function public.set_updated_at();

create or replace function public.assert_claim_relationship_owned()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  policy_record public.insurance_policies%rowtype;
begin
  select * into policy_record
  from public.insurance_policies
  where id = new.policy_id
    and owner_id = new.owner_id;

  if not found then
    raise exception 'The claim policy must belong to the account owner.';
  end if;

  if new.patient_kind <> policy_record.patient_kind then
    raise exception 'The claim patient kind must match the policy.';
  end if;

  if new.patient_id <> policy_record.patient_id
    and not new.patient_id = any(policy_record.covered_member_ids) then
    raise exception 'The claim patient must be covered by the selected policy.';
  end if;

  if new.patient_kind = 'self' then
    if new.patient_id <> new.owner_id then
      raise exception 'A self claim must belong to the account owner.';
    end if;
  elsif not exists (
    select 1 from public.family_members
    where id = new.patient_id and owner_id = new.owner_id
  ) then
    raise exception 'A family claim must belong to an owned family member.';
  end if;

  return new;
end;
$$;

create trigger validate_cashless_claim_relationships
  before insert or update on public.cashless_preauthorizations
  for each row
  execute function public.assert_claim_relationship_owned();

create trigger validate_reimbursement_claim_relationships
  before insert or update on public.reimbursement_claims
  for each row
  execute function public.assert_claim_relationship_owned();

alter table public.cashless_preauthorizations enable row level security;
alter table public.reimbursement_claims enable row level security;

create policy "Owners and admins can read cashless workflows"
  on public.cashless_preauthorizations for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());
create policy "Owners can add cashless workflows"
  on public.cashless_preauthorizations for insert to authenticated
  with check (owner_id = auth.uid());
create policy "Owners can update cashless workflows"
  on public.cashless_preauthorizations for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners can remove cashless workflows"
  on public.cashless_preauthorizations for delete to authenticated
  using (owner_id = auth.uid());

create policy "Owners and admins can read reimbursement workflows"
  on public.reimbursement_claims for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());
create policy "Owners can add reimbursement workflows"
  on public.reimbursement_claims for insert to authenticated
  with check (owner_id = auth.uid());
create policy "Owners can update reimbursement workflows"
  on public.reimbursement_claims for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners can remove reimbursement workflows"
  on public.reimbursement_claims for delete to authenticated
  using (owner_id = auth.uid());
