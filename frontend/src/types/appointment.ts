import type { ConsultationType, Specialty } from './domain'

export type AppointmentRecordStatus = 'booked' | 'cancelled'

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled'

export type AppointmentStatusFilter = 'all' | AppointmentStatus

export interface Appointment {
  id: string
  doctorId: string
  doctorName: string
  specialty: Specialty
  patientId: string
  patientName: string
  hospitalId: string
  hospitalName: string
  /** Local calendar date in YYYY-MM-DD format. */
  date: string
  /** Local appointment time in 24-hour HH:mm format. */
  time: string
  consultationType: ConsultationType
  fee: number
  status: AppointmentRecordStatus
  createdAt: string
  cancelledAt?: string
  /** Account that owns this record. Legacy demo records may omit it. */
  ownerId?: string
  patientKind?: 'self' | 'family'
}

export interface PatientProfile {
  id: string
  name: string
  relationship: string
  summary: string
  isDefault?: boolean
}

export interface BookingDraft {
  patientId: string | null
  hospitalId: string | null
  date: string | null
  time: string | null
  consultationType: ConsultationType | null
}

export type BookingStep = 1 | 2 | 3 | 4 | 5 | 6
