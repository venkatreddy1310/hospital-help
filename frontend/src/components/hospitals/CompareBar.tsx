import { GitCompare, X } from 'lucide-react'
import type { Hospital } from '../../types/domain'

interface CompareBarProps {
  hospitals: Hospital[]
  maxCompare: number
  onRemove: (id: string) => void
  onClear: () => void
  onCompare: () => void
}

export function CompareBar({
  hospitals,
  maxCompare,
  onRemove,
  onClear,
  onCompare,
}: CompareBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 px-4 lg:bottom-6">
      <div className="mx-auto flex w-full max-w-xl items-center gap-2.5 rounded-2xl border border-brand-line bg-white p-2.5 shadow-xl ring-1 ring-black/5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue-soft text-brand-blue"
          aria-hidden="true"
        >
          <GitCompare className="size-4.5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-brand-navy">
            {hospitals.length} selected
            <span className="ml-1 font-medium text-brand-navy-soft">· max {maxCompare}</span>
          </p>
          {hospitals.length > 0 ? (
            <div className="mt-1 hidden flex-wrap gap-1 sm:flex">
              {hospitals.map((hospital) => (
                <span
                  key={hospital.id}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-surface py-0.5 pr-1 pl-2 text-[10px] font-semibold text-brand-navy-soft"
                >
                  {hospital.shortName}
                  <button
                    type="button"
                    onClick={() => onRemove(hospital.id)}
                    aria-label={`Remove ${hospital.name} from comparison`}
                    className="flex size-5 items-center justify-center rounded-full transition-colors hover:bg-white hover:text-brand-critical"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <p className="mt-0.5 text-[10px] text-brand-navy-soft sm:hidden">
            Pick 2–3 hospitals to compare
          </p>
        </div>

        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-lg px-1.5 py-2 text-[11px] font-semibold text-brand-navy-soft transition-colors hover:bg-brand-surface hover:text-brand-navy"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onCompare}
          disabled={hospitals.length < 2}
          className="shrink-0 rounded-lg bg-brand-blue px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-brand-blue-dark active:bg-brand-blue-dark/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Compare
        </button>
      </div>
      <p aria-live="polite" className="sr-only">
        {hospitals.length} of {maxCompare} hospitals selected for comparison.
      </p>
    </div>
  )
}
