import { PhoneCall, Siren } from 'lucide-react'
import { useId } from 'react'
import { cn } from '../../utils/cn'

interface EmergencyAlertProps {
  title?: string
  description?: string
  className?: string
}

export function EmergencyAlert({
  title = 'Medical emergency?',
  description = 'If you or someone nearby has a severe warning sign, call emergency services now. Do not wait for online guidance.',
  className,
}: EmergencyAlertProps) {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'rounded-2xl border border-brand-critical/25 bg-brand-critical-soft p-4',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-critical">
          <Siren className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className="text-sm font-bold text-brand-critical">
            {title}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-brand-critical/85">{description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="tel:112"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-critical px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <PhoneCall className="size-3.5" aria-hidden="true" />
              Call 112 · all emergencies
            </a>
            <a
              href="tel:108"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-brand-critical/30 bg-white px-3.5 py-2 text-xs font-semibold text-brand-critical transition-colors hover:bg-brand-critical-soft"
            >
              <PhoneCall className="size-3.5" aria-hidden="true" />
              Call 108 · ambulance
            </a>
          </div>
          <p className="mt-2 text-[11px] font-medium leading-relaxed text-brand-critical/90">
            These buttons open your phone dialer. MediPulse does not contact emergency services
            automatically.
          </p>
        </div>
      </div>
    </section>
  )
}
