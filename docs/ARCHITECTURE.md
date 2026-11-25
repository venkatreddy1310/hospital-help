# MediPulse 2.0 — Architecture

MediPulse is a hospital locator and emergency triage platform. The foundation milestone
establishes a three-tier architecture where each layer can be developed and run independently.

```
React SPA (Vite)  ──HTTP/JSON──▶  Express REST API  ──▶  Supabase PostgreSQL
frontend/                        backend/                 database/
```

The REST API is optional for demo features and is the only place that talks to Google Gemini.
When Supabase credentials are present, the browser talks to Supabase Auth and Postgres directly
through RLS-protected queries for patient accounts, family profiles, policies, claims, and
appointments; otherwise every feature runs in labeled local demo mode. Triage guidance is
generated in the browser by a transparent demo ruleset, not a live AI model, and that ruleset
always outranks the assistant. Without a Gemini key the assistant page falls back to a local,
transparent guide.

## Responsibilities

### Frontend (`frontend/`)

Presentation only. Renders routes, holds UI state, and calls the REST API.

- `components/layout/` — app shell: top bar for desktop, fixed five-item bottom bar for
  mobile (Home, Hospitals, Triage, Specialists, More). More opens a sheet that includes
  My appointments.
- `components/admin/` — admin-only shell and navigation, form sheets, confirm dialogs,
  feedback banners, activity list, appointment chart, and bed distribution card.
- `components/common/`, `components/ui/` — reusable presentational pieces (`PageHeader`,
  `PlaceholderPanel`, `Card`, `Badge`, `StepProgress`, `FlowStepCard`).
- `components/triage/` — guided triage controls, safety alert, result card, and
  recommendation card.
- `components/specialists/` — specialist result cards and fictional doctor avatars.
- `components/auth/` — auth shell, fields, and the `RequireAuth` route guard.
- `components/account/` — profile forms, patient avatar, header profile switcher, and
  insurance policy sheet.
- `components/insurance/` — insurance status badge and patient/policy selectors shared by the
  coverage checker and claim workflows.
- `components/map/` — `HospitalMap`, a Leaflet map with simulated pins, location controls,
  insurance-aware preview card, and list/map parity.
- `components/booking/` — patient, hospital, date, slot, consultation, review, summary,
  and confirmation views for the guided demo booking flow.
- `components/appointments/` — local demo appointment cards.
- `pages/` — one component per route. Triage, assistant, specialist profile, booking,
  appointments, coverage, and claim pages orchestrate their flows; `pages/admin/` holds the
  eight admin sections; `pages/auth/` holds login, register, forgot-password, and reset-password.
- `services/` — typed API client, appointment and admin-catalog storage adapters, the
  `supabaseClient` singleton, auth adapters (`demoAuth`, `supabaseAuth`), account repositories
  (`demoAccountRepository`, `supabaseAccountRepository`, `appointmentRemote`), insurance catalog
  loading, and claim repositories (`demoClaimRepository`, `supabaseClaimRepository`).
  The API client is the single place that knows `VITE_API_URL`; each adapter is the single
  place that knows its local demo key or Supabase table.
- `hooks/` — reusable React state (`useApiHealth`, `useGeolocation`).
- `types/` — API contracts plus domain, appointment, insurance, claims, admin, and account types.
- `utils/` — pure helpers with no React dependency: demo doctors, patients, hospitals,
  admin catalog seeds/parsing/normalization, admin insights, specialist filtering and slot
  availability, appointment IDs/formatting, date/time formatting, profile/policy
  validation and formatting, insurance evaluation and coverage estimates, haversine distance
  and OSM links, the demo triage rules, and the offline assistant guide.

Routes: `/`, `/hospitals`, `/hospitals/:id`, `/triage`, `/assistant`, `/specialists`,
`/specialists/:id`, `/login`, `/register`, `/forgot-password`, `/reset-password`,
`/about`, `/emergency`, `/settings`, and `/admin` with nested overview, `hospitals`,
`doctors`, `appointments`, `patients`, `insurance`, `activity`, and `settings` sections,
plus a catch-all 404. Patient-only routes — `/specialists/:id/book`, `/appointments`,
`/account`, `/family`, `/insurance`, `/coverage-checker`, `/cashless-guidance`, and
`/reimbursement-claims` — are wrapped in `RequireAuth`, which redirects to `/login?next=…`
and back. Deep links from triage (`?specialty=`, and `?urgency=` to the assistant), hospital
profiles (`?hospital=`), and insurance filters preselection directory state.

### Authentication and accounts

`context/AuthContext.tsx` owns the auth state machine (`initializing`, `signed-in`,
`signed-out`) and exposes `useAuth()`. Demo mode signs in a local demo household
synchronously with no password and restores it on reload; a signed-out flag keeps the
composer-independent session honest. With Supabase configured, the provider subscribes to
`onAuthStateChange`, reads the role from `user_roles`, and offers email/password sign-in,
sign-up, password reset, and password update. Errors are mapped to safe user-facing copy;
no password or medical value is logged.

