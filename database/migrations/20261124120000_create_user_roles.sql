-- Roles are stored server-side and never trusted from the browser.
-- New auth.users rows get the patient role through a trigger; admin is granted
-- only with the service-role key or a reviewed SQL statement.

create type public.app_role as enum ('patient', 'admin');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role public.app_role not null default 'patient',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_roles_role_idx on public.user_roles (role);

-- Security definer so policies can check roles without recursing into RLS.
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_roles.user_id = uid
      and user_roles.role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'patient')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_role
  after insert on auth.users
  for each row
  execute function public.handle_new_user_role();

create trigger set_user_roles_updated_at
  before update on public.user_roles
  for each row
  execute function public.set_updated_at();

alter table public.user_roles enable row level security;

create policy "Users can read their own role"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Admins can read all roles"
  on public.user_roles
  for select
  to authenticated
  using (public.is_admin());

-- No insert/update/delete policies on purpose: role changes must go through
-- a trusted server-side caller, never from the browser.
