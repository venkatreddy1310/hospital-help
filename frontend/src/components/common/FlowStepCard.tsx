import { ArrowLeft, ArrowRight, CircleAlert, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface FlowStepCardProps {
  eyebrow: string
  title: string
  description: string
  error?: string | null
  backLabel?: string
  primaryLabel?: string
  primaryIcon?: LucideIcon
  headingId?: string
  onBack: () => void
  onPrimary: () => void
  children: ReactNode
}

export function FlowStepCard({
  eyebrow,
  title,
  description,
  error,
  backLabel = 'Back',
  primaryLabel = 'Continue',
  primaryIcon: PrimaryIcon = ArrowRight,
  headingId,
  onBack,
  onPrimary,
  children,
}: FlowStepCardProps) {
  return (
    <section className="rounded-3xl border border-brand-line bg-white p-5 shadow-sm sm:p-6">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-brand-teal-dark uppercase">
        {eyebrow}
      </p>
      <h1
        id={headingId}
        tabIndex={headingId ? -1 : undefined}
        className="mt-1 text-xl font-bold tracking-tight text-brand-navy focus:outline-none sm:text-2xl"
      >
        {title}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-brand-navy-soft/85">{description}</p>

      <div className="mt-5">{children}</div>

      {error ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-xl bg-brand-critical-soft px-3 py-2.5 text-xs font-medium text-brand-critical"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-brand-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand-line px-4 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-surface sm:justify-start"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {backLabel}
        </button>
        <button
          type="button"
          onClick={onPrimary}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark"
        >
          {primaryLabel}
          <PrimaryIcon className="size-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