`context/AccountContext.tsx` loads self profile, family members, policies, and provider
options through the account repository, which is selected from `isSupabaseConfigured`.
Active patient selection is per owner and persists in `localStorage`. Booking, My
Appointments, account pages, and the header switcher all read from this context.

When Supabase is configured, writes go through `supabaseAccountRepository` and
`appointmentRemote` and are protected by RLS. In demo mode they go through the local
repositories and `localStorage` (`medipulse.demo.patient-accounts.v1`,
`medipulse.demo.appointments.v1`). Demo records are clearly labeled; no real insurer is
contacted or verified.

### Admin console and demo catalog

All mutable demo records — hospitals, fictional doctors, insurance providers, patient
accounts, and activity — live in one `DemoCatalogProvider` seeded from the existing demo data.
Every admin form writes through this context, so edits propagate immediately to the home
dashboard, hospital directory/detail, specialist directory/profile, and booking flow. Bed
writes pass through a clamp, and stored data is parsed and normalized on read; invalid
snapshots are re-seeded.

`services/adminCatalogStorage.ts` persists the catalog under
`medipulse.demo.admin-catalog.v1` and validates records on read. Appointments keep their own
adapter (`medipulse.demo.appointments.v1`), extended only with a restore/cancel status action,
so no duplicate appointment records are created by the admin views. Both adapters are the
intended seams for Supabase.

`AdminLayout` uses `useAuth()`: the console opens in demo mode, otherwise it requires a
signed-in user whose `user_roles` role is `admin`. This UI check is a convenience only —
database RLS policies call a `security definer` `is_admin()` function, and role changes can
only be made with the service-role key or the SQL editor.

### Demo appointment persistence

`services/appointmentStorage.ts` exposes a minimal `load`/`save` adapter backed by
`localStorage` under `medipulse.demo.appointments.v1`. Stored records are validated on read
and written through a React context, so the UI is unaware of the storage mechanism. A future
Supabase implementation can replace the adapter without changing the booking or appointment
screens. Demo appointments never leave the browser and make no real booking.

### Interactive map

`components/map/HospitalMap.tsx` wraps `react-leaflet` in a `MapContainer` with
OpenStreetMap tiles and attribution, rendering each simulated hospital as a `CircleMarker`
colored by availability. A custom overlay handles zoom, recenter, the location button, the
legend, and the insurance-aware preview card; z-index utilities keep controls above Leaflet
panes. `hooks/useGeolocation.ts` requests browser geolocation only on demand, never stores or
transmits it, ignores stale callbacks, and reports denied/unavailable/timeout states that the
pages use to offer the existing manual demo-area picker. `utils/geo.ts` holds the haversine
distance, distance sorting, coordinate formatting, and OpenStreetMap direction/position URLs.
Home embeds the map; the hospital directory adds a list/map toggle that reuses the same search,
filters, and sorting. Pins, coordinates, bed counts, and availability are simulated, and OSM
tiles are consumed as a public best-effort service.

### Insurance intelligence and claims

`utils/insurance.ts` implements the network evaluation and estimate logic as pure functions.
`getPoliciesForPatient` includes policies where the patient is the primary holder or a
covered member. `evaluateHospitalInsurance` ranks candidate policies and returns exactly one
label: potential network match, non-network, expired, inactive, no policy, or insufficient
information. A match always carries the fixed disclaimer that final eligibility and cashless
approval require insurer/TPA confirmation. `calculateCoverageEstimate` applies only the
administrator-configured co-pay, deductible, per-claim limit, sum insured, exclusions, and
waiting period, and explicitly reports when it cannot calculate.

`context/InsuranceWorkspaceContext.tsx` loads providers and simulated claim records through
`services/claimRepository.ts`, which selects `demoClaimRepository` (localStorage) or
`supabaseClaimRepository` (RLS tables, hospitals resolved by catalog code). Cashless
pre-authorizations and reimbursements are simulated records with demo statuses and codes; the
UI states clearly that no hospital, insurer, or TPA receives anything. The reimbursement
checklist has eight fixed document items. `supabaseClaimRepository` verifies ownership through
RLS and triggers; a corrective migration relaxes the earlier trigger rule so a covered family
member can claim against a policy whose primary holder is the account owner.

### AI health assistant

`pages/AssistantPage.tsx` posts to `POST /api/ai/assistant` through `services/api.ts`.
Requests carry only the message, a locale, an optional rule-based triage urgency, and an
optional specialty — never profile records, policy numbers, or contact details. The page
short-circuits possible emergencies locally with 112/108 guidance. On success it labels the
reply as AI-generated; on missing configuration, quota, auth failure, timeout, or network
error it shows the provider's safe message and renders `utils/assistantFallback.ts` guidance
instead. Offline guidance is rule-based, marks itself as such, and never diagnoses or
prescribes.

### Backend (`backend/`)

Owns business logic, validation, authorization, secrets, and all database access.

```
server.ts → app.ts (middleware) → routes/ → controllers/ → services/ → data access
```

- `config/` — environment parsing, including optional Gemini model/key and Supabase values.
  Missing optional credentials never block startup.
