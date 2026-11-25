import type { Appointment } from '../types/appointment'

const STORAGE_KEY = 'medipulse.demo.appointments.v1'

export interface AppointmentStorage {
  load(): Appointment[]
  save(appointments: Appointment[]): void
}

function isAppointment(value: unknown): value is Appointment {
  if (typeof value !== 'object' || value === null) return false

  const item = value as Partial<Appointment>
  return (
    typeof item.id === 'string' &&
    typeof item.doctorId === 'string' &&
    typeof item.doctorName === 'string' &&
    typeof item.specialty === 'string' &&
    typeof item.patientId === 'string' &&
    typeof item.patientName === 'string' &&
    typeof item.hospitalId === 'string' &&
    typeof item.hospitalName === 'string' &&
    typeof item.date === 'string' &&
    typeof item.time === 'string' &&
    (item.consultationType === 'in-person' || item.consultationType === 'online') &&
    typeof item.fee === 'number' &&
    (item.status === 'booked' || item.status === 'cancelled') &&
    typeof item.createdAt === 'string'
  )
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

/** Local demo adapter; replace with a Supabase-backed implementation later. */
export const appointmentStorage: AppointmentStorage = {
  load() {
    const storage = getLocalStorage()
    if (!storage) return []

    try {
      const raw = storage.getItem(STORAGE_KEY)
      if (!raw) return []

      const parsed: unknown = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.filter(isAppointment) : []
    } catch {
      return []
    }
  },

  save(appointments) {
    const storage = getLocalStorage()
    if (!storage) return

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(appointments))
    } catch {
      // Storage can be unavailable in private browsing or when the quota is full.
    }
  },
}
