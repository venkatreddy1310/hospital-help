# Supabase authentication and account setup

MediPulse runs two modes:

- **Demo mode (default).** With no Supabase values in `frontend/.env`, auth, profiles,
  family members, policies, appointments, and the admin console all run locally in the
  browser. This is the judged hackathon experience and needs no account.
- **Supabase mode.** With a project URL and public anon key, Supabase Auth and Postgres
  become the system of record for patient accounts, family profiles, insurance policy
  records, and appointments.

The app never stores passwords, never logs medical or policy data, and never puts a
service-role key in the browser bundle.

## 1. Create the project

1. Create a free Supabase project.
2. Copy the project URL and the **anon public** key from Project Settings → API.
3. In `frontend/.env`, set:

   ```bash
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-public-key>
   ```

   Restart the Vite dev server. `VITE_*` values are public and rely on Row Level Security.
   The service-role key is only for the backend (`.env` in `backend/`) and must never appear
   in a `VITE_` variable.

## 2. Apply the schema

Apply the files in `database/migrations/` in filename order, then the files in
`database/seeds/` in numeric order. Either:

- paste each file into the Supabase SQL editor one at a time, or
- use the Supabase CLI (`supabase db push` with the files linked to the project).

The migrations create:

| Table | Purpose |
| --- | --- |
| `user_roles` | `patient` / `admin` role per user, checked server-side |
| `profiles` | One self profile per user, keyed by the auth user id |
| `family_members` | Family profiles owned by one account |
| `insurance_policies` | User-entered demo policies per patient |
| `hospitals`, `doctors`, `doctor_hospitals` | Simulated directory catalog |
| `insurance_providers`, `insurance_hospital_network` | Simulated insurer catalog |
| `appointments` | Bookings linked to profile, family member, doctor, hospital |
| `activity_logs` | Admin activity feed, server-written only |

Every table has Row Level Security enabled. Patients can only read and write their own
profile, family members, policies, and appointments. Catalog tables are public read,
admin write. Admin checks use a `security definer` function reading `user_roles`; the
browser cannot grant itself a role.

## 3. Configure Supabase Auth

In Authentication → Providers, keep Email enabled. For a quick demo:

- Authentication → Sign In / Providers → Email: disable "Confirm email" so judges can sign
  up and start immediately. With confirmation enabled, the sign-up screen tells the user to
  check their inbox instead of signing them in.
- Authentication → URL Configuration: set the Site URL to the local or deployed frontend
  origin, and add `http://localhost:5173/reset-password` (and the production equivalent) to
  the redirect allow list. Password reset emails link back to `/reset-password`.

The app requests confirmation and reset redirects explicitly; no extra frontend config is
needed.

## 4. Grant an admin role

Roles are never assigned from the browser. After creating a user, run this in the SQL
editor (it uses your dashboard privileges, not the anon key):

```sql
update public.user_roles
set role = 'admin'
where user_id = (select id from auth.users where email = 'admin@example.com');
```

The new user gets a `patient` role automatically from the trigger on `auth.users`. The
frontend also checks `user_roles` to show the admin console, but the database policies
enforce the same rule independently.

## 5. Seed the directory

`database/seeds/001_hospitals.sql`, `002_insurance_providers.sql`, and `003_doctors.sql`
insert the simulated hospitals, fictional specialists, provider network, and demo insurer
plans. They are idempotent (`on conflict ... do update`) and use the same `code` values as
the frontend demo catalog, so a Supabase-backed booking can resolve the doctor and hospital
rows. Run them after the migrations.

## 6. What still needs configuration

These items cannot be completed without a real Supabase project and are intentionally left
as configuration steps:

- Project URL, anon key, and (backend-only) service-role key.
- Email provider settings and redirect URLs.
- Assigning an admin role to a chosen test account.
- Running the migrations and seeds against a real project.
- Testing cross-account RLS with two browser sessions after those steps.

Until that is done, the app remains in clearly labeled demo mode, and Supabase-specific
screens fail closed with a friendly message rather than inventing data or credentials.
