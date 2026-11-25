import type { Hospital, Specialist } from './domain'
import type { InsuranceProvider } from './insurance'

export type AdminActivityArea =
  | 'hospital'
  | 'doctor'
  | 'appointment'
  | 'insurance'
  | 'patient'
  | 'system'

export interface AdminActivityEntry {
  id: string
  area: AdminActivityArea
  title: string
  detail: string
  timestamp: string
}

export type FamilyRelationship = 'Self' | 'Spouse' | 'Child' | 'Parent' | 'Sibling'

export interface FamilyMember {
  id: string
  name: string
  relationship: FamilyRelationship
  ageBand: string
  insuranceProviderId: string | null
}

export interface DemoPatientAccount {
  id: string
  primaryName: string
  area: string
  /** Local calendar date in YYYY-MM-DD format. */
  memberSince: string
  members: FamilyMember[]
}

export interface AdminCatalogSnapshot {
  version: 1
  /** Seeded demo-data revision, used to merge newly seeded hospitals into stored catalogs once. */
  seedVersion?: number
  hospitals: Hospital[]
  specialists: Specialist[]
  insuranceProviders: InsuranceProvider[]
  patientAccounts: DemoPatientAccount[]
  activity: AdminActivityEntry[]
}
