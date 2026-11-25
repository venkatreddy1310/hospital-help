import type { InsurancePolicy } from '../types/account'
import type {
  CoverageCategory,
  InsuranceProvider,
} from '../types/insurance'
import { differenceInCalendarDays, getTodayISO } from './dateTime'

export type HospitalInsuranceStatus =
  | 'potential-network'
  | 'non-network'
  | 'policy-expired'
  | 'policy-inactive'
  | 'no-policy'
  | 'insufficient-information'

export interface HospitalInsuranceEvaluation {
  status: HospitalInsuranceStatus
  label: string
  detail: string
  policy: InsurancePolicy | null
  provider: InsuranceProvider | null
}

export interface CoverageEstimate {
  sufficient: boolean
  message: string | null
  eligibleAmount: number
  insurerContribution: number
  patientOutOfPocket: number
  remainingSumInsured: number
  excluded: boolean
  waitingPeriodApplies: boolean
  notes: string[]
}

export const NETWORK_MATCH_DISCLAIMER =
  'Potential network match. Final eligibility and cashless approval require confirmation from the insurer/TPA.'

export const INSUFFICIENT_COVERAGE_MESSAGE =
  'Insufficient policy information for a reliable estimate.'

export function getPoliciesForPatient(
  policies: InsurancePolicy[],
  patientId: string | null,
): InsurancePolicy[] {
  if (!patientId) return []
  return policies.filter(
    (policy) =>
      policy.patientId === patientId || policy.coveredMemberIds.includes(patientId),
  )
}

function isPolicyCurrent(policy: InsurancePolicy, today: string): boolean {
  return policy.startDate <= today && policy.endDate >= today
}

export function evaluateHospitalInsurance(
  patientId: string | null,
  policies: InsurancePolicy[],
  providers: InsuranceProvider[],
  hospitalId: string,
  today = getTodayISO(),
): HospitalInsuranceEvaluation {
  if (!patientId) {
    return {
      status: 'insufficient-information',
      label: 'Insufficient information',
      detail: 'Choose a patient profile to evaluate insurance.',
      policy: null,
      provider: null,
    }
  }

  const patientPolicies = getPoliciesForPatient(policies, patientId)
  if (patientPolicies.length === 0) {
    return {
      status: 'no-policy',
      label: 'No insurance policy',
      detail: 'No user-entered demo policy covers this patient.',
      policy: null,
      provider: null,
    }
  }

  if (patientPolicies.every((policy) => policy.status === 'inactive')) {
    return {
      status: 'policy-inactive',
      label: 'Policy inactive',
      detail: 'Every policy linked to this patient is marked inactive.',
      policy: patientPolicies[0],
      provider: null,
    }
  }

  const activePolicies = patientPolicies.filter((policy) => policy.status === 'active')
  const currentPolicies = activePolicies.filter((policy) => isPolicyCurrent(policy, today))
  if (currentPolicies.length === 0) {
    return {
      status: 'policy-expired',
      label: 'Policy expired',
      detail: 'No active policy validity period covers today.',
      policy: activePolicies[0] ?? patientPolicies[0],
      provider: null,
    }
  }

  const candidates = currentPolicies.map((policy) => {
    const provider = providers.find((item) => item.id === policy.providerId) ?? null
    if (!provider || !provider.active) {
      return {
        status: 'insufficient-information' as const,
        label: 'Insufficient information',
        detail: 'Provider network rules are unavailable or inactive for this policy.',
        policy,
        provider,
        rank: 2,
      }
    }

    if (provider.networkLoaded === false) {
      return {
        status: 'insufficient-information' as const,
        label: 'Insufficient information',
        detail:
          'The provider hospital network could not be loaded, so network status is unknown.',
        policy,
        provider,
        rank: 2,
      }
    }

    if (provider.hospitalIds.includes(hospitalId)) {
      return {
        status: 'potential-network' as const,
        label: 'Potential network match',
        detail: NETWORK_MATCH_DISCLAIMER,
        policy,
        provider,
        rank: 0,
      }
    }

    return {
      status: 'non-network' as const,
      label: 'Non-network hospital',
      detail: `${provider.name} does not list this simulated hospital in its demo network. Reimbursement guidance may still be useful.`,
      policy,
      provider,
      rank: 1,
    }
  })

  candidates.sort((a, b) => a.rank - b.rank)
  const { rank: _rank, ...evaluation } = candidates[0]
  return evaluation
}

export function calculateCoverageEstimate({
  policy,
  provider,
  category,
  treatmentCost,
  today = getTodayISO(),
}: {
  policy: InsurancePolicy | null
  provider: InsuranceProvider | null
  category: CoverageCategory
  treatmentCost: number
  today?: string
}): CoverageEstimate {
  const empty = {
    eligibleAmount: 0,
    insurerContribution: 0,
    patientOutOfPocket: 0,
    remainingSumInsured: policy?.sumInsured ?? 0,
    excluded: false,
    waitingPeriodApplies: false,
    notes: [] as string[],
  }

  if (
    !policy ||
    !provider ||
    !provider.active ||
    policy.status !== 'active' ||
    !isPolicyCurrent(policy, today) ||
    !Number.isFinite(treatmentCost) ||
    treatmentCost <= 0
  ) {
    return { sufficient: false, message: INSUFFICIENT_COVERAGE_MESSAGE, ...empty }
  }

  const rule = provider.rules[category]
  if (!rule) {
    return {
      sufficient: false,
      message: INSUFFICIENT_COVERAGE_MESSAGE,
      ...empty,
      patientOutOfPocket: treatmentCost,
    }
  }

  if (rule.excluded) {
    return {
      sufficient: true,
      message: null,
      ...empty,
      patientOutOfPocket: treatmentCost,
      excluded: true,
      notes: [rule.notes || 'This treatment category is excluded by the configured demo rule.'],
    }
  }

  const waitingPeriodApplies =
    differenceInCalendarDays(policy.startDate, today) < rule.waitingPeriodDays
  if (waitingPeriodApplies) {
    return {
      sufficient: true,
      message: null,
      ...empty,
      patientOutOfPocket: treatmentCost,
      waitingPeriodApplies: true,
      notes: [
        `The configured ${rule.waitingPeriodDays}-day demo waiting period has not elapsed.`,
        rule.notes,
      ].filter(Boolean),
    }
  }

  const eligibleAmount = Math.max(0, treatmentCost - rule.deductible)
  const percentageContribution = eligibleAmount * (1 - rule.coPayPercent / 100)
  const insurerContribution = Math.max(
    0,
    Math.min(
      percentageContribution,
      rule.perClaimLimit ?? Number.POSITIVE_INFINITY,
      policy.sumInsured,
    ),
  )
  const patientOutOfPocket = Math.max(0, treatmentCost - insurerContribution)

  return {
    sufficient: true,
    message: null,
    eligibleAmount,
    insurerContribution,
    patientOutOfPocket,
    remainingSumInsured: Math.max(0, policy.sumInsured - insurerContribution),
    excluded: false,
    waitingPeriodApplies: false,
    notes: [
      `Deductible: ₹${rule.deductible.toLocaleString('en-IN')}. Co-pay: ${rule.coPayPercent}%.`,
      rule.perClaimLimit === null
        ? 'No per-claim limit is configured; the illustrative sum insured still caps the estimate.'
        : `Per-claim limit: ₹${rule.perClaimLimit.toLocaleString('en-IN')}.`,
      rule.notes,
    ].filter(Boolean),
  }
}
