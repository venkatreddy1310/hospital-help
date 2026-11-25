import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface DemoNoticeProps {
  children: ReactNode
  className?: string
}

export function DemoNotice({ children, className }: DemoNoticeProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border border-brand-blue/10 bg-brand-blue-soft/70 px-3.5 py-3 text-xs leading-relaxed text-brand-navy-soft',
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-brand-blue" aria-hidden="true" />
      <p>{children}</p>
    </div>
  )
}
