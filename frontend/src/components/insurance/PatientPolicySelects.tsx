import { useId } from 'react'
import type { CareProfile, InsurancePolicy } from '../../types/account'
import { getPoliciesForPatient } from '../../utils/insurance'

const fieldClass =
  'mt-1.5 min-h-11 w-full rounded-xl border border-brand-line bg-white px-3 text-sm text-brand-navy outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15'

export function PatientPolicySelects({
  profiles,
  policies,
  patientId,
  policyId,
  onPatientChange,
  onPolicyChange,
}: {
  profiles: CareProfile[]
  policies: InsurancePolicy[]
  patientId: string
  policyId: string
  onPatientChange: (patientId: string) => void
  onPolicyChange: (policyId: string) => void
}) {
  const id = useId()
  const patientPolicies = getPoliciesForPatient(policies, patientId || null)

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label htmlFor={`${id}-patient`} className="text-xs font-semibold text-brand-navy">
        Patient
        <select
          id={`${id}-patient`}
          value={patientId}
          onChange={(event) => onPatientChange(event.target.value)}
          className={fieldClass}
          required
        >
          <option value="">Select a patient</option>
          {profiles.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {profile.fullName} · {profile.kind === 'self' ? 'Self' : profile.relationship}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor={`${id}-policy`} className="text-xs font-semibold text-brand-navy">
        Policy
        <select
          id={`${id}-policy`}
          value={policyId}
          onChange={(event) => onPolicyChange(event.target.value)}
          className={fieldClass}
          disabled={!patientId || patientPolicies.length === 0}
          required
        >
          <option value="">
            {patientId && patientPolicies.length === 0 ? 'No linked demo policy' : 'Select a policy'}
          </option>
          {patientPolicies.map((policy) => (
            <option key={policy.id} value={policy.id}>
              {policy.providerName} · {policy.planName}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
