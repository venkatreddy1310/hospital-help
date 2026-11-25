import {
  CircleCheck,
  FileText,
  Pencil,
  Phone,
  Plus,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  UserCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PatientAvatar } from '../components/account/PatientAvatar'
import { ProfileFormSheet } from '../components/account/ProfileFormSheet'
import { DemoNotice } from '../components/common/DemoNotice'
import { PageHeader } from '../components/common/PageHeader'
import { Badge } from '../components/ui/Badge'
import { BottomSheet } from '../components/ui/BottomSheet'
import { Card } from '../components/ui/Card'
import { useAccount } from '../context/accountStore'
import { useAuth } from '../context/authStore'
import type { FamilyMember } from '../types/account'
import { calculateAge, getCareProfileSummary } from '../utils/account'
import { formatLongDate } from '../utils/dateTime'

export function FamilyProfilesPage() {
  const { isDemoMode } = useAuth()
  const {
    selfProfile,
    familyMembers,
    policies,
    activeProfileId,
    setActiveProfile,
    removeFamilyMember,
    isLoading,
    error,
  } = useAccount()
  const [isAdding, setIsAdding] = useState(false)
  const [editing, setEditing] = useState<FamilyMember | null>(null)
  const [pendingRemove, setPendingRemove] = useState<FamilyMember | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const confirmRemove = async () => {
    if (!pendingRemove) return
    setIsRemoving(true)
    setActionError(null)
    const message = await removeFamilyMember(pendingRemove.id)
    setIsRemoving(false)

    if (message) {
      setActionError(message)
      return
    }

    setStatusMessage(`${pendingRemove.fullName} was removed from this account.`)
    setPendingRemove(null)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Family profiles"
        title="Who do you care for?"
        description="Add and switch between the simulated patient profiles your account uses for bookings, policies, and emergency details."
        actions={
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            disabled={isLoading}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-blue px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add family member
          </button>
        }
      />

      {isDemoMode ? (
        <DemoNotice className="mb-4">
          Demo family profiles are stored in this browser only. Use fictional names and
          details; do not enter real medical information.
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

      {error || actionError ? (
        <p
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-brand-critical/20 bg-brand-critical-soft px-3.5 py-3 text-xs font-medium text-brand-critical"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {actionError ?? error}
        </p>
      ) : null}

      {!selfProfile && !isLoading ? (
        <Card className="mb-4 border-brand-warning/30 bg-brand-warning-soft">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-brand-warning" />
            <div>
              <h2 className="text-sm font-semibold text-brand-warning">
                Add your personal profile first
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-brand-warning">
                A personal profile anchors the account and gives your family insurance
                policies a primary owner.
              </p>
              <Link
                to="/account"
                className="mt-2 inline-flex text-xs font-semibold text-brand-warning underline"
              >
                Go to account setup
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      <section aria-labelledby="active-profile-heading">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="active-profile-heading"
            className="text-base font-bold tracking-tight text-brand-navy"
          >
            Active patient
          </h2>
          <span className="text-[11px] font-medium text-brand-navy-soft">
            Used for guided booking
          </span>
        </div>
        {selfProfile || familyMembers.length > 0 ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[selfProfile, ...familyMembers]
              .filter((profile): profile is NonNullable<typeof profile> =>
                Boolean(profile),
              )
              .map((profile) => {
                const isActive = profile.id === activeProfileId
                return (
                  <button
                    key={profile.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveProfile(profile.id)}
                    className={
                      isActive
                        ? 'flex items-center gap-2.5 rounded-xl border border-brand-blue bg-brand-blue-soft/70 p-3 text-left'
                        : 'flex items-center gap-2.5 rounded-xl border border-brand-line bg-white p-3 text-left transition-colors hover:border-brand-blue/30'
                    }
                  >
                    <PatientAvatar name={profile.fullName} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-brand-navy">
                        {profile.fullName}
                      </span>
                      <span className="block text-[10px] text-brand-navy-soft">
                        {profile.kind === 'self' ? 'Self' : profile.relationship}
                      </span>
                    </span>
                    {isActive ? (
                      <Badge tone="teal">Active</Badge>
                    ) : (
                      <UserCheck
                        className="size-4 text-brand-navy-soft/50"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )
              })}
          </div>
        ) : (
          <Card className="mt-3 bg-white">
            <p className="text-xs text-brand-navy-soft">
              No patient profiles yet. Create your personal profile from the account page.
            </p>
          </Card>
        )}
      </section>

      <section aria-labelledby="family-list-heading" className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="family-list-heading"
            className="text-base font-bold tracking-tight text-brand-navy"
          >
            Family members
          </h2>
          <span className="text-[11px] font-medium text-brand-navy-soft">
            {familyMembers.length} {familyMembers.length === 1 ? 'profile' : 'profiles'}
          </span>
        </div>

        {isLoading ? (
          <Card className="mt-3 bg-white">
            <p className="text-xs text-brand-navy-soft">Loading family profiles…</p>
          </Card>
        ) : familyMembers.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-brand-line bg-white px-6 py-10 text-center">
            <UsersRound
              className="mx-auto size-8 text-brand-navy-soft/40"
              aria-hidden="true"
            />
            <h3 className="mt-3 text-sm font-semibold text-brand-navy">
              No family profiles yet
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-brand-navy-soft">
              Add a parent, spouse, child, or sibling so bookings can be made for the right
              simulated patient.
            </p>
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Add family member
            </button>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {familyMembers.map((member) => {
              const isActive = member.id === activeProfileId
              const age = calculateAge(member.dateOfBirth)
              const linkedPolicies = policies.filter(
                (policy) =>
                  policy.patientId === member.id ||
                  policy.coveredMemberIds.includes(member.id),
              )

              return (
                <article
                  key={member.id}
                  className="flex flex-col rounded-2xl border border-brand-line bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <PatientAvatar name={member.fullName} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-brand-navy">
                          {member.fullName}
                        </h3>
                        <Badge tone="neutral">{member.relationship}</Badge>
                        {isActive ? <Badge tone="teal">Active</Badge> : null}
                      </div>
                      <p className="mt-0.5 text-[11px] text-brand-navy-soft">
                        {getCareProfileSummary(member)}
                      </p>
                    </div>
                  </div>

                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div>
                      <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                        Date of birth
                      </dt>
                      <dd className="mt-0.5 font-semibold text-brand-navy">
                        {formatLongDate(member.dateOfBirth)}
                        {age !== null ? (
                          <span className="ml-1 text-[10px] font-normal text-brand-navy-soft">
                            ({age} yrs)
                          </span>
                        ) : null}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                        Blood group
                      </dt>
                      <dd className="mt-0.5 font-semibold text-brand-navy">
                        {member.bloodGroup}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                        Phone
                      </dt>
                      <dd className="mt-0.5 flex items-center gap-1 font-semibold text-brand-navy">
                        {member.phone ? (
                          <>
                            <Phone className="size-3 text-brand-navy-soft" aria-hidden="true" />
                            {member.phone}
                          </>
                        ) : (
                          <span className="font-normal text-brand-navy-soft">Not provided</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/65 uppercase">
                        Emergency contact
                      </dt>
                      <dd className="mt-0.5 font-semibold text-brand-navy">
                        {member.emergencyContactName || 'Not provided'}
                      </dd>
                    </div>
                  </dl>

                  {member.allergies.length > 0 || member.medicalConditions.length > 0 ? (
                    <div className="mt-3 rounded-lg bg-brand-surface px-3 py-2 text-[10px] leading-relaxed text-brand-navy-soft">
                      {member.allergies.length > 0 ? (
                        <p>
                          <strong className="font-semibold text-brand-navy">Allergies:</strong>{' '}
                          {member.allergies.join(', ')}
                        </p>
                      ) : null}
                      {member.medicalConditions.length > 0 ? (
                        <p className={member.allergies.length > 0 ? 'mt-1' : undefined}>
                          <strong className="font-semibold text-brand-navy">
                            Conditions:
                          </strong>{' '}
                          {member.medicalConditions.join(', ')}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-brand-line/80 pt-3">
                    <Link
                      to={`/insurance?patient=${member.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue hover:underline"
                    >
                      <FileText className="size-3.5" aria-hidden="true" />
                      Policies ({linkedPolicies.length})
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditing(member)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-navy-soft hover:text-brand-blue"
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionError(null)
                        setPendingRemove(member)
                      }}
                      className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-brand-critical hover:underline"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-brand-navy-soft/75">
        <UserRound className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Family profiles are user-entered demo information. They are visible only to the
        account that owns them and are not shared with other users.
      </p>

      {isAdding ? (
        <ProfileFormSheet
          kind="family"
          onClose={() => setIsAdding(false)}
          onSaved={setStatusMessage}
        />
      ) : null}

      {editing ? (
        <ProfileFormSheet
          kind="family"
          profile={editing}
          onClose={() => setEditing(null)}
          onSaved={setStatusMessage}
        />
      ) : null}

      {pendingRemove ? (
        <BottomSheet
          title={`Remove ${pendingRemove.fullName}?`}
          description="This removes the family profile from this account."
          onClose={() => setPendingRemove(null)}
        >
          <div className="mt-4 rounded-xl bg-brand-critical-soft px-3.5 py-3 text-xs leading-relaxed text-brand-critical">
            Any insurance policy assigned to this family member will also be removed.
            Policies covering this member will keep their other covered profiles. This
            cannot be undone for the local demo record.
          </div>
          {actionError ? (
            <p role="alert" className="mt-3 text-xs font-medium text-brand-critical">
              {actionError}
            </p>
          ) : null}
          <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setPendingRemove(null)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy-soft transition-colors hover:bg-brand-surface"
            >
              Keep profile
            </button>
            <button
              type="button"
              onClick={confirmRemove}
              disabled={isRemoving}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-brand-critical px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-critical/90 disabled:opacity-60"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {isRemoving ? 'Removing…' : 'Remove family member'}
            </button>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  )
}
