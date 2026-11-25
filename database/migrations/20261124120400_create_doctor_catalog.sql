-- Simulated specialist directory plus the many-to-many hospital affiliation.
-- `code` matches the demo catalog ids used by the booking flow.

create table public.doctors (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 2 and 60),
  name text not null,
  specialty text not null,
  experience_years integer not null default 0 check (experience_years >= 0),
  qualifications text[] not null default '{}',
  bio text not null default '',
  languages text[] not null default '{}',
  consultation_fee numeric(10, 2) not null default 0 check (consultation_fee >= 0),
  consultation_types text[] not null default '{}'
    check (consultation_types <@ array['in-person', 'online']::text[]),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index doctors_specialty_idx on public.doctors (specialty);

create trigger set_doctors_updated_at
  before update on public.doctors
  for each row
  execute function public.set_updated_at();

create table public.doctor_hospitals (
  doctor_id uuid not null references public.doctors (id) on delete cascade,
  hospital_id uuid not null references public.hospitals (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (doctor_id, hospital_id)
);

create index doctor_hospitals_hospital_id_idx on public.doctor_hospitals (hospital_id);

alter table public.doctors enable row level security;
alter table public.doctor_hospitals enable row level security;

create policy "Specialists are publicly readable"
  on public.doctors
  for select
  to anon, authenticated
  using (true);

create policy "Admins manage specialists"
  on public.doctors
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Specialist affiliations are publicly readable"
  on public.doctor_hospitals
  for select
  to anon, authenticated
  using (true);

create policy "Admins manage specialist affiliations"
  on public.doctor_hospitals
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
