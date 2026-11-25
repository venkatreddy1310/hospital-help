-- Admin-configured illustrative coverage rules. These values support estimates
-- only and never establish insurer eligibility or claim approval.

create table public.insurance_coverage_rules (
  provider_id uuid not null references public.insurance_providers (id) on delete cascade,
  category text not null check (category in ('general-hospitalization', 'emergency', 'icu', 'surgery', 'diagnostics')),
  co_pay_percent numeric(5, 2) not null default 0 check (co_pay_percent between 0 and 100),
  deductible numeric(14, 2) not null default 0 check (deductible >= 0),
  per_claim_limit numeric(14, 2) check (per_claim_limit is null or per_claim_limit >= 0),
  waiting_period_days integer not null default 0 check (waiting_period_days >= 0),
  excluded boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (provider_id, category)
);

create trigger set_insurance_coverage_rules_updated_at
  before update on public.insurance_coverage_rules
  for each row
  execute function public.set_updated_at();

alter table public.insurance_coverage_rules enable row level security;

create policy "Coverage rules are publicly readable"
  on public.insurance_coverage_rules
  for select
  to anon, authenticated
  using (true);

create policy "Admins manage coverage rules"
  on public.insurance_coverage_rules
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
