import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface BottomSheetProps {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  panelClassName?: string
}

export function BottomSheet({
  title,
  description,
  onClose,
  children,
  panelClassName,
}: BottomSheetProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    panelRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-brand-navy/40 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-brand-line bg-white p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl outline-none sm:rounded-3xl sm:pb-5',
          panelClassName,
        )}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-brand-line sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-base font-bold text-brand-navy">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs text-brand-navy-soft">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-1 rounded-full p-2 text-brand-navy-soft transition-colors hover:bg-brand-surface hover:text-brand-navy"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
