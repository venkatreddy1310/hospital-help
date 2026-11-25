import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

interface PlaceholderPanelProps {
  icon: LucideIcon
  title: string
  description: string
  children?: ReactNode
}

export function PlaceholderPanel({
  icon: Icon,
  title,
  description,
  children,
}: PlaceholderPanelProps) {
  return (
    <Card className="border-dashed bg-white">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-teal-soft text-brand-teal-dark">
          <Icon className="size-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
          <p className="mt-1 max-w-xl text-sm text-brand-navy-soft/80">{description}</p>
        </div>
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </Card>
  )
}
