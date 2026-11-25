import type { LucideIcon } from 'lucide-react'

interface HospitalFacilityCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function HospitalFacilityCard({
  icon: Icon,
  title,
  description,
}: HospitalFacilityCardProps) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-brand-line bg-brand-surface/50 p-3">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-teal-dark shadow-sm"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-brand-navy">{title}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-brand-navy-soft">
          {description}
        </p>
      </div>
    </div>
  )
}
