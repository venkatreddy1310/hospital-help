import { useServiceLocation } from '../../context/locationStore'
import { Badge } from '../ui/Badge'
import { BottomSheet } from '../ui/BottomSheet'

export function NotificationsSheet({ onClose }: { onClose: () => void }) {
  const { location } = useServiceLocation()

  return (
    <BottomSheet
      title="Notifications"
      description="Simulated alerts for this preview."
      onClose={onClose}
    >
      <ul className="mt-4 space-y-2.5">
        <li className="rounded-xl border border-brand-line p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-brand-navy">Demo mode is active</p>
            <Badge tone="teal">Demo</Badge>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-brand-navy-soft">
            Hospitals, bed counts, distances, and specialist slots in this build are
            simulated values.
          </p>
        </li>
        <li className="rounded-xl border border-brand-line p-3">
          <p className="text-sm font-semibold text-brand-navy">Location set</p>
          <p className="mt-1 text-xs leading-relaxed text-brand-navy-soft">
            Showing emergency care near {location.area}, {location.city}.
          </p>
        </li>
      </ul>
      <p className="mt-4 text-xs text-brand-navy-soft">
        MediPulse does not receive live hospital updates in this preview.
      </p>
    </BottomSheet>
  )
}
