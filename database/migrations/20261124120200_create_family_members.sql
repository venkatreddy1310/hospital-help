-- Family profiles belong to exactly one account. Policies are owner-only; an
-- admin cannot read another household's dependent records from the browser.

create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  relationship text not null check (relationship in ('Mother', 'Father', 'Spouse', 'Child', 'Sibling', 'Other')),
  full_name text not null check (char_length(btrim(full_name)) between 2 and 80),
  date_of_birth date not null check (date_of_birth <= current_date),
  gender text not null check (gender in ('female', 'male', 'non-binary', 'prefer-not-to-say')),
  phone text not null default '' check (char_length(phone) <= 15),
  blood_group text not null
    check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown')),
  address_line text not null default '' check (char_length(address_line) <= 200),
  city text not null default '' check (char_length(city) <= 80),
  emergency_contact_name text not null default '' check (char_length(emergency_contact_name) <= 80),
  emergency_contact_phone text not null default '' check (char_length(emergency_contact_phone) <= 15),
  allergies text[] not null default '{}',
  medical_conditions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index family_members_owner_id_idx on public.family_members (owner_id);

create trigger set_family_members_updated_at
  before update on public.family_members
  for each row
  execute function public.set_updated_at();

alter table public.family_members enable row level security;

create policy "Owners can read their family members"
  on public.family_members
  for select
  to authenticated
  using (owner_id = auth.uid());

create policy "Owners can add family members"
  on public.family_members
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "Owners can update their family members"
  on public.family_members
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Owners can remove their family members"
  on public.family_members
  for delete
  to authenticated
  using (owner_id = auth.uid());
