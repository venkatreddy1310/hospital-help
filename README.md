# MediPulse 2.0

AI-powered hospital locator and emergency triage platform. College hackathon project.

This is **milestone 9 of 10**: an interactive OpenStreetMap hospital map, insurance intelligence
(network checks, coverage estimate, cashless pre-authorization guidance, reimbursement checklist),
and an optional Gemini-backed health assistant with a transparent offline fallback — layered on
the Supabase authentication and account foundations, admin operations console, dashboard,
hospital directory, comparison, rule-based triage, specialist discovery, and demo booking from
earlier milestones. All hospital, bed, facility, specialist, availability, appointment,
insurance, claim, and patient data is simulated demo data. Triage results come from a local
transparent ruleset, not a live AI model, and that result always outranks the assistant. Without
Supabase credentials the whole app runs in clearly labeled demo mode; without a Gemini key the
assistant uses a built-in offline guide. Demo appointments, claims, and admin edits stay in this
browser and no real hospital, insurer, or TPA is contacted. Supabase and Gemini integration code
is implemented but **not verified end to end against live credentials** in this build. What was
checked against the live project: the anon key, `hospitals`, `insurance_providers`,
`insurance_policies`, and the provider network tables respond; the tables from migrations
`20261124120900`–`20261124121100` are **not applied yet**, so live coverage rules and claim
workflows stay unavailable until someone runs them; and a live Gemini reply could not be obtained
because model latency on the build machine exceeded the request timeout — the app answered with
its offline guide instead.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Lucide React |
| Map | Leaflet + react-leaflet with OpenStreetMap tiles (public best-effort tile usage, not a guaranteed availability promise) |
| Backend | Node.js, Express 5, TypeScript (REST) |
| AI | Optional Google Gemini via `@google/genai`, backend-only; offline rule-based fallback |
| Database | Supabase PostgreSQL (migrations, seeds, and RLS written; needs a project to run) |

## Structure

```
MediPulse-2.0/
├── frontend/                 React SPA
│   ├── public/
│   ├── src/
│   │   ├── assets/           Brand mark
│   │   ├── components/
│   │   │   ├── account/      Profile forms, avatar, profile switcher, policy sheet
│   │   │   ├── admin/        Admin shell, nav, forms, confirmations, charts, activity
│   │   │   ├── auth/         Auth shell, fields, RequireAuth guard
│   │   │   ├── appointments/ AppointmentCard
│   │   │   ├── booking/      Patient, hospital, date, slot, consultation,
│   │   │   │                 review, summary, and confirmation steps
│   │   │   ├── common/       PageHeader, PageSectionHeader, DemoNotice,
│   │   │   │                 PlaceholderPanel, StepProgress, FlowStepCard
│   │   │   ├── dashboard/    StatCard, AvailabilityDistribution, InsightCard
│   │   │   ├── hospitals/    HospitalCard, HospitalComparison, CompareBar,
│   │   │   │                 BedAvailabilityBar, HospitalFacilityCard
│   │   │   ├── insurance/    InsuranceStatusBadge, PatientPolicySelects
│   │   │   ├── layout/       AppLayout, AppHeader, BottomNavigation, sheets, navigation
│   │   │   ├── map/          HospitalMap (Leaflet circles, preview card, geolocation controls)
│   │   │   ├── specialists/  SpecialistCard, DoctorAvatar
│   │   │   ├── triage/       TriageProgress, TriageQuestionCard, SymptomSelector,
│   │   │   │                 ChoiceSelector, SeveritySelector, EmergencyAlert,
│   │   │   │                 EmergencyWarningList, TriageResultCard, RecommendationCard
│   │   │   └── ui/           Card, Badge, BottomSheet, SearchBar, FilterChip,
│   │   │                     AvailabilityBadge, QuickActionCard
│   │   ├── context/          Location, catalog, auth, account, insurance workspace,
│   │   │                     and appointment stores
│   │   ├── pages/            Home, Hospitals, HospitalDetail, Triage, Assistant,
│   │   │                     Specialists, SpecialistProfile, Booking, Appointments,
│   │   │                     Account, FamilyProfiles, InsurancePolicies,
│   │   │                     CoverageChecker, CashlessGuidance, ReimbursementClaims,
│   │   │                     About, Emergency, Settings, NotFound
│   │   ├── pages/auth/       Login, Register, ForgotPassword, ResetPassword
│   │   ├── pages/admin/      Overview, Hospitals, Doctors, Appointments, Patients,
│   │   │                     Insurance, Activity, Settings
│   │   ├── hooks/            useApiHealth, useGeolocation
│   │   ├── services/         API client, Supabase client, auth adapters, account,
│   │   │                     appointment, insurance catalog, and claim repositories,
│   │   │                     local storage adapters
│   │   ├── types/            API, domain, appointment, insurance, claims, admin,
│   │   │                     account contracts
│   │   ├── utils/            Demo data, doctors, patients, admin catalog seeds/parsing,
│   │   │                     admin insights, facilities, availability, specialist search,
│   │   │                     appointment helpers, profile/policy helpers, insurance
│   │   │                     evaluation, geo helpers, assistant fallback, date/time,
│   │   │                     triage rules, cn()
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
├── backend/                  Express API
│   ├── src/
│   │   ├── config/           Environment parsing
│   │   ├── controllers/      Health and AI assistant controllers
│   │   ├── routes/           /api router, /health, /ai
│   │   ├── middleware/       Error handling and in-memory rate limiting
│   │   ├── services/         Gemini client, PII redaction
│   │   ├── utils/            Logger
│   │   ├── types/            API and AI contracts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   └── .env.example
├── database/                 Supabase SQL (see database/README.md)
│   ├── migrations/           Tables, constraints, indexes, RLS policies
│   ├── seeds/                Idempotent simulated catalog
│   └── README.md
├── docs/
│   ├── ARCHITECTURE.md
│   └── SUPABASE_SETUP.md
├── .gitignore
└── README.md
```

