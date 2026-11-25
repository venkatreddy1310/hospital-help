-- Corrects claim validation so a covered family member can raise a simulated
-- claim against a policy whose primary holder is the account owner (or vice
-- versa). The previous trigger required the claim patient kind to equal the
-- policy's primary patient kind, which rejected valid covered members.
-- Additive only: replaces the trigger function in place.

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

  if new.patient_id <> policy_record.patient_id
    and not new.patient_id = any(policy_record.covered_member_ids) then
    raise exception 'The claim patient must be covered by the selected policy.';
  end if;

  if new.patient_id = new.owner_id then
    if new.patient_kind <> 'self' then
      raise exception 'A claim for the account owner must use the self patient kind.';
    end if;
  elsif exists (
    select 1 from public.family_members
    where id = new.patient_id and owner_id = new.owner_id
  ) then
    if new.patient_kind <> 'family' then
      raise exception 'A claim for a family member must use the family patient kind.';
    end if;
  else
    raise exception 'The claim patient must be the account owner or an owned family member.';
  end if;

  return new;
end;
$$;

comment on function public.assert_claim_relationship_owned() is
  'Validates that a simulated claim policy and patient belong to the owner and that the patient kind matches the actual patient record.';
