import { UserPlus, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccount } from '../../context/accountStore'
import { getCareProfileSummary } from '../../utils/account'
import { Badge } from '../ui/Badge'
import { SelectionCard } from './SelectionCard'

interface BookingPatientStepProps {
  selectedPatientId: string | null
  onSelect: (patientId: string) => void
}

export function BookingPatientStep({
  selectedPatientId,
  onSelect,
}: BookingPatientStepProps) {
  const { profiles, activeProfileId, isLoading } = useAccount()

  if (isLoading) {
    return (
      <p className="rounded-xl border border-brand-line bg-brand-surface/60 px-4 py-3 text-xs text-brand-navy-soft">
        Loading your patient profiles…
      </p>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-line bg-brand-surface/50 px-5 py-6 text-center">
        <UserPlus className="mx-auto size-7 text-brand-navy-soft/50" aria-hidden="true" />
        <p className="mt-2 text-sm font-semibold text-brand-navy">
          Add a patient profile to book
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-brand-navy-soft">
          A demo booking must use a patient profile owned by your account.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <Link
            to="/account"
            className="inline-flex min-h-9 items-center rounded-lg bg-brand-blue px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Create personal profile
          </Link>
          <Link
            to="/family"
            className="inline-flex min-h-9 items-center rounded-lg border border-brand-line bg-white px-3 text-xs font-semibold text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
          >
            Add family profile
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div role="group" aria-label="Choose a patient profile" className="space-y-2">
        {profiles.map((profile) => (
          <SelectionCard
            key={profile.id}
            selected={selectedPatientId === profile.id}
            onSelect={() => onSelect(profile.id)}
            title={profile.fullName}
            description={profile.kind === 'self' ? 'Self' : profile.relationship}
            meta={getCareProfileSummary(profile)}
            icon={UserRound}
            badge={
              profile.id === activeProfileId ? (
                <Badge tone="teal">Active profile</Badge>
              ) : profile.kind === 'self' ? (
                <Badge tone="neutral">Self</Badge>
              ) : undefined
            }
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-brand-navy-soft/80">
        <p className="max-w-md leading-relaxed">
          The selected profile is attached to this simulated appointment. Switch the active
          patient from the header at any time.
        </p>
        <Link
          to="/family"
          className="font-semibold text-brand-blue hover:underline"
        >
          Manage family profiles
        </Link>
      </div>
    </div>
  )
}
