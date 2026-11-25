export type AccountRole = 'patient' | 'admin'

export type AuthSource = 'demo' | 'supabase'

export type AuthStatus = 'initializing' | 'signed-in' | 'signed-out'

export interface AccountUser {
  id: string
  email: string
  displayName: string
  role: AccountRole
  source: AuthSource
}

export type Gender = 'female' | 'male' | 'non-binary' | 'prefer-not-to-say'

export type BloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-'
  | 'Unknown'

export const familyRelationships = [
  'Mother',
  'Father',
  'Spouse',
  'Child',
  'Sibling',
  'Other',
] as const

export type FamilyRelationship = (typeof familyRelationships)[number]

export interface PatientDetails {
  fullName: string
  dateOfBirth: string
  gender: Gender
  phone: string
  bloodGroup: BloodGroup
  addressLine: string
  city: string
  emergencyContactName: string
  emergencyContactPhone: string
  allergies: string[]
  medicalConditions: string[]
}

export interface SelfProfile extends PatientDetails {
  id: string
  ownerId: string
  kind: 'self'
  createdAt: string
  updatedAt: string
}

export interface FamilyMember extends PatientDetails {
  id: string
  ownerId: string
  kind: 'family'
  relationship: FamilyRelationship
  createdAt: string
  updatedAt: string
}

export type CareProfile = SelfProfile | FamilyMember

export type FamilyMemberInput = PatientDetails & {
  relationship: FamilyRelationship
}

export type PolicyStatus = 'active' | 'inactive'
export type PatientKind = 'self' | 'family'

export interface InsurancePolicy {
  id: string
  ownerId: string
  patientId: string
  patientKind: PatientKind
  providerId: string
  providerName: string
  planName: string
  policyNumber: string
  memberId: string
  startDate: string
  endDate: string
  sumInsured: number
  coveredMemberIds: string[]
  status: PolicyStatus
  createdAt: string
  updatedAt: string
}

export type InsurancePolicyInput = Omit<
  InsurancePolicy,
  'id' | 'ownerId' | 'createdAt' | 'updatedAt'
>

export interface InsuranceProviderOption {
  id: string
  name: string
  planName: string
}

export interface AccountData {
  selfProfile: SelfProfile | null
  familyMembers: FamilyMember[]
  policies: InsurancePolicy[]
}
