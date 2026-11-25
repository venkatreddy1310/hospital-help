import type { Appointment, PatientProfile, AppointmentStatus } from '../types/appointment'
import type { ConsultationType, Hospital, Specialist } from '../types/domain'
import { toISODate } from './dateTime'

const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function formatDemoFee(fee: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(fee)
}

function getRandomCode(length: number): string {
  const bytes = new Uint8Array(length)

  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes)
  } else {
    for (let index = 0; index < length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256)
    }
  }

  return Array.from(bytes, (byte) => ID_ALPHABET[byte % ID_ALPHABET.length]).join('')
}

export function generateDemoAppointmentId(now = new Date()): string {
  const date = toISODate(now).replaceAll('-', '')
  return `MP-${date}-${getRandomCode(6)}`
}

export function getAppointmentDisplayStatus(
  appointment: Appointment,
  now = new Date(),
): AppointmentStatus {
  if (appointment.status === 'cancelled') return 'cancelled'

  const appointmentTime = new Date(`${appointment.date}T${appointment.time}:00`)
  return appointmentTime.getTime() <= now.getTime() ? 'completed' : 'upcoming'
}

export function getAppointmentSortKey(appointment: Appointment): string {
  return `${appointment.date}T${appointment.time}`
}

export function getCancellationSortKey(appointment: Appointment): string {
  return appointment.cancelledAt ?? appointment.createdAt
}

interface CreateDemoAppointmentInput {
  doctor: Specialist
  patient: PatientProfile
  hospital: Hospital
  date: string
  time: string
  consultationType: ConsultationType
  ownerId?: string
  patientKind?: 'self' | 'family'
}

export function createDemoAppointment({
  doctor,
  patient,
  hospital,
  date,
  time,
  consultationType,
  ownerId,
  patientKind,
}: CreateDemoAppointmentInput): Appointment {
  return {
    id: generateDemoAppointmentId(),
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    patientId: patient.id,
    patientName: patient.name,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    date,
    time,
    consultationType,
    fee: doctor.consultationFee,
    status: 'booked',
    createdAt: new Date().toISOString(),
    ownerId,
    patientKind,
  }
}
