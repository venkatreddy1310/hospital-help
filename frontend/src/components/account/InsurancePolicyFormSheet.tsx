import { ShieldCheck, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAccount } from '../../context/accountStore'
import type {
  CareProfile,
  InsurancePolicy,
  InsuranceProviderOption,
  PolicyStatus,
} from '../../types/account'
import { formatInsuranceAmount, isValidDateISO } from '../../utils/account'
import { cn } from '../../utils/cn'
import { BottomSheet } from '../ui/BottomSheet'
import { FormInput, FormSelect, profileLabelClass } from './FormFields'

interface InsurancePolicyFormSheetProps {
  policy?: InsurancePolicy
  initialPatientId?: string | null
  onClose: () => void
  onSaved: (message: string) => void
}

interface PolicyErrors {
  patientId?: string
  providerId?: string
  planName?: string
  policyNumber?: string
  memberId?: string
  startDate?: string
  endDate?: string
  sumInsured?: string
  coveredMembers?: string
}

function getProfileLabel(profile: CareProfile): string {
  return profile.kind === 'self'
    ? `${profile.fullName} (Self)`
    : `${profile.fullName} (${profile.relationship})`
}

export function InsurancePolicyFormSheet({
  policy,
  initialPatientId,
  onClose,
  onSaved,
}: InsurancePolicyFormSheetProps) {
  const {
    profiles,
    insuranceProviders,
    savePolicy,
    isLoading,
  } = useAccount()
  const defaultPatientId =
    policy?.patientId ??
    initialPatientId ??
    profiles[0]?.id ??
    ''

  const [patientId, setPatientId] = useState(defaultPatientId)
  const [providerId, setProviderId] = useState(policy?.providerId ?? '')
  const [planName, setPlanName] = useState(policy?.planName ?? '')
  const [policyNumber, setPolicyNumber] = useState(policy?.policyNumber ?? '')
  const [memberId, setMemberId] = useState(policy?.memberId ?? '')
  const [startDate, setStartDate] = useState(policy?.startDate ?? '')
  const [endDate, setEndDate] = useState(policy?.endDate ?? '')
  const [sumInsured, setSumInsured] = useState(
    policy ? String(policy.sumInsured) : '',
  )
  const [coveredMemberIds, setCoveredMemberIds] = useState<string[]>(() => {
    const initial = policy?.coveredMemberIds ?? [defaultPatientId]
    return initial.filter(Boolean)
  })
  const [status, setStatus] = useState<PolicyStatus>(policy?.status ?? 'active')
  const [errors, setErrors] = useState<PolicyErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const providers: InsuranceProviderOption[] = (() => {
    if (
      policy &&
      !insuranceProviders.some((provider) => provider.id === policy.providerId)
    ) {
      return [
        ...insuranceProviders,
        {
          id: policy.providerId,
          name: policy.providerName,
          planName: policy.planName,
        },
      ]
    }
    return insuranceProviders
  })()

  const selectPatient = (nextPatientId: string) => {
    setPatientId(nextPatientId)
    setCoveredMemberIds((current) =>
      current.includes(nextPatientId) ? current : [...current, nextPatientId],
    )
    setErrors((current) => ({ ...current, patientId: undefined, coveredMembers: undefined }))
  }

  const toggleCoveredMember = (profileId: string) => {
    if (profileId === patientId) return
    setCoveredMemberIds((current) =>
      current.includes(profileId)
        ? current.filter((id) => id !== profileId)
        : [...current, profileId],
    )
    setErrors((current) => ({ ...current, coveredMembers: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerError(null)

    const nextErrors: PolicyErrors = {}
    const patient = profiles.find((profile) => profile.id === patientId)
    const provider = providers.find((item) => item.id === providerId)
    const amount = Number(sumInsured)
    const coveredIds = profiles.map((profile) => profile.id)
    const normalizedCovered = [
      ...new Set([...coveredMemberIds.filter((id) => coveredIds.includes(id)), patientId]),
    ]

    if (!patient) nextErrors.patientId = 'Choose a patient profile.'
    if (!provider) nextErrors.providerId = 'Choose an insurance provider.'
    if (planName.trim().length < 2) {
      nextErrors.planName = 'Enter the policy or plan name.'
    } else if (planName.trim().length > 80) {
      nextErrors.planName = 'Use 80 characters or fewer.'
    }
    if (policyNumber.trim().length < 2) {
      nextErrors.policyNumber = 'Enter the demo policy number.'
    } else if (policyNumber.trim().length > 40) {
      nextErrors.policyNumber = 'Use 40 characters or fewer.'
    }
    if (memberId.trim().length < 2) {
      nextErrors.memberId = 'Enter the demo member ID.'
    } else if (memberId.trim().length > 40) {
      nextErrors.memberId = 'Use 40 characters or fewer.'
    }
    if (!isValidDateISO(startDate)) {
      nextErrors.startDate = 'Choose a valid start date.'
    }
    if (!isValidDateISO(endDate)) {
      nextErrors.endDate = 'Choose a valid expiry date.'
    } else if (isValidDateISO(startDate) && endDate < startDate) {
      nextErrors.endDate = 'Expiry must be on or after the start date.'
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.sumInsured = 'Enter a demo sum insured above zero.'
    } else if (amount > 1_000_000_000) {
      nextErrors.sumInsured = 'Enter a value up to ₹100 crore.'
    }
    if (normalizedCovered.length === 0) {
      nextErrors.coveredMembers = 'Choose at least one covered member.'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || !patient || !provider) return

    setIsSubmitting(true)
    const error = await savePolicy(
      {
        patientId: patient.id,
        patientKind: patient.kind,
        providerId: provider.id,
        providerName: provider.name,
        planName: planName.trim(),
        policyNumber: policyNumber.trim(),
        memberId: memberId.trim(),
        startDate,
        endDate,
        sumInsured: Math.round(amount),
        coveredMemberIds: normalizedCovered,
        status,
      },
      policy?.id,
    )
    setIsSubmitting(false)

    if (error) {
      setServerError(error)
      return
    }

    onSaved(policy ? 'Insurance policy updated.' : 'Insurance policy added.')
    onClose()
  }

  return (
    <BottomSheet
      title={policy ? 'Edit insurance policy' : 'Add insurance policy'}
      description="Policies are user-entered demo information and are never verified with a real insurer."
      onClose={onClose}
      panelClassName="sm:max-w-2xl"
    >
      <form noValidate onSubmit={handleSubmit} className="mt-4">
        {serverError ? (
          <p
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-brand-critical/20 bg-brand-critical-soft px-3.5 py-3 text-xs font-medium text-brand-critical"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {serverError}
          </p>
        ) : null}

        {providers.length === 0 ? (
          <p className="mb-4 flex items-start gap-2 rounded-xl border border-brand-warning/20 bg-brand-warning-soft px-3.5 py-3 text-xs text-brand-warning">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            No demo insurance providers are available. Add one from the demo admin console
            before saving a policy.
          </p>
        ) : null}

        <div className="grid gap-3.5 sm:grid-cols-2">
          <FormSelect
            label="Patient"
            fieldId="policy-patient"
            value={patientId}
            onChange={(event) => selectPatient(event.target.value)}
            error={errors.patientId}
            disabled={isLoading}
            fieldClassName="sm:col-span-2"
          >
            <option value="">Choose a patient profile</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {getProfileLabel(profile)}
              </option>
            ))}
          </FormSelect>

          <FormSelect
            label="Insurance provider"
            fieldId="policy-provider"
            value={providerId}
            onChange={(event) => {
              const nextId = event.target.value
              setProviderId(nextId)
              const provider = providers.find((item) => item.id === nextId)
              if (provider && !planName) setPlanName(provider.planName)
              setErrors((current) => ({ ...current, providerId: undefined }))
            }}
            error={errors.providerId}
          >
            <option value="">Choose a demo provider</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name} · {provider.planName}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Policy / plan name"
            fieldId="policy-plan-name"
            placeholder="e.g. Family Plus 10L"
            value={planName}
            onChange={(event) => {
              setPlanName(event.target.value)
              setErrors((current) => ({ ...current, planName: undefined }))
            }}
            error={errors.planName}
          />
          <FormInput
            label="Policy number"
            fieldId="policy-number"
            placeholder="Demo policy number"
            value={policyNumber}
            onChange={(event) => {
              setPolicyNumber(event.target.value)
              setErrors((current) => ({ ...current, policyNumber: undefined }))
            }}
            error={errors.policyNumber}
          />
          <FormInput
            label="Member ID"
            fieldId="policy-member-id"
            placeholder="Demo member ID"
            value={memberId}
            onChange={(event) => {
              setMemberId(event.target.value)
              setErrors((current) => ({ ...current, memberId: undefined }))
            }}
            error={errors.memberId}
          />
          <FormInput
            label="Start date"
            fieldId="policy-start"
            type="date"
            value={startDate}
            onChange={(event) => {
              setStartDate(event.target.value)
              setErrors((current) => ({ ...current, startDate: undefined }))
            }}
            error={errors.startDate}
          />
          <FormInput
            label="Expiry date"
            fieldId="policy-end"
            type="date"
            value={endDate}
            onChange={(event) => {
              setEndDate(event.target.value)
              setErrors((current) => ({ ...current, endDate: undefined }))
            }}
            error={errors.endDate}
          />
          <FormInput
            label="Sum insured (INR)"
            fieldId="policy-sum"
            type="number"
            min="1"
            step="1"
            placeholder="500000"
            value={sumInsured}
            onChange={(event) => {
              setSumInsured(event.target.value)
              setErrors((current) => ({ ...current, sumInsured: undefined }))
            }}
            error={errors.sumInsured}
            hint={
              Number(sumInsured) > 0
                ? `${formatInsuranceAmount(Number(sumInsured))} demo cover`
                : 'No payment or verification is involved.'
            }
          />
          <FormSelect
            label="Policy status"
            fieldId="policy-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as PolicyStatus)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FormSelect>
        </div>

        <fieldset className="mt-4">
          <legend className={profileLabelClass}>Covered members</legend>
          <p className="mt-1 text-[10px] text-brand-navy-soft/70">
            The policy’s patient is always included. Add other profiles from this account
            to simulate family cover.
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {profiles.map((profile) => {
              const isPatient = profile.id === patientId
              const isChecked = isPatient || coveredMemberIds.includes(profile.id)

              return (
                <label
                  key={profile.id}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs',
                    isChecked
                      ? 'border-brand-blue/30 bg-brand-blue-soft/40'
                      : 'border-brand-line bg-white',
                    isPatient && 'opacity-80',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isPatient}
                    onChange={() => toggleCoveredMember(profile.id)}
                    className="size-4 shrink-0 rounded border-brand-line text-brand-blue focus:ring-brand-blue/20"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-brand-navy">
                      {getProfileLabel(profile)}
                    </span>
                    {isPatient ? (
                      <span className="text-[9px] text-brand-navy-soft">Policy patient</span>
                    ) : null}
                  </span>
                </label>
              )
            })}
          </div>
          {errors.coveredMembers ? (
            <p className="mt-1 text-[10px] text-brand-critical">
              {errors.coveredMembers}
            </p>
          ) : null}
        </fieldset>

        <div className="mt-4 rounded-xl bg-brand-surface px-3.5 py-3 text-[10px] leading-relaxed text-brand-navy-soft">
          <p className="flex items-center gap-1.5 font-semibold text-brand-navy">
            <ShieldCheck className="size-3.5 text-brand-teal-dark" aria-hidden="true" />
            Demo record, not insurer-verified
          </p>
          <p className="mt-1">
            Policy numbers and member IDs are user-entered samples. MediPulse does not
            contact insurers, verify coverage, or settle claims.
          </p>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-brand-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy-soft transition-colors hover:bg-brand-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading || profiles.length === 0}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : policy ? 'Save policy' : 'Add policy'}
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