- `routes/` — URL mapping only.
- `controllers/` — request/response translation, including assistant input validation.
- `services/` — business logic: the `@google/genai` client, model/system-prompt construction,
  error classification, and PII redaction before any message leaves the server.
- `middleware/` — centralized 404 and error handling plus an in-memory per-IP rate limiter.
- `utils/` — logging and small shared helpers. Assistant message text is never logged.
- `types/` — API and AI contract types.

### Database (`database/`)

Versioned PostgreSQL migrations and idempotent seed data for Supabase. See
[`database/README.md`](../database/README.md) for naming, ordering, RLS, and credential rules,
and [`docs/SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) for project setup.

Migrations create `user_roles`, `profiles`, `family_members`, `insurance_policies`,
`hospitals`, `doctors`, `doctor_hospitals`, `appointments`, `insurance_providers`,
`insurance_hospital_network`, `insurance_coverage_rules`, `activity_logs`,
`cashless_preauthorizations`, and `reimbursement_claims`. Every table has RLS enabled in the
same migration: owner-only rows for patient data, public read/catalog admin write for the
directory, and admin-only access to activity. Claim rows are owner-scoped, and trigger
functions re-check the policy owner, patient ownership, coverage, and patient kind on every
write. `20261124121100_fix_claim_patient_scope.sql` is additive and corrects an earlier rule
that rejected covered family members whose kind differed from the policy's primary holder.
Seeds use the frontend demo codes so bookings and claims can resolve catalog rows.

## API conventions

Every JSON response uses one envelope, so clients handle success and failure uniformly:

```json
{ "success": true, "data": { "...": "..." } }
{ "success": false, "error": { "code": "not_found", "message": "..." } }
```

- `GET /api/health` → `200` with service name, version, environment, timestamp, uptime.
- `GET /api/ai/status` → `200` with whether Gemini is configured, the active model, emergency
  numbers, and the safety notice.
- `POST /api/ai/assistant` → `200` with the reply, model/provider, redaction count, and safety
  notice. Malformed input → `400` `invalid_request`; over quota → `429` `ai_quota_exceeded`;
  rate limited → `429` `ai_rate_limited`; missing key → `503` `ai_not_configured`; rejected
  credentials → `503` `ai_auth_failed`; model failure/timeout → `503`/`502` `ai_unavailable`;
  blocked/empty output → `422` `ai_blocked`. Provider error text is never forwarded.
- Unknown routes → `404` with `code: "not_found"`.
- Malformed JSON → `400` with `code: "invalid_json"`.
- Unexpected failures → `500` with `code: "internal_error"`; stacks are logged, never returned.

The frontend calls every endpoint through `frontend/src/services/api.ts`, which unwraps the
envelope and throws a typed `ApiError` on failure.

## Environment and secrets

| Concern | Where it lives | Notes |
| --- | --- | --- |
| API base URL | `frontend/.env` → `VITE_API_URL` | Public. Defaults to `/api` via the Vite dev proxy. |
| Supabase URL + anon key | `frontend/.env` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Public by design and protected by RLS. Blank means demo mode. |
| Port, CORS, mode | `backend/.env` | `PORT`, `NODE_ENV`, `CORS_ORIGIN` (comma-separated). |
| Supabase service role | `backend/.env` only | Bypasses RLS. Never leaves the server, never in a `VITE_` variable. |
| Gemini key + model | `backend/.env` only | `GEMINI_API_KEY`, optional `GEMINI_MODEL` (verified default `gemini-3.5-flash-lite`; free-tier daily quota is per model, so a model whose daily cap is spent can be swapped here) and `GEMINI_TIMEOUT_MS` (default 25000, one retry with backoff for 429/5xx/network errors). Run `npm run ai:check` in `backend/` to confirm the key, the model list, HTTP status, error category and latency. Never in a `VITE_` variable; blank key keeps the assistant offline. |

`VITE_*` values are compiled into the browser bundle and must never contain secrets. All
`.env` files are git-ignored; only `.env.example` files are committed. In development, Vite
proxies `/api` to `http://localhost:4000`, so no env file is required to run the app.

CORS is restricted to `CORS_ORIGIN` (default `http://localhost:5173`). `x-powered-by` is
disabled, JSON bodies are capped at 1 MB, and errors are logged server-side.

## Design system

Mobile-first. White surfaces, navy (`#0a2038`) text and brand, teal (`#0f9d9d`) accents,
defined as Tailwind v4 theme tokens in `frontend/src/index.css`. The mobile shell uses a
fixed bottom navigation with safe-area padding; desktop switches to a top navigation bar.

## Boundaries for upcoming milestones

Supabase integrations are built but unverified against a live project: no project URL, anon
key, email settings, or admin role has been configured here, so the app runs in labeled demo
mode. RLS policies and cross-account restrictions are written but not yet exercised with two
real accounts. The Gemini assistant is implemented but has not been called with a live key in
this build; without one it uses the offline guide, and quota, auth, and timeout failures are
handled with safe messages. The assistant never decides insurance eligibility, never
diagnoses or prescribes, never overrides an emergency triage result, and is rate limited. All
insurance, claim, map, availability, and hospital records remain simulated, and no real
credentials, insurer verification, or security guarantee is claimed.
