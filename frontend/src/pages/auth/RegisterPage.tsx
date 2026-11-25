import { ArrowRight, CircleCheck, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthField, PasswordField } from '../../components/auth/AuthField'
import { AuthShell } from '../../components/auth/AuthShell'
import { useAuth } from '../../context/authStore'

export function RegisterPage() {
  const { user, status, isDemoMode, signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const result = await signUp({ fullName, email, password })
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.needsEmailConfirmation) {
      setSuccess(result.message ?? 'Check your email to confirm your account.')
      return
    }

    setSuccess(result.message ?? 'Account created.')
    navigate('/account?welcome=1', { replace: true })
  }

  if (status === 'initializing') {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-brand-line bg-white p-8 text-center text-sm text-brand-navy-soft">
        Checking your session…
      </div>
    )
  }

  if (user && !success) {
    return (
      <AuthShell
        eyebrow="Already signed in"
        title="One account at a time"
        description="Sign out of the current MediPulse account before creating another demo account."
        footer={
          <Link to="/account" className="font-semibold text-brand-blue hover:underline">
            Go to your account
          </Link>
        }
      >
        <div className="rounded-xl border border-brand-line bg-brand-surface px-4 py-3 text-sm text-brand-navy">
          <p className="font-semibold">{user.displayName}</p>
          <p className="mt-0.5 text-xs text-brand-navy-soft">{user.email}</p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      eyebrow={isDemoMode ? 'Local demo account' : 'New patient account'}
      title="Create your MediPulse account"
      description="Start with a personal profile, then add family members and demo insurance policies."
      footer={
        <span>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-blue hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      {success ? (
        <div className="space-y-4">
          <p
            role="status"
            className="flex items-start gap-2 rounded-xl border border-brand-teal/20 bg-brand-teal-soft px-3.5 py-3 text-xs font-medium text-brand-teal-dark"
          >
            <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {success}
          </p>
          <Link
            to="/login"
            className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Go to sign in
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      ) : (
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
            label="Full name"
            autoComplete="name"
            placeholder="e.g. Ananya Rao"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            hint={
              isDemoMode
                ? 'Demo passwords are not stored. Any 8+ character value works.'
                : 'Use at least 8 characters.'
            }
            required
          />
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      )}

      <p className="mt-4 text-[10px] leading-relaxed text-brand-navy-soft/70">
        Use simulated information only. This hackathon preview is not a clinical records
        system and must not hold real health or insurance data.
      </p>
    </AuthShell>
  )
}
