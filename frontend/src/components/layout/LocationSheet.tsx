import { Check, MapPin } from 'lucide-react'
import { useServiceLocation } from '../../context/locationStore'
import { cn } from '../../utils/cn'
import { BottomSheet } from '../ui/BottomSheet'

export function LocationSheet({ onClose }: { onClose: () => void }) {
  const { location, locations, setLocation } = useServiceLocation()

  return (
    <BottomSheet
      title="Change location"
      description="Choose a simulated service area. GPS stays off in this preview."
      onClose={onClose}
    >
      <ul className="mt-4 space-y-2">
        {locations.map((option) => {
          const isSelected = option.id === location.id
          return (
            <li key={option.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  setLocation(option.id)
                  onClose()
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors',
                  isSelected
                    ? 'border-brand-teal/40 bg-brand-teal-soft'
                    : 'border-brand-line bg-white hover:bg-brand-surface',
                )}
              >
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    isSelected
                      ? 'bg-white text-brand-teal-dark'
                      : 'bg-brand-blue-soft text-brand-blue',
                  )}
                >
                  <MapPin className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-brand-navy">
                    {option.area}
                  </span>
                  <span className="block text-xs text-brand-navy-soft">
                    {option.city}, {option.state}
                  </span>
                </span>
                {isSelected ? (
                  <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-brand-teal-dark">
                    <Check className="size-4" aria-hidden="true" />
                    Selected
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-xs text-brand-navy-soft">
        All service areas and hospital distances are simulated for this preview.
      </p>
    </BottomSheet>
  )
}
