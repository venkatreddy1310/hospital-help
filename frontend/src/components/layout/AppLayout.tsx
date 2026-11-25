import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { BottomNavigation } from './BottomNavigation'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow"
      >
        Skip to content
      </a>
      <AppHeader />
      <main
        id="main"
        className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-28 lg:px-8 lg:pt-6 lg:pb-14"
      >
        <Outlet />
      </main>
      <footer className="hidden border-t border-brand-line bg-white py-4 lg:block">
        <p className="mx-auto max-w-6xl px-8 text-xs text-brand-navy-soft/70">
          MediPulse 2.0 · Preview build. Hospital data is simulated and not a substitute for
          professional medical care.
        </p>
      </footer>
      <BottomNavigation />
    </div>
  )
}
