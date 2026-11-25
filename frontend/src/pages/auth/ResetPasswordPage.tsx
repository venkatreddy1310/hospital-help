import { CircleCheck, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PasswordField } from '../../components/auth/AuthField'
import { AuthShell } from '../../components/auth/AuthShell'
import { useAuth } from '../../context/authStore'

export function ResetPasswordPage() {
  const { isDemoMode, updatePassword } = useAuth()
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
    const result = await updatePassword(password)
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSuccess(result.message ?? 'Password updated.')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <AuthShell
      eyebrow="Choose a new password"
      title="Secure your account"
      description="Enter a new password for the MediPulse account in this session."
      footer={
        <Link to="/login" className="font-semibold text-brand-blue hover:underline">
          Return to sign in
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

        <PasswordField
          label="New password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          hint={
            isDemoMode
              ? 'Demo mode simulates this change and stores no password.'
              : undefined
          }
          required
        />
        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Updating…' : 'Update password'}
        </button>
      </form>

      <p className="mt-4 text-[10px] leading-relaxed text-brand-navy-soft/70">
        If Supabase is configured but no recovery session is present, open the reset link
        from your email before choosing a password.
      </p>
    </AuthShell>
  )
}