## Prerequisites

Node.js 20+ and npm 10+.

## Getting started

Install and run each app independently. Env files are optional in development (defaults
match localhost).

```bash
# Terminal 1 — API on http://localhost:4000
cd backend
npm install
npm run dev

# Terminal 2 — app on http://localhost:5173
cd frontend
npm install
npm run dev
```

To override defaults, copy the example files locally (never commit them):

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

In development the frontend calls `/api` and Vite proxies it to the backend. If
`VITE_API_URL` is set, the browser calls that URL directly and the backend's `CORS_ORIGIN`
must allow it.

**No Supabase project is required to run or judge the app.** With
`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` blank, MediPulse runs in clearly labeled demo
mode: sign-in is a passwordless local demo household, profiles, policies, and claims are
simulated and browser-local, and admin access opens without registration. To connect a real
project, follow [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md): apply `database/migrations/`
and `database/seeds/`, set the two public frontend env values, configure email auth, and grant
an admin role with SQL. The service-role key belongs only in `backend/.env`.

**No Gemini key is required either.** Set `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`) in
`backend/.env` to enable the live assistant. Without it — or when the model errors, is rate
limited, or is over quota — `/assistant` automatically uses a transparent offline guide, and
the API returns a clear `503`/`429` error the UI handles instead of inventing a reply.

## Five-minute demo script

For a judge-friendly walkthrough in demo mode (no Supabase, no Gemini key):

1. **Home** — the interactive map shows 47 simulated hospitals across Hyderabad and Secunderabad,
   including a dense North Hyderabad cluster (Kompally, Gandimaisamma, Dulapally), with availability
   colours. Click a pin for beds, distance, insurance status, and a Directions
   link; tap the locate control to see the geolocation-denied fallback message. Use the location
   chip to switch demo areas (Gachibowli, Madhapur, Kompally, Medchal, and more).
2. **Hospitals → any hospital** — search and filter the directory, open a profile for the
   "Simulated network guidance" panel with the exact *Potential network match* wording and the
   cashless disclaimer.
3. **More → My Insurance** — the seeded demo policy covers the owner and two family profiles;
   switch patient with the profile chips.
4. **More → Coverage Checker** — keep the default inputs and quote the result: ₹100,000 cost,
   ₹5,000 deductible, 10% co-pay → ₹85,500 insurer contribution, ₹14,500 out of pocket. Switch
   the treatment category to *Diagnostics* to show the configured exclusion.
5. **More → Cashless Guidance** — tick the documents, save a demo pre-authorization, and change
   its simulated status; repeat in **Reimbursement Claims** with the eight-item checklist to get a
   demo claim ID.
6. **Triage → complete the five steps** — the rules-based result links straight into the assistant
   with the urgency context; ask a question in the assistant, then try "chest pain" to show the
   deterministic 112/108 reply that never reaches the model.
7. **More → Admin dashboard** — edit a hospital's beds and watch the directory and map update.

Everything above is simulated. Say so out loud once, then show the offline fallback: if the
backend is not running, the assistant still answers with the transparent offline guide.

## Scripts

