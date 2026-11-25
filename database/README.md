# Database

MediPulse uses **Supabase PostgreSQL** as its system of record. This directory holds the SQL
that defines and seeds the database. A Supabase project is optional: without one the app runs
in labeled demo mode with browser-local adapters, and no SQL here is executed automatically.

```
database/
├── migrations/   Versioned, forward-only schema changes
├── seeds/        Repeatable demo/reference data for local and staging environments
└── README.md
```

## Current migrations

Apply in filename order:

1. `20261124120000_create_user_roles.sql`
2. `20261124120100_create_profiles.sql`
3. `20261124120200_create_family_members.sql`
4. `20261124120300_create_hospitals.sql`
5. `20261124120400_create_doctor_catalog.sql`
6. `20261124120500_create_insurance_providers.sql`
7. `20261124120600_create_insurance_policies.sql`
8. `20261124120700_create_appointments.sql`
9. `20261124120800_create_activity_logs.sql`
10. `20261124120900_create_insurance_coverage_rules.sql`
11. `20261124121000_create_claim_workflows.sql`
12. `20261124121100_fix_claim_patient_scope.sql` (additive correction to the claim trigger)

The first nine were the milestone 7/8 set; 10–12 were added for the insurance workspaces and
claims. Every table enables RLS in its creating migration, and claims re-validate ownership,
coverage, and patient kind through `security definer` triggers.

## Migrations

- File naming: `YYYYMMDDHHMMSS_short_description.sql` (Supabase CLI timestamp convention).
- Apply strictly in filename order. Every applied migration is immutable — fix mistakes with a
  new migration, never by editing an old one.
- One logical change per file (e.g. `create_hospitals_table`, `add_specialists_index`). Keep
  related constraints, indexes, and RLS policies for the same table in the same migration.
- Enable Row Level Security on every table that is ever exposed through Supabase's API, and
  write explicit policies in the same migration that creates the table.
- Migrations may be run with the Supabase CLI (`supabase db push`) or pasted into the
  Supabase SQL editor, one file at a time. Whatever the method, the remote schema must always
  match the files in `migrations/`.
- Destructive changes (dropping columns or tables) need a dedicated, reviewed migration and a
  backup, never a quiet edit.

## Seeds

- File naming: `NNN_subject.sql` (e.g. `001_hospitals.sql`), applied in numeric order.
- Seeds must be idempotent (`insert ... on conflict do nothing` / `on conflict ... do update`)
  so they can be re-run safely during development.
- Seed data is for local development and demos: synthetic hospitals, departments, and
  specialties. Never include real patient data, real credentials, or private staff details.
- Seeds are separate from migrations and are never applied automatically in production.

## Backend and frontend connection

- When Supabase is configured, the browser uses the public URL and anon key through
  `supabase-js`; RLS is the security boundary for account, policy, claim, and appointment
  reads/writes. The Express API currently exposes health and Gemini assistant endpoints only.
- Planned server-side environment variables (see `backend/.env.example`):
  `SUPABASE_URL`, `SUPABASE_ANON_KEY` (or `SUPABASE_PUBLISHABLE_KEY`), and
  `SUPABASE_SERVICE_ROLE_KEY`. The backend does not yet query Supabase.
- The service-role key is for trusted server-side administration only. If server-side database
  access is added, initialize it in `backend/src/config/` and use it only from service modules —
  never in routes, controllers, or the browser.

## Credentials

- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. It lives only in the backend
  environment and must never be exposed to the frontend, logs, or client bundles.
- Real values go in `.env` files, which are git-ignored. Only `.env.example` placeholders are
  committed.
- The frontend may only use the public Supabase URL and anon key if direct reads are added
  later, and only with RLS enforced.
- Rotate keys immediately in the Supabase dashboard if one is ever committed or shared.
