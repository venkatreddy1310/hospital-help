import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { BottomSheet } from '../ui/BottomSheet'
import { adminDangerButtonClass, adminSecondaryButtonClass } from './fieldStyles'

interface ConfirmDialogProps {
  title: string
  description: ReactNode
  confirmLabel: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = 'Keep as is',
  tone = 'danger',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <BottomSheet title={title} onClose={onClose} panelClassName="sm:max-w-md">
      <div className="mt-2 text-xs leading-relaxed text-brand-navy-soft">
        {description}
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className={adminSecondaryButtonClass}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={cn(
            tone === 'danger'
              ? adminDangerButtonClass
              : 'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark',
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </BottomSheet>
  )
}