| Where | Command | Purpose |
| --- | --- | --- |
| frontend | `npm run dev` | Vite dev server |
| frontend | `npm run build` | Type-check (`tsc -b`) and production build |
| frontend | `npm run preview` | Serve the production build |
| backend | `npm run dev` | Express with watch mode (tsx) |
| backend | `npm run build` | Compile TypeScript to `dist/` |
| backend | `npm start` | Run the compiled server |
| backend | `npm run typecheck` | Type-check without emitting |

## API

Base URL: `http://localhost:4000/api`

```bash
curl http://localhost:4000/api/health
```

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "medipulse-api",
    "version": "0.1.0",
    "environment": "development",
    "timestamp": "2026-11-24T09:22:32.063Z",
    "uptimeSeconds": 1
  }
}
```

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Service heartbeat |
| `GET` | `/api/ai/status` | Whether Gemini is configured, active model, emergency numbers |
| `POST` | `/api/ai/assistant` | Health-education reply; validated input, PII redaction, 12 req/min per IP |

```bash
curl http://localhost:4000/api/ai/status

curl -X POST http://localhost:4000/api/ai/assistant \
  -H "Content-Type: application/json" \
  -d '{"message":"What does hypertension mean?","locale":"en","triageUrgency":null,"specialty":null}'
