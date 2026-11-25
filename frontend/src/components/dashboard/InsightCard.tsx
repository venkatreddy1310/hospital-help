import type { LucideIcon } from 'lucide-react'

interface InsightCardProps {
  icon: LucideIcon
  title: string
  detail: string
}

export function InsightCard({ icon: Icon, title, detail }: InsightCardProps) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-brand-surface/70 p-2.5">
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-blue shadow-sm"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-brand-navy">{title}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-brand-navy-soft">{detail}</p>
      </div>
    </li>
  )
}
