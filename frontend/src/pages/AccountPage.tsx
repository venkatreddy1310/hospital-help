import {
  ArrowRight,
  CalendarDays,
  CircleCheck,
  FileText,
  LogOut,
  Pencil,
  ShieldCheck,
  TriangleAlert,
  UserPlus,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PatientAvatar } from '../components/account/PatientAvatar'
import { ProfileFormSheet } from '../components/account/ProfileFormSheet'
import { DemoNotice } from '../components/common/DemoNotice'
import { PageHeader } from '../components/common/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useAccount } from '../context/accountStore'
import { useAuth } from '../context/authStore'
import {
  calculateAge,
  genderLabels,
  getCareProfileSummary,
} from '../utils/account'
import { formatLongDate } from '../utils/dateTime'

export function AccountPage() {
  const { user, isDemoMode, signOut } = useAuth()
  const {
    selfProfile,
    familyMembers,
    policies,
    activeProfile,
    isLoading,
    error,
  } = useAccount()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isEditing, setIsEditing] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(
    searchParams.get('welcome') === '1'
      ? isDemoMode
        ? 'Demo session ready. Create or review your simulated personal profile below.'
        : 'Account created. Add your personal profile to start booking.'
      : null,
  )
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Your MediPulse account"
        title="Account & profiles"
        description="Manage the personal profile judges and demo bookings use, plus the family members and insurance records owned by this account."
        actions={
          <>
            <Link
              to="/family"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 text-xs font-semibold text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
            >
              <UsersRound className="size-3.5" aria-hidden="true" />
              Family ({familyMembers.length})
            </Link>
            <Link
              to="/insurance"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-blue px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              Insurance ({policies.length})
            </Link>
          </>
        }
      />

      {isDemoMode ? (
        <DemoNotice className="mb-4">
          Clearly labeled demo mode: this account session and all profile data live only in
          this browser. No password is stored, and no real patient or insurer record exists.
        </DemoNotice>
      ) : null}

      {statusMessage ? (
        <p
          role="status"
          className="mb-4 flex items-start gap-2 rounded-xl border border-brand-teal/20 bg-brand-teal-soft/70 px-3.5 py-3 text-xs font-medium text-brand-teal-dark"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {statusMessage}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-brand-critical/20 bg-brand-critical-soft px-3.5 py-3 text-xs font-medium text-brand-critical"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <Card className="bg-white">
          <p className="text-sm text-brand-navy-soft">Loading your account profiles…</p>
        </Card>
      ) : selfProfile ? (
        <Card className="bg-white">
          <div className="flex flex-wrap items-start gap-3">
            <PatientAvatar name={selfProfile.fullName} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-brand-navy">
                  {selfProfile.fullName}
                </h2>
                <Badge tone="teal">Self</Badge>
                {activeProfile?.id === selfProfile.id ? (
                  <Badge tone="navy">Active profile</Badge>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-brand-navy-soft">
                {getCareProfileSummary(selfProfile)}
              </p>
              <p className="mt-1 text-[11px] text-brand-navy-soft">
                {user.email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 text-xs font-semibold text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit
            </button>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-brand-line pt-4 text-xs sm:grid-cols-3">
            <div>
              <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                Date of birth
              </dt>
              <dd className="mt-0.5 font-semibold text-brand-navy">
                {formatLongDate(selfProfile.dateOfBirth)}
              </dd>
              <dd className="text-[10px] text-brand-navy-soft">
                {calculateAge(selfProfile.dateOfBirth)} years
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                Gender
              </dt>
              <dd className="mt-0.5 font-semibold text-brand-navy">
                {genderLabels[selfProfile.gender]}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                Blood group
              </dt>
              <dd className="mt-0.5 font-semibold text-brand-navy">
                {selfProfile.bloodGroup}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                Phone
              </dt>
              <dd className="mt-0.5 font-semibold text-brand-navy">
                {selfProfile.phone}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                Address
              </dt>
              <dd className="mt-0.5 font-semibold text-brand-navy">
                {selfProfile.addressLine}, {selfProfile.city}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                Emergency contact
              </dt>
              <dd className="mt-0.5 font-semibold text-brand-navy">
                {selfProfile.emergencyContactName}
              </dd>
              <dd className="text-[10px] text-brand-navy-soft">
                {selfProfile.emergencyContactPhone}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                Allergies
              </dt>
              <dd className="mt-0.5 text-brand-navy">
                {selfProfile.allergies.length > 0
                  ? selfProfile.allergies.join(', ')
                  : 'None recorded'}
              </dd>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                Medical conditions
              </dt>
              <dd className="mt-0.5 text-brand-navy">
                {selfProfile.medicalConditions.length > 0
                  ? selfProfile.medicalConditions.join(', ')
                  : 'None recorded'}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-line pt-4">
            <Link
              to="/family"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-brand-blue px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              <UsersRound className="size-3.5" aria-hidden="true" />
              Manage family profiles
            </Link>
            <Link
              to="/insurance"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 text-xs font-semibold text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              Insurance policies
            </Link>
            <Link
              to="/appointments"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 text-xs font-semibold text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
            >
              <CalendarDays className="size-3.5" aria-hidden="true" />
              My appointments
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="border-dashed bg-white text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue">
            <UserPlus className="size-5" aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-base font-bold text-brand-navy">
            Create your personal profile
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-brand-navy-soft">
            Add your simulated details so demo bookings use the correct patient and your
            family and insurance records have a primary profile.
          </p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            <UserPlus className="size-3.5" aria-hidden="true" />
            Add personal profile
          </button>
        </Card>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="bg-white">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal-soft text-brand-teal-dark">
              <ShieldCheck className="size-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-brand-navy">Account security</h2>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-brand-navy-soft">Email</dt>
                  <dd className="font-semibold text-brand-navy">{user.email}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-brand-navy-soft">Sign-in method</dt>
                  <dd className="font-semibold text-brand-navy">
                    {isDemoMode ? 'Local demo session' : 'Supabase Auth'}
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-brand-navy-soft">Role</dt>
                  <dd className="font-semibold text-brand-navy capitalize">{user.role}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-brand-navy-soft">Profile ownership</dt>
                  <dd className="font-semibold text-brand-navy">
                    {isDemoMode ? 'This browser only' : 'RLS-scoped to your account'}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-brand-blue hover:underline"
                >
                  Reset password
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-critical hover:underline disabled:opacity-60"
                >
                  <LogOut className="size-3.5" aria-hidden="true" />
                  {isSigningOut ? 'Signing out…' : 'Sign out'}
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-soft text-brand-blue">
              <UsersRound className="size-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-brand-navy">Family overview</h2>
              <p className="mt-1 text-xs text-brand-navy-soft">
                {familyMembers.length > 0
                  ? `${familyMembers.length} family profile${
                      familyMembers.length === 1 ? '' : 's'
                    } can be selected when booking.`
                  : 'No family profiles yet. Add a parent, spouse, child, or sibling.'}
              </p>
              {activeProfile ? (
                <p className="mt-2 rounded-lg bg-brand-surface px-2.5 py-2 text-[11px] text-brand-navy-soft">
                  Active patient:{' '}
                  <strong className="font-semibold text-brand-navy">
                    {activeProfile.fullName}
                  </strong>
                </p>
              ) : null}
              <Link
                to="/family"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue hover:underline"
              >
                Open family profiles
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {isEditing ? (
        <ProfileFormSheet
          kind="self"
          profile={selfProfile ?? undefined}
          onClose={() => setIsEditing(false)}
          onSaved={setStatusMessage}
        />
      ) : null}
    </div>
  )
}
