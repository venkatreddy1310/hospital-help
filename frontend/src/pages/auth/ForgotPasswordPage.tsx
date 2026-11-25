import { CircleCheck, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthField } from '../../components/auth/AuthField'
import { AuthShell } from '../../components/auth/AuthShell'
import { useAuth } from '../../context/authStore'

export function ForgotPasswordPage() {
  const { isDemoMode, requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    const result = await requestPasswordReset(email)
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess(result.message ?? 'Reset instructions sent.')
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="We will send recovery instructions if an account exists for the email you enter."
      footer={
        <Link to="/login" className="font-semibold text-brand-blue hover:underline">
          Back to sign in
        </Link>
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

        {success ? (
          <p
            role="status"
            className="flex items-start gap-2 rounded-xl border border-brand-teal/20 bg-brand-teal-soft px-3.5 py-3 text-xs font-medium text-brand-teal-dark"
          >
            <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {success}
          </p>
        ) : null}

        <AuthField
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          hint={
            isDemoMode
              ? 'Demo mode simulates the reset without sending email.'
              : 'A reset link will open the MediPulse reset screen.'
          }
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Sending…' : 'Send reset instructions'}
        </button>
      </form>

      {success && !isDemoMode ? (
        <p className="mt-4 text-[11px] leading-relaxed text-brand-navy-soft">
          The link may open this app on a new tab. After following it, you can choose a new
          password on the reset screen.
        </p>
      ) : null}
    </AuthShell>
  )
}
