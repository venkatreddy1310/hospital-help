export type AvailabilityStatus = 'available' | 'limited' | 'full'

export type HospitalType = 'Government' | 'Private'

export type FacilityKey = 'icu' | 'ambulance' | 'diagnostics' | 'pharmacy' | 'bloodBank'

export interface MapPosition {
  /** Horizontal position on the simulated map, in percent. */
  x: number
  /** Vertical position on the simulated map, in percent. */
  y: number
}

export interface GeoCoordinates {
  lat: number
  lng: number
}

export interface Hospital {
  id: string
  name: string
  shortName: string
  type: HospitalType
  area: string
  address: string
  distanceKm: number
  availability: AvailabilityStatus
  availableBeds: number
  totalBeds: number
  emergency: boolean
  facilities: FacilityKey[]
  specialties: string[]
  mapPosition?: MapPosition
  coordinates?: GeoCoordinates
  /** Simulated ICU capacity for the demo catalog; not a live feed. */
  icuBeds?: number
  /** Simulated free ICU beds for the demo catalog; not a live feed. */
  availableIcuBeds?: number
  /** Simulated patient rating out of 5 for the demo catalog. */
  rating?: number
  /** Simulated review count behind `rating`. */
  reviewCount?: number
}

export type Specialty =
  | 'Cardiology'
  | 'Neurology'
  | 'Paediatrics'
  | 'Orthopaedics'
  | 'Dermatology'
  | 'General Medicine'
  | 'Gynaecology'
  | 'ENT'

export type ConsultationType = 'in-person' | 'online'

export interface SpecialistAvailabilityDay {
  /** Local calendar date in YYYY-MM-DD format. */
  date: string
  /** Demo appointment times in 24-hour HH:mm format. */
  slots: string[]
}

export interface Specialist {
  id: string
  name: string
  specialty: Specialty
  hospital: string
  area: string
  distanceKm: number
  experienceYears: number
  availableToday: boolean
  nextAvailable: string
  qualifications: string[]
  bio: string
  languages: string[]
  consultationFee: number
  consultationTypes: ConsultationType[]
  hospitalIds: string[]
  availability: SpecialistAvailabilityDay[]
  /** Whether the fictional profile is listed in the public demo directory. */
  active: boolean
}

export interface DemoLocation {
  id: string
  area: string
  city: string
  state: string
  coordinates: GeoCoordinates
}
