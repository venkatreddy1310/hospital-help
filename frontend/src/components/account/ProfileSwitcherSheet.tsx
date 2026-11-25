import { Check, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccount } from '../../context/accountStore'
import { getCareProfileSummary } from '../../utils/account'
import { cn } from '../../utils/cn'
import { BottomSheet } from '../ui/BottomSheet'
import { PatientAvatar } from './PatientAvatar'

interface ProfileSwitcherSheetProps {
  onClose: () => void
}

export function ProfileSwitcherSheet({ onClose }: ProfileSwitcherSheetProps) {
  const { profiles, activeProfileId, setActiveProfile } = useAccount()

  return (
    <BottomSheet
      title="Switch patient profile"
      description="Booking and profile-aware actions use the active patient you choose here."
      onClose={onClose}
    >
      <div className="mt-4 space-y-2">
        {profiles.map((profile) => {
          const isActive = profile.id === activeProfileId

          return (
            <button
              key={profile.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                setActiveProfile(profile.id)
                onClose()
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors',
                isActive
                  ? 'border-brand-blue bg-brand-blue-soft/60'
                  : 'border-brand-line bg-white hover:border-brand-blue/30 hover:bg-brand-surface/60',
              )}
            >
              <PatientAvatar name={profile.fullName} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-brand-navy">
                  {profile.fullName}
                </span>
                <span className="block text-[11px] text-brand-navy-soft">
                  {getCareProfileSummary(profile)}
                </span>
              </span>
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border',
                  isActive
                    ? 'border-brand-blue bg-brand-blue text-white'
                    : 'border-brand-line bg-white text-transparent',
                )}
                aria-hidden="true"
              >
                <Check className="size-3" />
              </span>
            </button>
          )
        })}
      </div>

      <Link
        to="/family"
        onClick={onClose}
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-brand-line bg-white px-4 py-2 text-xs font-semibold text-brand-blue transition-colors hover:bg-brand-blue-soft"
      >
        <UserPlus className="size-3.5" aria-hidden="true" />
        Manage family profiles
      </Link>

      <p className="mt-3 text-[10px] leading-relaxed text-brand-navy-soft/70">
        Profiles are simulated and visible only inside this account. Switching profiles
        does not create or change any real medical record.
      </p>
    </BottomSheet>
  )
}