```

The assistant endpoint never receives passwords or account identifiers: the server strips
emails, long digit runs, and policy-style codes before calling Gemini, and never logs message
text. Emergency triage results are answered deterministically with 112/108 guidance instead of
being sent to the model. The AI is never used for insurance eligibility.

## Routes

| Path | Screen |
| --- | --- |
| `/` | Home — interactive dashboard, simulated map, availability insights, emergency access |
| `/hospitals` | Hospital directory with search, filters, sorting, and comparison |
| `/hospitals/:id` | Hospital profile with beds, facilities, and services |
| `/triage` | Guided demo triage with safety check, urgency result, and recommendations |
| `/assistant` | Gemini health assistant with offline fallback, 112/108 safety rails |
| `/specialists` | Specialist directory with search, filters, and sorting |
| `/specialists/:id` | Fictional doctor profile with simulated availability |
| `/specialists/:id/book` | Guided demo booking with local confirmation (protected) |
| `/appointments` | Account appointments: upcoming, completed, and cancelled (protected) |
| `/account` | Account settings and personal health profile (protected) |
| `/family` | Family health profiles: add, edit, remove, switch active patient |
| `/insurance` | Demo insurance policy records per patient profile |
| `/coverage-checker` | Illustrative coverage estimate from configured demo rules (protected) |
| `/cashless-guidance` | Network check, desk/document guidance, demo pre-authorization (protected) |
| `/reimbursement-claims` | Eight-item checklist, demo claim ID, simulated status (protected) |
| `/login` | Email/password sign-in or demo continue |
| `/register` | Email/password registration |
| `/forgot-password` | Request a Supabase password reset email |
| `/reset-password` | Set a new password from the email link |
| `/admin` | Admin overview with simulated operations metrics and quick actions |
| `/admin/hospitals` | Hospital search, add/edit/remove, bed validation, facilities |
| `/admin/doctors` | Fictional doctor search, add/edit, activation, and removal |
| `/admin/appointments` | Demo appointment filtering, details, cancellation, restore |
| `/admin/patients` | Simulated accounts, family profiles, and appointment summaries |
| `/admin/insurance` | Simulated provider coverage, hospital acceptance, activation |
| `/admin/activity` | Browser-local admin activity log with filters |
| `/admin/settings` | Access notes, local storage keys, and demo data reset |
| `/about` | About MediPulse |
| `/emergency` | Emergency information (112 / 108) |
| `/settings` | Location and app preferences |

Mobile keeps the fixed five-item bottom bar (Home, Hospitals, Triage, Specialists, More);
More opens a sheet with Health assistant, My appointments, Account & profiles, Family profiles,
My Insurance, Coverage Checker, Cashless Guidance, Reimbursement Claims, About, Emergency
information, Settings, and Admin. Desktop uses a top navigation bar with the same destinations.

Patient routes require sign-in. Demo mode starts with a clearly labeled local demo household
and no password; Supabase mode uses email/password auth with session persistence and a
`/login?next=…` return path. The header exposes profile switching between the account owner
and family members, and the active patient carries into booking and My Appointments.

Demo appointments and profiles persist in `localStorage` through small adapters, so they can
be swapped for Supabase without changing the UI. Supabase mode reads and writes RLS-protected
tables instead.

The admin console has an admin-only desktop sidebar and a horizontally scrollable mobile tab
bar. Its edits feed the public hospital, specialist, and insurance directory through a shared
demo catalog context. Bed writes are clamped so available beds can never exceed total beds or
become negative. Removing a hospital hides orphaned fictional doctors from the directory while
leaving existing appointment records intact. Admin edits persist under
`medipulse.demo.admin-catalog.v1`; **Reset demo data** in admin settings restores the seeded
catalog and clears local appointments.

## Interactive map

The Home map is a real Leaflet map on OpenStreetMap tiles. It plots the simulated hospitals,
their availability color, and optional device location; clicking a marker opens a preview with
name, area, distance, beds, and — when a patient profile and policy exist — the insurance network
status. Zoom, recenter, a list/map toggle, shared search and filters, and OSM directions links are
included. Browser geolocation is requested only on demand, is never stored or sent anywhere, and
falls back to the existing manual demo-area picker when denied or unavailable. Tiles are OpenStreetMap's
public, best-effort service; no unlimited-availability or uptime promise is made. Hospital pins,
coordinates, bed counts, and availability are simulated.

## Insurance intelligence

Policies are user-entered demo records. For the active patient (or any family member) the app
matches a policy's provider against the hospital's demo network and shows exactly one of:
**Potential network match**, **Non-network hospital**, **Policy expired**, **Policy inactive**,
**No insurance policy**, or **Insufficient information**. A match is never a guarantee: the app
always adds “Potential network match. Final eligibility and cashless approval require confirmation
from the insurer/TPA.”

The coverage calculator uses only administrator-configured demo rules: eligible amount after the
deductible, insurer contribution capped by co-pay, per-claim limit, and sum insured, plus a
remaining sum insured and out-of-pocket figure. Excluded categories and unelapsed waiting periods
are shown explicitly. When information is missing the page says it cannot produce a reliable
estimate instead of inventing benefits for a brand. Cashless guidance organizes documents and
tracks simulated statuses (Not started, Documents pending, Submitted, Under review, Approved
(simulated), Rejected (simulated)); reimbursement claims add the eight-item checklist, a demo
claim ID, and simulated status. Nothing is sent to a hospital, insurer, or TPA.

In Supabase mode the provider list, hospital network, and coverage rules are read from three
separate tables. If a table has not been applied yet the app degrades instead of failing: a
missing network reads as **Insufficient information** (never a false "Non-network hospital"),
and a missing rules table makes the estimate state that it cannot produce a reliable figure
rather than guessing a benefit.

## AI health assistant

`/assistant` calls the backend `/api/ai/assistant` endpoint, which uses Google Gemini only when
`GEMINI_API_KEY` is configured server-side. The system prompt forbids diagnosis, prescriptions,
dosages, and insurance decisions; emergency triage results are answered locally with 112/108
guidance and are never downgraded; messages are screened for emails, phone numbers, and policy
codes before leaving the server; message text is never logged; and requests are limited to 12 per
minute per IP. If the key is missing, the model errors, quota is exhausted, or the API is
unreachable, the page switches to a transparent offline guide (symptom suggestions, specialty
hints, doctor questions, emergency numbers) instead of fabricating an AI answer. The assistant
has not been verified against a live Gemini key in this build.

## Security notes

- All `.env` files are git-ignored; only `.env.example` placeholders are tracked.
- Only public values are used in `VITE_*` variables: the Supabase URL and anon key. The
  service-role and Gemini keys are backend-only and are never bundled or returned to the client.
- The Gemini key is read only by the Express server. Assistant messages are redacted for
  emails, long digit runs, and policy-style codes; message text is not logged; the endpoint is
  rate limited; and the assistant is never used for insurance eligibility or claim decisions.
- Supabase Auth owns passwords; MediPulse stores none. Auth errors are mapped to safe
  messages, and medical or policy values are never logged.
- RLS is enabled on every table. Patients only reach their own profile, family members,
  policies, claims, and appointments; catalog tables are public read and admin write. Admin
  checks run through a `security definer` function over `user_roles`, never a frontend claim.
- Claim triggers re-validate that the policy and patient belong to the owner and that the patient
  kind matches the actual owner/family record (`20261124121100_fix_claim_patient_scope.sql`).
  Cashless and reimbursement records remain simulated; no insurer submission exists.
- Policy records are user-entered demo data and are explicitly labeled as not insurer
  verified; they are never shared across accounts.
- Error responses never include stack traces.
- In demo mode the admin console is guarded by a permissive local demo guard and is not a
  security boundary. In Supabase mode the `admin` role is required and RLS enforces it.
- RLS and cross-account restrictions are implemented but **not yet verified against a live
  Supabase project**; no full security guarantee is claimed.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md),
[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md), and
[database/README.md](database/README.md).

MediPulse supports care navigation. It does not provide diagnoses or replace emergency
services.
