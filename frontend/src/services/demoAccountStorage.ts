import type {
  AccountData,
  FamilyMember,
  InsurancePolicy,
  SelfProfile,
} from '../types/account'
import { DEMO_ACCOUNT_ID } from './demoAuth'

const STORAGE_KEY = 'medipulse.demo.patient-accounts.v1'

type StoredAccount = AccountData

type StoredAccounts = Record<string, StoredAccount>

const seedTimestamp = new Date().toISOString()

function createSeedData(): StoredAccount {
  const self: SelfProfile = {
    id: 'demo-patient',
    ownerId: DEMO_ACCOUNT_ID,
    kind: 'self',
    fullName: 'Demo Patient',
    dateOfBirth: '1990-04-12',
    gender: 'prefer-not-to-say',
    phone: '+91 98765 43210',
    bloodGroup: 'O+',
    addressLine: '12 Demo Residency, Road No. 12',
    city: 'Hyderabad',
    emergencyContactName: 'Ananya Rao',
    emergencyContactPhone: '+91 90000 11223',
    allergies: ['Penicillin'],
    medicalConditions: [],
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  }

  const familyMembers: FamilyMember[] = [
    {
      id: 'family-meera-sharma',
      ownerId: DEMO_ACCOUNT_ID,
      kind: 'family',
      relationship: 'Spouse',
      fullName: 'Meera Sharma',
      dateOfBirth: '1992-09-03',
      gender: 'female',
      phone: '+91 98765 43211',
      bloodGroup: 'A+',
      addressLine: '12 Demo Residency, Road No. 12',
      city: 'Hyderabad',
      emergencyContactName: 'Demo Patient',
      emergencyContactPhone: '+91 98765 43210',
      allergies: [],
      medicalConditions: ['Migraine (self-reported)'],
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
    {
      id: 'family-aarav-sharma',
      ownerId: DEMO_ACCOUNT_ID,
      kind: 'family',
      relationship: 'Child',
      fullName: 'Aarav Sharma',
      dateOfBirth: '2017-06-18',
      gender: 'male',
      phone: '',
      bloodGroup: 'B+',
      addressLine: '12 Demo Residency, Road No. 12',
      city: 'Hyderabad',
      emergencyContactName: 'Meera Sharma',
      emergencyContactPhone: '+91 98765 43211',
      allergies: ['Peanuts'],
      medicalConditions: [],
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
  ]

  const policies: InsurancePolicy[] = [
    {
      id: 'policy-demo-aarogya',
      ownerId: DEMO_ACCOUNT_ID,
      patientId: 'demo-patient',
      patientKind: 'self',
      providerId: 'insurance-aarogya',
      providerName: 'Aarogya Shield',
      planName: 'Essential Care 5L',
      policyNumber: 'DEMO-AS-20481',
      memberId: 'DEMO-MEM-1001',
      startDate: '2026-01-01',
      endDate: '2027-12-31',
      sumInsured: 500000,
      coveredMemberIds: [
        'demo-patient',
        'family-meera-sharma',
        'family-aarav-sharma',
      ],
      status: 'active',
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
  ]

  return { selfProfile: self, familyMembers, policies }
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isStoredAccount(value: unknown): value is StoredAccount {
  if (typeof value !== 'object' || value === null) return false
  const account = value as Partial<StoredAccount>
  return (
    (account.selfProfile === null || typeof account.selfProfile === 'object') &&
    Array.isArray(account.familyMembers) &&
    Array.isArray(account.policies)
  )
}

function readStore(): StoredAccounts {
  const storage = getLocalStorage()
  if (!storage) return {}

  try {
    const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}')
    if (typeof parsed !== 'object' || parsed === null) return {}

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        (entry): entry is [string, StoredAccount] => isStoredAccount(entry[1]),
      ),
    )
  } catch {
    return {}
  }
}

function writeStore(store: StoredAccounts): void {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // Storage may be unavailable; the in-memory context still reflects changes.
  }
}

export function loadDemoAccount(ownerId: string): AccountData {
  const store = readStore()

  if (!store[ownerId] && ownerId === DEMO_ACCOUNT_ID) {
    store[ownerId] = createSeedData()
    writeStore(store)
  }

  const account = store[ownerId] ?? {
    selfProfile: null,
    familyMembers: [],
    policies: [],
  }

  return {
    selfProfile: account.selfProfile,
    familyMembers: account.familyMembers.filter(isFamilyMember),
    policies: account.policies.filter(isInsurancePolicy),
  }
}

function isFamilyMember(value: unknown): value is FamilyMember {
  if (typeof value !== 'object' || value === null) return false
  const member = value as Partial<FamilyMember>
  return (
    typeof member.id === 'string' &&
    typeof member.ownerId === 'string' &&
    member.kind === 'family' &&
    typeof member.fullName === 'string' &&
    typeof member.relationship === 'string' &&
    isStringArray(member.allergies) &&
    isStringArray(member.medicalConditions)
  )
}

function isInsurancePolicy(value: unknown): value is InsurancePolicy {
  if (typeof value !== 'object' || value === null) return false
  const policy = value as Partial<InsurancePolicy>
  return (
    typeof policy.id === 'string' &&
    typeof policy.ownerId === 'string' &&
    typeof policy.patientId === 'string' &&
    (policy.patientKind === 'self' || policy.patientKind === 'family') &&
    typeof policy.providerId === 'string' &&
    typeof policy.providerName === 'string' &&
    typeof policy.planName === 'string' &&
    typeof policy.policyNumber === 'string' &&
    typeof policy.memberId === 'string' &&
    typeof policy.startDate === 'string' &&
    typeof policy.endDate === 'string' &&
    typeof policy.sumInsured === 'number' &&
    isStringArray(policy.coveredMemberIds) &&
    (policy.status === 'active' || policy.status === 'inactive')
  )
}

export function saveDemoAccount(ownerId: string, account: AccountData): void {
  const store = readStore()
  store[ownerId] = {
    selfProfile: account.selfProfile,
    familyMembers: account.familyMembers,
    policies: account.policies,
  }
  writeStore(store)
}

export function createLocalId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
