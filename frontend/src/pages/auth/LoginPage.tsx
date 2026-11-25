import { ArrowRight, CircleCheck, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthField, PasswordField } from '../../components/auth/AuthField'
import { AuthShell } from '../../components/auth/AuthShell'
import { useAuth } from '../../context/authStore'

export function LoginPage() {
  const { user, status, isDemoMode, signIn, signInAsDemo } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const nextPath = (() => {
    const value = searchParams.get('next')
    return value && value.startsWith('/') && !value.startsWith('//')
      ? value
      : '/account'
  })()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const result = await signIn(email, password)
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    navigate(nextPath, { replace: true })
  }

  if (status === 'initializing') {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-brand-line bg-white p-8 text-center text-sm text-brand-navy-soft">
        Checking your session…
      </div>
    )
  }

  if (user) {
    return (
      <AuthShell
        eyebrow="Already signed in"
        title="Your account is ready"
        description="You are already signed in to a MediPulse account in this browser."
        footer={
          <Link to="/login" className="font-semibold text-brand-blue hover:underline">
            Switch account
          </Link>
        }
      >
        <div className="rounded-xl border border-brand-teal/20 bg-brand-teal-soft px-4 py-3 text-sm text-brand-teal-dark">
          <p className="font-semibold">{user.displayName}</p>
          <p className="mt-0.5 text-xs">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(nextPath, { replace: true })}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
        >
          Continue to account
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to MediPulse"
      description="Access your family profiles, demo insurance records, and simulated appointments."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>
            New here?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-blue hover:underline"
            >
              Create an account
            </Link>
          </span>
          <Link
            to="/forgot-password"
            className="font-semibold text-brand-blue hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      }
    >
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-brand-critical/20 bg-brand-critical-soft px-3.5 py-3 text-xs font-medium text-brand-critical"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        ) : null}

        <AuthField
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint={
            isDemoMode
              ? 'Demo mode does not store or validate this password.'
              : undefined
          }
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {isDemoMode ? (
        <div className="mt-5 rounded-2xl border border-brand-line bg-brand-surface/70 p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-navy">
            <CircleCheck className="size-4 text-brand-teal-dark" aria-hidden="true" />
            Judge-friendly demo access
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-brand-navy-soft">
            Explore the full demo without creating credentials. This restores the seeded
            demo household and local demo records.
          </p>
          <button
            type="button"
            onClick={() => {
              signInAsDemo()
              navigate(nextPath, { replace: true })
            }}
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-brand-blue/20 bg-white px-4 py-2 text-xs font-semibold text-brand-blue transition-colors hover:bg-brand-blue-soft"
          >
            Continue with demo account
          </button>
        </div>
      ) : null}

      <p className="mt-4 text-[10px] leading-relaxed text-brand-navy-soft/70">
        MediPulse never asks for real medical records. Use simulated information only.
      </p>
    </AuthShell>
  )
}
