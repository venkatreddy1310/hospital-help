-- Appointments are written by the signed-in patient and read back through RLS.
-- Catalog rows are linked by foreign key, while `code` keeps the demo-facing id.

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 3 and 40),
  owner_id uuid not null references auth.users (id) on delete cascade,
  doctor_id uuid not null references public.doctors (id) on delete restrict,
  doctor_code text not null,
  doctor_name text not null,
  specialty text not null,
  hospital_id uuid not null references public.hospitals (id) on delete restrict,
  hospital_code text not null,
  hospital_name text not null,
  patient_kind text not null default 'self' check (patient_kind in ('self', 'family')),
  patient_id uuid,
  patient_profile_id uuid references public.profiles (id) on delete set null,
  family_member_id uuid references public.family_members (id) on delete set null,
  patient_name text not null,
  appointment_date date not null,
  appointment_time text not null check (appointment_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  consultation_type text not null check (consultation_type in ('in-person', 'online')),
  fee numeric(10, 2) not null default 0 check (fee >= 0),
  status text not null default 'booked' check (status in ('booked', 'completed', 'cancelled')),
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index appointments_owner_id_idx on public.appointments (owner_id);
create index appointments_date_idx on public.appointments (appointment_date);

create trigger set_appointments_updated_at
  before update on public.appointments
  for each row
  execute function public.set_updated_at();

alter table public.appointments enable row level security;

create policy "Owners can read their appointments"
  on public.appointments
  for select
  to authenticated
  using (owner_id = auth.uid());

create policy "Owners can book appointments"
  on public.appointments
  for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "Owners can update their appointments"
  on public.appointments
  for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Admins can review and change status from the admin console, but they cannot
-- create bookings on a patient's behalf.
create policy "Admins can read all appointments"
  on public.appointments
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update appointment status"
  on public.appointments
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
