-- One row per authenticated user. The primary key is the auth.users id so a
-- profile can never be claimed by another account.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 80),
  date_of_birth date not null check (date_of_birth <= current_date),
  gender text not null check (gender in ('female', 'male', 'non-binary', 'prefer-not-to-say')),
  phone text not null check (char_length(phone) between 10 and 15),
  blood_group text not null
    check (blood_group in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown')),
  address_line text not null check (char_length(btrim(address_line)) between 1 and 200),
  city text not null check (char_length(btrim(city)) between 1 and 80),
  emergency_contact_name text not null check (char_length(btrim(emergency_contact_name)) between 2 and 80),
  emergency_contact_phone text not null check (char_length(emergency_contact_phone) between 10 and 15),
  allergies text[] not null default '{}',
  medical_conditions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- No delete and no admin read policies: patient medical details stay scoped to
-- the owning account. Account deletion happens through auth.users cascade.
