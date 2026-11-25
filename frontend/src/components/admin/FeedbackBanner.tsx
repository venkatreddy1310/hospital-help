import { CircleCheck, TriangleAlert, X } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface AdminFeedbackState {
  tone: 'success' | 'error'
  message: string
}

interface FeedbackBannerProps {
  feedback: AdminFeedbackState | null
  onDismiss: () => void
  className?: string
}

export function FeedbackBanner({ feedback, onDismiss, className }: FeedbackBannerProps) {
  if (!feedback) return null

  const isSuccess = feedback.tone === 'success'
  const Icon = isSuccess ? CircleCheck : TriangleAlert

  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={cn(
        'mb-4 flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed',
        isSuccess
          ? 'border-brand-teal/25 bg-brand-teal-soft/70 text-brand-teal-dark'
          : 'border-brand-critical/25 bg-brand-critical-soft text-brand-critical',
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">{feedback.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss message"
        className="-m-1 rounded-full p-1 transition-colors hover:bg-white/60"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
