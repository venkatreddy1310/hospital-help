import { Bell, ChevronDown, MapPin, UserRound, UserRoundCheck } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import markUrl from '../../assets/medipulse-mark.svg'
import { ProfileSwitcherSheet } from '../account/ProfileSwitcherSheet'
import { useAccount } from '../../context/accountStore'
import { useServiceLocation } from '../../context/locationStore'
import { cn } from '../../utils/cn'
import { LocationSheet } from './LocationSheet'
import { MoreSheet } from './MoreSheet'
import { NotificationsSheet } from './NotificationsSheet'
import { morePaths, primaryNav } from './navigation'

type SheetName = 'location' | 'more' | 'notifications' | 'patient'

function desktopLinkClass(isActive: boolean): string {
  return cn(
    'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-blue-soft text-brand-blue'
      : 'text-brand-navy-soft hover:bg-brand-surface hover:text-brand-navy',
  )
}

export function AppHeader() {
  const { location } = useServiceLocation()
  const { profiles, activeProfile } = useAccount()
  const { pathname } = useLocation()
  const [openSheet, setOpenSheet] = useState<SheetName | null>(null)
  const closeSheet = useCallback(() => setOpenSheet(null), [])

  const isMoreActive = morePaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-brand-line bg-white/95 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-4 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-3 lg:h-16">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                to="/"
                aria-label="MediPulse home"
                className="flex shrink-0 items-center gap-2.5"
              >
                <img src={markUrl} alt="" className="size-8 rounded-[10px] lg:size-9" />
                <span className="text-lg font-bold tracking-tight text-brand-navy">
                  MediPulse
                </span>
              </Link>
              <span className="hidden h-6 w-px bg-brand-line lg:block" aria-hidden="true" />
              <button
                type="button"
                onClick={() => setOpenSheet('location')}
                aria-haspopup="dialog"
                aria-expanded={openSheet === 'location'}
                className="hidden items-center gap-1.5 rounded-full border border-brand-line bg-white px-3 py-1.5 text-xs font-medium text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-navy lg:flex"
              >
                <MapPin className="size-3.5 text-brand-blue" aria-hidden="true" />
                {location.area}, {location.city}
                <ChevronDown className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {primaryNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => desktopLinkClass(isActive)}
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => setOpenSheet('more')}
                aria-haspopup="dialog"
                aria-expanded={openSheet === 'more'}
                className={cn('flex items-center gap-1', desktopLinkClass(isMoreActive))}
              >
                More
                <ChevronDown className="size-4" aria-hidden="true" />
              </button>
            </nav>

            <div className="flex items-center gap-1.5">
              {profiles.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setOpenSheet('patient')}
                  aria-label="Switch active patient profile"
                  aria-haspopup="dialog"
                  aria-expanded={openSheet === 'patient'}
                  title={`Active patient: ${activeProfile?.fullName ?? 'Choose profile'}`}
                  className="flex h-9 items-center gap-1.5 rounded-full border border-brand-line bg-white px-2.5 text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue sm:max-w-44 sm:px-3"
                >
                  <UserRoundCheck className="size-4 shrink-0" aria-hidden="true" />
                  <span className="hidden truncate text-xs font-semibold sm:inline">
                    {activeProfile?.fullName ?? 'Profile'}
                  </span>
                  <ChevronDown className="hidden size-3.5 shrink-0 sm:block" aria-hidden="true" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpenSheet('notifications')}
                aria-label="Notifications"
                aria-haspopup="dialog"
                aria-expanded={openSheet === 'notifications'}
                className="relative flex size-9 items-center justify-center rounded-full text-brand-navy-soft transition-colors hover:bg-brand-surface hover:text-brand-navy"
              >
                <Bell className="size-5" aria-hidden="true" />
                <span
                  className="absolute top-2 right-2.5 size-2 rounded-full bg-brand-teal ring-2 ring-white"
                  aria-hidden="true"
                />
              </button>
              <Link
                to="/account"
                aria-label="Account and profiles"
                className="flex size-9 items-center justify-center rounded-full border border-brand-line bg-brand-surface text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
              >
                <UserRound className="size-4.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="pb-2.5 lg:hidden">
            <button
              type="button"
              onClick={() => setOpenSheet('location')}
              aria-haspopup="dialog"
              aria-expanded={openSheet === 'location'}
              className="flex w-full items-center gap-2 rounded-xl bg-brand-surface px-3 py-2 text-left transition-colors hover:bg-brand-blue-soft/60"
            >
              <MapPin className="size-4 shrink-0 text-brand-blue" aria-hidden="true" />
              <span className="shrink-0 text-xs font-medium text-brand-navy-soft">
                Your location
              </span>
              <span className="truncate text-xs font-semibold text-brand-navy">
                {location.area}, {location.city}
              </span>
              <ChevronDown
                className="ml-auto size-4 shrink-0 text-brand-navy-soft"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </header>

      {openSheet === 'location' ? <LocationSheet onClose={closeSheet} /> : null}
      {openSheet === 'more' ? <MoreSheet onClose={closeSheet} /> : null}
      {openSheet === 'notifications' ? <NotificationsSheet onClose={closeSheet} /> : null}
      {openSheet === 'patient' ? <ProfileSwitcherSheet onClose={closeSheet} /> : null}
    </>
  )
}
