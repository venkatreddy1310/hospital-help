import {
  CircleCheck,
  FileText,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UsersRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { InsurancePolicyFormSheet } from '../components/account/InsurancePolicyFormSheet'
import { DemoNotice } from '../components/common/DemoNotice'
import { PageHeader } from '../components/common/PageHeader'
import { Badge } from '../components/ui/Badge'
import { BottomSheet } from '../components/ui/BottomSheet'
import { Card } from '../components/ui/Card'
import { FilterChip } from '../components/ui/FilterChip'
import { useAccount } from '../context/accountStore'
import { useAuth } from '../context/authStore'
import type { InsurancePolicy } from '../types/account'
import {
  formatInsuranceAmount,
  formatPolicyStatus,
  getCareProfileSummary,
} from '../utils/account'
import { formatLongDate } from '../utils/dateTime'

export function InsurancePoliciesPage() {
  const { isDemoMode } = useAuth()
  const {
    profiles,
    policies,
    isLoading,
    error,
    removePolicy,
  } = useAccount()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<InsurancePolicy | null>(null)
  const [pendingRemove, setPendingRemove] = useState<InsurancePolicy | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const patientFilter = searchParams.get('patient')
  const validFilter = profiles.some((profile) => profile.id === patientFilter)
    ? patientFilter
    : null

  const filteredPolicies = useMemo(
    () =>
      validFilter
        ? policies.filter(
            (policy) =>
              policy.patientId === validFilter ||
              policy.coveredMemberIds.includes(validFilter),
          )
        : policies,
    [policies, validFilter],
  )

  const grouped = useMemo(
    () =>
      profiles
        .map((profile) => ({
          profile,
          policies: filteredPolicies.filter(
            (policy) =>
              policy.patientId === profile.id ||
              policy.coveredMemberIds.includes(profile.id),
          ),
        }))
        .filter((group) => group.policies.length > 0),
    [filteredPolicies, profiles],
  )

  const activeCount = policies.filter((policy) => policy.status === 'active').length
  const coveredCount = new Set(
    policies.flatMap((policy) => policy.coveredMemberIds),
  ).size

  const setFilter = (profileId: string | null) => {
    if (profileId) {
      setSearchParams({ patient: profileId })
    } else {
      setSearchParams({})
    }
  }

  const confirmRemove = async () => {
    if (!pendingRemove) return
    setIsRemoving(true)
    setActionError(null)
    const message = await removePolicy(pendingRemove.id)
    setIsRemoving(false)

    if (message) {
      setActionError(message)
      return
    }

    setStatusMessage('Demo insurance policy removed.')
    setPendingRemove(null)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Insurance profiles"
        title="Insurance policies"
        description="Track user-entered demo policies against the correct patient profile. Nothing here is verified with an insurer or shared with other accounts."
        actions={
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            disabled={isLoading || profiles.length === 0}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-blue px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add policy
          </button>
        }
      />

      {isDemoMode ? (
        <DemoNotice className="mb-4">
          Insurance records in demo mode are saved only in this browser. Policy numbers,
          member IDs, and coverage are fictional samples entered by you.
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

      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-white p-3.5">
          <p className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/70 uppercase">
            Policies
          </p>
          <p className="mt-1 text-xl font-bold text-brand-navy">{policies.length}</p>
        </Card>
        <Card className="bg-white p-3.5">
          <p className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/70 uppercase">
            Active
          </p>
          <p className="mt-1 text-xl font-bold text-brand-navy">{activeCount}</p>
        </Card>
        <Card className="bg-white p-3.5">
          <p className="text-[9px] font-semibold tracking-[0.12em] text-brand-navy-soft/70 uppercase">
            Covered people
          </p>
          <p className="mt-1 text-xl font-bold text-brand-navy">{coveredCount}</p>
        </Card>
      </div>

      {!isLoading && profiles.length === 0 ? (
        <Card className="mt-4 border-dashed bg-white text-center">
          <ShieldCheck
            className="mx-auto size-8 text-brand-navy-soft/40"
            aria-hidden="true"
          />
          <h2 className="mt-3 text-sm font-semibold text-brand-navy">
            Add a patient profile first
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-brand-navy-soft">
            A policy must belong to one of your account’s patient profiles.
          </p>
          <Link
            to="/account"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Go to account setup
          </Link>
        </Card>
      ) : (
        <>
          <div
            role="group"
            aria-label="Filter insurance policies by patient"
            className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1"
          >
            <FilterChip active={!validFilter} onClick={() => setFilter(null)}>
              All patients
            </FilterChip>
            {profiles.map((profile) => (
              <FilterChip
                key={profile.id}
                active={validFilter === profile.id}
                onClick={() => setFilter(profile.id)}
              >
                {profile.fullName}
              </FilterChip>
            ))}
          </div>

          {isLoading ? (
            <Card className="mt-4 bg-white">
              <p className="text-xs text-brand-navy-soft">Loading policies…</p>
            </Card>
          ) : grouped.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-brand-line bg-white px-6 py-10 text-center">
              <FileText
                className="mx-auto size-8 text-brand-navy-soft/40"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-sm font-semibold text-brand-navy">
                No policies for this selection
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-brand-navy-soft">
                Add a demo policy to keep simulated insurance details with the correct
                patient.
              </p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Add policy
              </button>
            </div>
          ) : (
            grouped.map(({ profile, policies: groupPolicies }) => (
              <section key={profile.id} className="mt-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold tracking-tight text-brand-navy">
                      {profile.fullName}
                    </h2>
                    <p className="text-[11px] text-brand-navy-soft">
                      {getCareProfileSummary(profile)}
                    </p>
                  </div>
                  <Badge tone="neutral">
                    {groupPolicies.length}{' '}
                    {groupPolicies.length === 1 ? 'policy' : 'policies'}
                  </Badge>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {groupPolicies.map((policy) => {
                    const coveredNames = policy.coveredMemberIds
                      .map(
                        (id) =>
                          profiles.find((item) => item.id === id)?.fullName ?? null,
                      )
                      .filter((name): name is string => Boolean(name))

                    return (
                      <article
                        key={policy.id}
                        className="rounded-2xl border border-brand-line bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold tracking-[0.12em] text-brand-teal-dark uppercase">
                              {policy.providerName}
                            </p>
                            <h3 className="mt-0.5 text-sm font-semibold text-brand-navy">
                              {policy.planName}
                            </h3>
                            <p className="mt-1 font-mono text-[10px] text-brand-navy-soft">
                              {policy.policyNumber} · Member {policy.memberId}
                            </p>
                          </div>
                          <Badge tone={policy.status === 'active' ? 'teal' : 'neutral'}>
                            {formatPolicyStatus(policy.status)}
                          </Badge>
                        </div>

                        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-brand-line pt-3 text-xs">
                          <div>
                            <dt className="text-[9px] font-semibold tracking-[0.1em] text-brand-navy-soft/65 uppercase">
                              Cover period
                            </dt>
                            <dd className="mt-0.5 font-semibold text-brand-navy">
                              {formatLongDate(policy.startDate)}
                            </dd>
                            <dd className="text-[10px] text-brand-navy-soft">
                              to {formatLongDate(policy.endDate)}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[9px] font-semibold tracking-[0.1em] text-brand-navy-soft/65 uppercase">
                              Sum insured
                            </dt>
                            <dd className="mt-0.5 font-semibold text-brand-navy">
                              {formatInsuranceAmount(policy.sumInsured)}
                            </dd>
                            <dd className="text-[10px] text-brand-navy-soft">demo cover</dd>
                          </div>
                          <div className="col-span-2">
                            <dt className="text-[9px] font-semibold tracking-[0.1em] text-brand-navy-soft/65 uppercase">
                              Covered members
                            </dt>
                            <dd className="mt-0.5 flex items-start gap-1 text-brand-navy">
                              <UsersRound
                                className="mt-0.5 size-3.5 shrink-0 text-brand-navy-soft"
                                aria-hidden="true"
                              />
                              {coveredNames.length > 0
                                ? coveredNames.join(', ')
                                : `${policy.coveredMemberIds.length} linked profiles`}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-brand-line/80 pt-3">
                          <span className="text-[9px] text-brand-navy-soft/70">
                            User-entered · not verified
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActionError(null)
                              setEditingPolicy(policy)
                            }}
                            className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-brand-blue hover:underline"
                          >
                            <Pencil className="size-3.5" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionError(null)
                              setPendingRemove(policy)
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-critical hover:underline"
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                            Remove
                          </button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))
          )}
        </>
      )}

      <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-brand-navy-soft/75">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Policy records stay associated with your account and are protected from other users
        by database row-level security when Supabase is configured. MediPulse makes no
        claim of real insurer verification or claim support.
      </p>

      {isFormOpen ? (
        <InsurancePolicyFormSheet
          initialPatientId={validFilter}
          onClose={() => setIsFormOpen(false)}
          onSaved={setStatusMessage}
        />
      ) : null}

      {editingPolicy ? (
        <InsurancePolicyFormSheet
          policy={editingPolicy}
          onClose={() => setEditingPolicy(null)}
          onSaved={setStatusMessage}
        />
      ) : null}

      {pendingRemove ? (
        <BottomSheet
          title="Remove this demo policy?"
          description="This removes the user-entered policy from your account."
          onClose={() => setPendingRemove(null)}
        >
          <div className="mt-4 rounded-xl bg-brand-surface px-3.5 py-3">
            <p className="text-sm font-semibold text-brand-navy">
              {pendingRemove.providerName} · {pendingRemove.planName}
            </p>
            <p className="mt-1 font-mono text-[10px] text-brand-navy-soft">
              {pendingRemove.policyNumber}
            </p>
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
              Keep policy
            </button>
            <button
              type="button"
              onClick={confirmRemove}
              disabled={isRemoving}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-brand-critical px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-critical/90 disabled:opacity-60"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              {isRemoving ? 'Removing…' : 'Remove policy'}
            </button>
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-brand-navy-soft/75">
            This only deletes local or account-scoped demo data. No real insurer record
            exists.
          </p>
        </BottomSheet>
      ) : null}
    </div>
  )
}
