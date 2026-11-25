-- Simulated insurance providers and their demo hospital network. These rows
-- describe fake products only; nothing here verifies real coverage.

create table public.insurance_providers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (char_length(code) between 2 and 60),
  name text not null,
  plan_name text not null,
  active boolean not null default true,
  coverage text[] not null default '{}'
    check (coverage <@ array['general-hospitalization', 'emergency', 'icu', 'surgery', 'diagnostics']::text[]),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_insurance_providers_updated_at
  before update on public.insurance_providers
  for each row
  execute function public.set_updated_at();

create table public.insurance_hospital_network (
  provider_id uuid not null references public.insurance_providers (id) on delete cascade,
  hospital_id uuid not null references public.hospitals (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (provider_id, hospital_id)
);

create index insurance_hospital_network_hospital_id_idx
  on public.insurance_hospital_network (hospital_id);

alter table public.insurance_providers enable row level security;
alter table public.insurance_hospital_network enable row level security;

create policy "Providers are publicly readable"
  on public.insurance_providers
  for select
  to anon, authenticated
  using (true);

create policy "Admins manage providers"
  on public.insurance_providers
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Provider networks are publicly readable"
  on public.insurance_hospital_network
  for select
  to anon, authenticated
  using (true);

create policy "Admins manage provider networks"
  on public.insurance_hospital_network
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
