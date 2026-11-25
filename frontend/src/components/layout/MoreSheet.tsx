import { ChevronRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { BottomSheet } from '../ui/BottomSheet'
import { moreNav } from './navigation'

export function MoreSheet({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet
      title="More"
      description="MediPulse 2.0 · Simulated demo build"
      onClose={onClose}
    >
      <ul className="mt-4 space-y-1">
        {moreNav.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-brand-surface"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue">
                <item.icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-brand-navy">
                  {item.label}
                </span>
                <span className="block text-xs text-brand-navy-soft">
                  {item.description}
                </span>
              </span>
              <ChevronRight
                className="size-4 shrink-0 text-brand-navy-soft/60"
                aria-hidden="true"
              />
            </NavLink>
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-xl bg-brand-surface px-3 py-2.5 text-xs leading-relaxed text-brand-navy-soft">
        All hospitals, bed counts, specialists, and availability shown in this build are
        simulated demo data.
      </p>
    </BottomSheet>
  )
}
