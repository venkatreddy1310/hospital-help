import { ArrowLeft, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/authStore'
import { cn } from '../../utils/cn'
import { Card } from '../ui/Card'
import { adminNavItems } from './adminNavigation'

function desktopNavClass(isActive: boolean): string {
  return cn(
    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
    isActive
      ? 'bg-brand-blue-soft text-brand-blue'
      : 'text-brand-navy-soft hover:bg-brand-surface hover:text-brand-navy',
  )
}

function mobileNavClass(isActive: boolean): string {
  return cn(
    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
    isActive
      ? 'border-brand-blue bg-brand-blue text-white'
      : 'border-brand-line bg-white text-brand-navy-soft hover:border-brand-blue/30 hover:text-brand-blue',
  )
}

export function AdminLayout() {
  const { user, status, isDemoMode } = useAuth()
  const hasAccess = isDemoMode || user?.role === 'admin'

  if (status === 'initializing') {
    return (
      <Card className="mx-auto max-w-xl bg-white">
        <p className="text-sm text-brand-navy-soft">Checking admin access…</p>
      </Card>
    )
  }

  if (!hasAccess) {
    return (
      <Card className="mx-auto max-w-xl bg-white">
        <span className="flex size-11 items-center justify-center rounded-xl bg-brand-critical-soft text-brand-critical">
          <ShieldX className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-3 text-lg font-bold text-brand-navy">
          Admin access is not available
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-navy-soft">
          {user
            ? 'Your signed-in account does not have an administrator role. Database policies independently enforce admin-only writes.'
            : 'Sign in with an administrator account to open this console. Database policies independently enforce admin-only writes.'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {!user ? (
            <Link
              to="/login?next=%2Fadmin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
            >
              Sign in
            </Link>
          ) : null}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:underline"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to MediPulse
          </Link>
        </div>
      </Card>
    )
  }

  const displayName = user?.displayName ?? 'Demo administrator'

  return (
    <div className="lg:grid lg:grid-cols-[228px_minmax(0,1fr)] lg:items-start lg:gap-6">
      <aside className="hidden lg:sticky lg:top-20 lg:block">
        <div className="rounded-2xl border border-brand-line bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2.5 px-1.5 pt-1 pb-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-navy text-white">
              <ShieldCheck className="size-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-brand-teal-dark uppercase">
                MediPulse admin
              </p>
              <p className="truncate text-sm font-bold text-brand-navy">Operations console</p>
            </div>
          </div>

          <nav aria-label="Admin sections" className="space-y-1">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => desktopNavClass(isActive)}
              >
                <item.icon className="size-4 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-3 rounded-xl bg-brand-warning-soft px-3 py-2.5 text-[11px] leading-relaxed text-brand-warning">
            <p className="font-semibold">
              {isDemoMode ? 'Demo access only' : 'Administrator role'}
            </p>
            <p className="mt-0.5">
              {displayName}.{' '}
              {isDemoMode
                ? 'This console uses a labeled, permissive demo guard and local demo data.'
                : 'The UI checks your role, while Supabase RLS independently enforces admin writes.'}
            </p>
          </div>

          <Link
            to="/"
            className="mt-2 flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold text-brand-navy-soft transition-colors hover:bg-brand-surface hover:text-brand-blue"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Exit to patient app
          </Link>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-3 flex items-start gap-2.5 rounded-2xl border border-brand-warning/20 bg-brand-warning-soft px-3.5 py-3 text-xs leading-relaxed text-brand-warning">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            <strong className="font-semibold">
              {isDemoMode ? 'Demo admin mode.' : 'Role-based admin access.'}
            </strong>{' '}
            {isDemoMode
              ? 'This console uses a permissive demo guard. Catalog and appointment records remain simulated and browser-local.'
              : 'UI access follows your Supabase admin role. Account data is protected by RLS, but catalog editing on this screen remains a demo-local management view.'}
          </p>
        </div>

        <div className="no-scrollbar -mx-4 mb-4 overflow-x-auto px-4 pb-1 lg:hidden">
          <nav aria-label="Admin sections" className="flex gap-2">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => mobileNavClass(isActive)}
              >
                <item.icon className="size-3.5" aria-hidden="true" />
                {item.shortLabel}
              </NavLink>
            ))}
          </nav>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
