-- Simulated hospital directory. `code` matches the demo catalog ids so the
-- patient booking flow can resolve a hospital without exposing UUIDs.

create table public.hospitals (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 2 and 60),
  name text not null,
  short_name text not null,
  type text not null check (type in ('Private', 'Government')),
  area text not null,
  address text not null,
  distance_km numeric(5, 1) not null default 0 check (distance_km >= 0),
  availability text not null default 'available'
    check (availability in ('available', 'limited', 'full')),
  available_beds integer not null default 0 check (available_beds >= 0),
  total_beds integer not null default 0 check (total_beds >= 0),
  emergency boolean not null default true,
  facilities text[] not null default '{}',
  specialties text[] not null default '{}',
  map_position jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hospitals_beds_within_total check (available_beds <= total_beds)
);

create trigger set_hospitals_updated_at
  before update on public.hospitals
  for each row
  execute function public.set_updated_at();

alter table public.hospitals enable row level security;

create policy "Directory is publicly readable"
  on public.hospitals
  for select
  to anon, authenticated
  using (true);

create policy "Admins manage hospitals"
  on public.hospitals
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
