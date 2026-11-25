import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/authStore'

export function RequireAuth() {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'initializing') {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-brand-line bg-white p-8 text-center text-sm text-brand-navy-soft">
        Checking your account session…
      </div>
    )
  }

  if (!user) {
    const next = `${location.pathname}${location.search}`
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(next)}`}
        replace
        state={{ from: next }}
      />
    )
  }

  return <Outlet />
}
