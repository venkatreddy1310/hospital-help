import { MoreHorizontal } from 'lucide-react'
import { useCallback, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { MoreSheet } from './MoreSheet'
import { morePaths, primaryNav } from './navigation'

export function BottomNavigation() {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const { pathname } = useLocation()
  const closeMore = useCallback(() => setIsMoreOpen(false), [])

  const isMoreActive = morePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5 px-1">
          {primaryNav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-0.5 px-1 pt-2 pb-2 text-[10px] font-semibold',
                    isActive ? 'text-brand-blue' : 'text-brand-navy-soft',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'flex h-7 w-11 items-center justify-center rounded-full transition-colors',
                        isActive ? 'bg-brand-blue-soft' : 'bg-transparent',
                      )}
                    >
                      <item.icon className="size-5" aria-hidden="true" />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isMoreOpen}
              className={cn(
                'flex w-full flex-col items-center gap-0.5 px-1 pt-2 pb-2 text-[10px] font-semibold',
                isMoreActive ? 'text-brand-blue' : 'text-brand-navy-soft',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-11 items-center justify-center rounded-full transition-colors',
                  isMoreActive ? 'bg-brand-blue-soft' : 'bg-transparent',
                )}
              >
                <MoreHorizontal className="size-5" aria-hidden="true" />
              </span>
              More
            </button>
          </li>
        </ul>
      </nav>

      {isMoreOpen ? <MoreSheet onClose={closeMore} /> : null}
    </>
  )
}
