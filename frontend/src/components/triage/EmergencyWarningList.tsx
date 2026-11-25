import { PhoneCall, TriangleAlert } from 'lucide-react'
import { cn } from '../../utils/cn'
import { emergencySignOptions } from '../../utils/triageData'

interface EmergencyWarningListProps {
  className?: string
}

export function EmergencyWarningList({ className }: EmergencyWarningListProps) {
  return (
    <section
      aria-labelledby="emergency-warning-heading"
      className={cn(
        'rounded-2xl border border-brand-warning/25 bg-brand-warning-soft/60 p-4 sm:p-5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-warning">
          <TriangleAlert className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2
            id="emergency-warning-heading"
            className="text-sm font-bold text-brand-navy"
          >
            Emergency warning signs
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-brand-navy-soft">
            If any of these appear, call 112 or 108 now. Do not wait for another
            assessment.
          </p>
        </div>
      </div>

      <ul className="mt-3 grid gap-1.5 text-xs text-brand-navy-soft sm:grid-cols-2">
        {emergencySignOptions.map((sign) => (
          <li key={sign.id} className="flex items-start gap-2">
            <span
              className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-warning"
              aria-hidden="true"
            />
            {sign.label}
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <a
          href="tel:112"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-warning hover:underline"
        >
          <PhoneCall className="size-3.5" aria-hidden="true" />
          Call 112
        </a>
        <a
          href="tel:108"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-warning hover:underline"
        >
          <PhoneCall className="size-3.5" aria-hidden="true" />
          Call 108
        </a>
        <span className="text-[10px] text-brand-navy-soft/75">
          General safety guidance, not a diagnosis.
        </span>
      </div>
    </section>
  )
}
