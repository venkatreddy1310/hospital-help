-- Append-only admin activity feed. Future admin writes should be emitted from
-- trusted server-side code (service role), not assembled in the browser.

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  area text not null check (area in ('hospital', 'doctor', 'insurance', 'appointment', 'patient', 'system')),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  detail text not null default '' check (char_length(detail) <= 500),
  created_at timestamptz not null default now()
);

create index activity_logs_created_at_idx on public.activity_logs (created_at desc);

alter table public.activity_logs enable row level security;

create policy "Admins can read activity"
  on public.activity_logs
  for select
  to authenticated
  using (public.is_admin());

-- No insert/update/delete policies: the log is written server-side only.
