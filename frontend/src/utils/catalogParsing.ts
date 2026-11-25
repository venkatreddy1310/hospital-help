import type {
  AdminActivityArea,
  AdminActivityEntry,
  AdminCatalogSnapshot,
  DemoPatientAccount,
  FamilyMember,
  FamilyRelationship,
} from '../types/admin'
import type {
  AvailabilityStatus,
  ConsultationType,
  FacilityKey,
  GeoCoordinates,
  Hospital,
  HospitalType,
  MapPosition,
  Specialty,
  Specialist,
  SpecialistAvailabilityDay,
} from '../types/domain'
import type { CoverageCategory, CoverageRules, InsuranceProvider } from '../types/insurance'
import { coverageCategoryOptions } from './adminData'
import { availabilityStatuses, facilityOptions } from './adminCatalog'
import { getTodayISO } from './dateTime'
import { specialtyOptions } from './specialists'

const relationships: FamilyRelationship[] = [
  'Self',
  'Spouse',
  'Child',
  'Parent',
  'Sibling',
]

const activityAreas: AdminActivityArea[] = [
  'hospital',
  'doctor',
  'appointment',
  'insurance',
  'patient',
  'system',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readId(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function readString(
  record: Record<string, unknown>,
  key: string,
  fallback = '',
): string {
  const value = record[key]
  return typeof value === 'string' ? value : fallback
}

function readNumber(
  record: Record<string, unknown>,
  key: string,
  fallback = 0,
): number {
  const value = record[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function readBoolean(
  record: Record<string, unknown>,
  key: string,
  fallback: boolean,
): boolean {
  const value = record[key]
  return typeof value === 'boolean' ? value : fallback
}

function readOptionalNumber(
  record: Record<string, unknown>,
  key: string,
  min: number,
  max: number,
): number | undefined {
  const value = record[key]
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(max, Math.max(min, value))
}

function readStringList(record: Record<string, unknown>, key: string): string[] {
  const value = record[key]
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function parseMapPosition(value: unknown): MapPosition | undefined {
  if (!isRecord(value)) return undefined

  const x = readNumber(value, 'x', Number.NaN)
  const y = readNumber(value, 'y', Number.NaN)
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined

  return {
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
  }
}

function parseGeoCoordinates(value: unknown): GeoCoordinates | undefined {
  if (!isRecord(value)) return undefined
  const lat = readNumber(value, 'lat', Number.NaN)
  const lng = readNumber(value, 'lng', Number.NaN)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return undefined
  return { lat, lng }
}

function parseHospital(value: unknown): Hospital | null {
  if (!isRecord(value)) return null

  const id = readId(value, 'id')
  const name = readId(value, 'name')
  if (!id || !name) return null

  const type: HospitalType = value.type === 'Government' ? 'Government' : 'Private'
  const availability: AvailabilityStatus = availabilityStatuses.includes(
    value.availability as AvailabilityStatus,
  )
    ? (value.availability as AvailabilityStatus)
    : 'available'
  const facilities = readStringList(value, 'facilities').filter((facility) =>
    facilityOptions.includes(facility as FacilityKey),
  ) as FacilityKey[]
  const icuBeds = readOptionalNumber(value, 'icuBeds', 0, 100_000)
  const availableIcuBeds =
    icuBeds === undefined
      ? undefined
      : Math.min(
          icuBeds,
          readOptionalNumber(value, 'availableIcuBeds', 0, 100_000) ?? 0,
        )
  const reviewCount = readOptionalNumber(value, 'reviewCount', 0, 10_000_000)

  return {
    id,
    name,
    shortName: readString(value, 'shortName', name),
    type,
    area: readString(value, 'area', 'Unspecified demo area'),
    address: readString(value, 'address', 'Simulated demo address'),
    distanceKm: Math.max(0, readNumber(value, 'distanceKm', 0)),
    availability,
    availableBeds: Math.max(0, readNumber(value, 'availableBeds', 0)),
    totalBeds: Math.max(0, readNumber(value, 'totalBeds', 0)),
    emergency: readBoolean(value, 'emergency', false),
    facilities,
    specialties: readStringList(value, 'specialties'),
    mapPosition: parseMapPosition(value.mapPosition),
    coordinates: parseGeoCoordinates(value.coordinates),
    icuBeds: icuBeds === undefined ? undefined : Math.trunc(icuBeds),
    availableIcuBeds:
      availableIcuBeds === undefined ? undefined : Math.trunc(availableIcuBeds),
    rating: readOptionalNumber(value, 'rating', 0, 5),
    reviewCount: reviewCount === undefined ? undefined : Math.trunc(reviewCount),
  }
}

function parseAvailabilityDay(value: unknown): SpecialistAvailabilityDay | null {
  if (!isRecord(value)) return null

  const date = readString(value, 'date')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null

  const slots = readStringList(value, 'slots').filter((slot) =>
    /^\d{2}:\d{2}$/.test(slot),
  )

  return { date, slots }
}

function parseSpecialist(value: unknown): Specialist | null {
  if (!isRecord(value)) return null

  const id = readId(value, 'id')
  const name = readId(value, 'name')
  const specialty = value.specialty as Specialty
  if (!id || !name || !specialtyOptions.includes(specialty)) return null

  const consultationTypes = readStringList(value, 'consultationTypes').filter(
    (type) => type === 'in-person' || type === 'online',
  ) as ConsultationType[]
  const availability = Array.isArray(value.availability)
    ? value.availability
        .map(parseAvailabilityDay)
        .filter((day): day is SpecialistAvailabilityDay => day !== null)
    : []

  return {
    id,
    name,
    specialty,
    hospital: readString(value, 'hospital', 'No demo hospital'),
    area: readString(value, 'area', 'Unassigned'),
    distanceKm: Math.max(0, readNumber(value, 'distanceKm', 0)),
    experienceYears: Math.max(0, readNumber(value, 'experienceYears', 0)),
    availableToday: readBoolean(value, 'availableToday', false),
    nextAvailable: readString(value, 'nextAvailable'),
    qualifications: readStringList(value, 'qualifications'),
    bio: readString(value, 'bio'),
    languages: readStringList(value, 'languages'),
    consultationFee: Math.max(0, readNumber(value, 'consultationFee', 0)),
    consultationTypes,
    hospitalIds: readStringList(value, 'hospitalIds'),
    availability,
    active: readBoolean(value, 'active', true),
  }
}

function parseCoverageRules(value: unknown): CoverageRules {
  if (!isRecord(value)) return {}
  const rules: CoverageRules = {}

  for (const category of coverageCategoryOptions) {
    const candidate = value[category]
    if (!isRecord(candidate)) continue
    const limit = candidate.perClaimLimit
    rules[category] = {
      coPayPercent: Math.min(100, Math.max(0, readNumber(candidate, 'coPayPercent'))),
      deductible: Math.max(0, readNumber(candidate, 'deductible')),
      perClaimLimit:
        typeof limit === 'number' && Number.isFinite(limit) ? Math.max(0, limit) : null,
      waitingPeriodDays: Math.max(0, Math.trunc(readNumber(candidate, 'waitingPeriodDays'))),
      excluded: readBoolean(candidate, 'excluded', false),
      notes: readString(candidate, 'notes'),
    }
  }

  return rules
}

function parseInsuranceProvider(value: unknown): InsuranceProvider | null {
  if (!isRecord(value)) return null

  const id = readId(value, 'id')
  const name = readId(value, 'name')
  if (!id || !name) return null

  const coverage = readStringList(value, 'coverage').filter((category) =>
    coverageCategoryOptions.includes(category as CoverageCategory),
  ) as CoverageCategory[]

  return {
    id,
    name,
    planName: readString(value, 'planName', 'Demo plan'),
    active: readBoolean(value, 'active', true),
    coverage,
    rules: parseCoverageRules(value.rules),
    hospitalIds: readStringList(value, 'hospitalIds'),
    updatedAt: readString(value, 'updatedAt', new Date().toISOString()),
  }
}

function parseFamilyMember(value: unknown): FamilyMember | null {
  if (!isRecord(value)) return null

  const id = readId(value, 'id')
  const name = readId(value, 'name')
  if (!id || !name) return null

  const relationship = relationships.includes(value.relationship as FamilyRelationship)
    ? (value.relationship as FamilyRelationship)
    : 'Sibling'
  const insuranceProviderId =
    typeof value.insuranceProviderId === 'string' && value.insuranceProviderId
      ? value.insuranceProviderId
      : null

  return {
    id,
    name,
    relationship,
    ageBand: readString(value, 'ageBand', 'Not specified'),
    insuranceProviderId,
  }
}

function parsePatientAccount(value: unknown): DemoPatientAccount | null {
  if (!isRecord(value)) return null

  const id = readId(value, 'id')
  const primaryName = readId(value, 'primaryName')
  if (!id || !primaryName) return null

  const members = Array.isArray(value.members)
    ? value.members
        .map(parseFamilyMember)
        .filter((member): member is FamilyMember => member !== null)
    : []
  if (members.length === 0) return null

  return {
    id,
    primaryName,
    area: readString(value, 'area', 'Unspecified demo area'),
    memberSince: readString(value, 'memberSince', getTodayISO()),
    members,
  }
}

function parseActivityEntry(value: unknown): AdminActivityEntry | null {
  if (!isRecord(value)) return null

  const id = readId(value, 'id')
  const title = readId(value, 'title')
  if (!id || !title) return null

  const area = activityAreas.includes(value.area as AdminActivityArea)
    ? (value.area as AdminActivityArea)
    : 'system'

  return {
    id,
    area,
    title,
    detail: readString(value, 'detail'),
    timestamp: readString(value, 'timestamp', new Date().toISOString()),
  }
}

function parseList<T>(
  value: unknown,
  parser: (entry: unknown) => T | null,
): T[] | null {
  if (!Array.isArray(value)) return null

  const seen = new Set<string>()
  const entries: T[] = []

  for (const item of value) {
    const parsed = parser(item)
    if (!parsed) continue

    const id = (parsed as { id?: unknown }).id
    const key = typeof id === 'string' ? id : null
    if (key && seen.has(key)) continue
    if (key) seen.add(key)
    entries.push(parsed)
  }

  return entries
}

/** Validates an untrusted stored snapshot; returns null when it cannot be used. */
export function parseStoredCatalog(raw: unknown): AdminCatalogSnapshot | null {
  if (!isRecord(raw) || raw.version !== 1) return null

  const hospitals = parseList(raw.hospitals, parseHospital)
  const specialists = parseList(raw.specialists, parseSpecialist)
  const insuranceProviders = parseList(raw.insuranceProviders, parseInsuranceProvider)
  const patientAccounts = parseList(raw.patientAccounts, parsePatientAccount)
  const activity = parseList(raw.activity, parseActivityEntry)

  if (
    hospitals === null ||
    hospitals.length === 0 ||
    specialists === null ||
    insuranceProviders === null ||
    patientAccounts === null ||
    activity === null
  ) {
    return null
  }

  return {
    version: 1,
    seedVersion:
      typeof raw.seedVersion === 'number' && Number.isFinite(raw.seedVersion)
        ? raw.seedVersion
        : undefined,
    hospitals,
    specialists,
    insuranceProviders,
    patientAccounts,
    activity,
  }
}
