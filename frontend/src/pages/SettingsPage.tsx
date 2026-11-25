import { ArrowRight, FileText, MapPin, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DemoNotice } from '../components/common/DemoNotice'
import { PageHeader } from '../components/common/PageHeader'
import { LocationSheet } from '../components/layout/LocationSheet'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/authStore'
import { useServiceLocation } from '../context/locationStore'

export function SettingsPage() {
  const { location } = useServiceLocation()
  const { isDemoMode } = useAuth()
  const [isLocationOpen, setIsLocationOpen] = useState(false)

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Preview preferences for the MediPulse demo build."
      />

      <Card className="bg-white">
        <h2 className="text-sm font-semibold text-brand-navy">Default location</h2>
        <p className="mt-1 text-xs text-brand-navy-soft">
          Used to personalise hospital and specialist distances across the app.
        </p>
        <button
          type="button"
          onClick={() => setIsLocationOpen(true)}
          aria-haspopup="dialog"
          className="mt-3 flex w-full items-center gap-3 rounded-xl border border-brand-line p-3 text-left transition-colors hover:bg-brand-surface"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue">
            <MapPin className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-brand-navy">{location.area}</span>
            <span className="block text-xs text-brand-navy-soft">
              {location.city}, {location.state}
            </span>
          </span>
          <span className="text-xs font-semibold text-brand-blue">Change</span>
        </button>
      </Card>

      <Card className="mt-4 bg-white">
        <h2 className="text-sm font-semibold text-brand-navy">Account & profiles</h2>
        <p className="mt-1 text-xs text-brand-navy-soft">
          Manage the patient profiles, family members, and demo insurance records owned by
          your account.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Link
            to="/account"
            className="flex items-center gap-2 rounded-xl border border-brand-line px-3 py-2.5 text-xs font-semibold text-brand-navy transition-colors hover:bg-brand-surface"
          >
            <UserRound className="size-4 text-brand-blue" aria-hidden="true" />
            Personal profile
          </Link>
          <Link
            to="/family"
            className="flex items-center gap-2 rounded-xl border border-brand-line px-3 py-2.5 text-xs font-semibold text-brand-navy transition-colors hover:bg-brand-surface"
          >
            <UsersRound className="size-4 text-brand-blue" aria-hidden="true" />
            Family profiles
          </Link>
          <Link
            to="/insurance"
            className="flex items-center gap-2 rounded-xl border border-brand-line px-3 py-2.5 text-xs font-semibold text-brand-navy transition-colors hover:bg-brand-surface"
          >
            <FileText className="size-4 text-brand-blue" aria-hidden="true" />
            Insurance policies
          </Link>
        </div>
      </Card>

      <Card className="mt-4 bg-white">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-teal-soft text-brand-teal-dark">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-brand-navy">Data & privacy</h2>
            <p className="mt-1 text-xs leading-relaxed text-brand-navy-soft">
              {isDemoMode
                ? 'Demo sessions and patient profile records are stored in this browser only. Location preferences reset when you reload the app. Do not enter real health or insurance information.'
                : 'Account, family, policy, and appointment records are stored in Supabase and restricted to your signed-in account by row-level security. Location preferences remain local. Do not enter real health or insurance information in this hackathon build.'}
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-4 bg-white">
        <h2 className="text-sm font-semibold text-brand-navy">About this build</h2>
        <p className="mt-1 text-xs text-brand-navy-soft">
          MediPulse 2.0 · Hackathon preview. Supabase authentication, family profiles, and
          user-entered demo insurance records are available. AI triage and live clinical
          integrations are not connected.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          <Link
            to="/about"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
          >
            About MediPulse
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
          <Link
            to="/emergency"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
          >
            Emergency information
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Card>

      <DemoNotice className="mt-4">
        Preferences in this preview are visual only and do not change real account or
        notification settings. Hospital, clinician, availability, and insurance coverage
        data are simulated.
      </DemoNotice>

      {isLocationOpen ? <LocationSheet onClose={() => setIsLocationOpen(false)} /> : null}
    </div>
  )
}
