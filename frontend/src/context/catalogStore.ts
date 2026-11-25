import { createContext, useContext } from 'react'
import type {
  AdminActivityArea,
  AdminActivityEntry,
  DemoPatientAccount,
} from '../types/admin'
import type {
  AvailabilityStatus,
  ConsultationType,
  FacilityKey,
  Hospital,
  HospitalType,
  Specialty,
  Specialist,
  SpecialistAvailabilityDay,
} from '../types/domain'
import type {
  CoverageCategory,
  CoverageRules,
  InsuranceProvider,
} from '../types/insurance'

export interface HospitalInput {
  name: string
  shortName: string
  type: HospitalType
  area: string
  address: string
  distanceKm: number
  totalBeds: number
  availableBeds: number
  availability: AvailabilityStatus
  emergency: boolean
  facilities: FacilityKey[]
  specialties: string[]
}

export interface DoctorInput {
  name: string
  specialty: Specialty
  experienceYears: number
  qualifications: string[]
  bio: string
  languages: string[]
  consultationFee: number
  consultationTypes: ConsultationType[]
  hospitalIds: string[]
  availability: SpecialistAvailabilityDay[]
  active: boolean
}

export interface InsuranceProviderInput {
  name: string
  planName: string
  active: boolean
  coverage: CoverageCategory[]
  rules: CoverageRules
  hospitalIds: string[]
}

export interface DemoCatalogContextValue {
  hospitals: Hospital[]
  specialists: Specialist[]
  insuranceProviders: InsuranceProvider[]
  patientAccounts: DemoPatientAccount[]
  activity: AdminActivityEntry[]
  addHospital: (input: HospitalInput) => string
  updateHospital: (id: string, input: HospitalInput) => void
  removeHospital: (id: string) => void
  addSpecialist: (input: DoctorInput) => string
  updateSpecialist: (id: string, input: DoctorInput) => void
  setSpecialistActive: (id: string, active: boolean) => void
  removeSpecialist: (id: string) => void
  addInsuranceProvider: (input: InsuranceProviderInput) => string
  updateInsuranceProvider: (id: string, input: InsuranceProviderInput) => void
  setInsuranceProviderActive: (id: string, active: boolean) => void
  recordActivity: (area: AdminActivityArea, title: string, detail: string) => void
  resetCatalog: () => void
}

export const DemoCatalogContext = createContext<DemoCatalogContextValue | null>(null)

export function useDemoCatalog(): DemoCatalogContextValue {
  const context = useContext(DemoCatalogContext)
  if (context === null) {
    throw new Error('useDemoCatalog must be used inside DemoCatalogProvider')
  }
  return context
}
