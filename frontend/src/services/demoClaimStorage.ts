import type {
  CashlessPreauthorization,
  ClaimData,
  ReimbursementClaim,
} from '../types/claims'

const STORAGE_KEY = 'medipulse.demo.claim-workflows.v1'

type StoredClaims = Record<string, ClaimData>

const EMPTY_DATA: ClaimData = { preauthorizations: [], reimbursements: [] }

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function readStore(): StoredClaims {
  const storage = getLocalStorage()
  if (!storage) return {}

  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}')
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as StoredClaims)
      : {}
  } catch {
    return {}
  }
}

export function loadDemoClaims(ownerId: string): ClaimData {
  const data = readStore()[ownerId]
  return {
    preauthorizations: Array.isArray(data?.preauthorizations)
      ? data.preauthorizations.filter(isPreauthorization)
      : [],
    reimbursements: Array.isArray(data?.reimbursements)
      ? data.reimbursements.filter(isReimbursement)
      : [],
  }
}

export function saveDemoClaims(ownerId: string, data: ClaimData): void {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    const store = readStore()
    store[ownerId] = data
    storage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // In-memory context state still reflects the change.
  }
}

function hasClaimIdentity(value: unknown): value is {
  id: string
  code: string
  ownerId: string
  patientId: string
  policyId: string
  hospitalId: string
} {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return ['id', 'code', 'ownerId', 'patientId', 'policyId', 'hospitalId'].every(
    (key) => typeof record[key] === 'string',
  )
}

function isPreauthorization(value: unknown): value is CashlessPreauthorization {
  return (
    hasClaimIdentity(value) &&
    Array.isArray((value as CashlessPreauthorization).preparedDocuments)
  )
}

function isReimbursement(value: unknown): value is ReimbursementClaim {
  return (
    hasClaimIdentity(value) &&
    typeof (value as ReimbursementClaim).checklist === 'object' &&
    (value as ReimbursementClaim).checklist !== null
  )
}

export const emptyClaimData = EMPTY_DATA
