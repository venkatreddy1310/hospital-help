import type { Appointment } from '../types/appointment'
import type { ConsultationType, Hospital, Specialty, Specialist } from '../types/domain'
import {
  differenceInCalendarDays,
  formatRelativeDate,
  formatTimeSlot,
  getTodayISO,
  parseISODate,
} from './dateTime'
import { getSpecialtyLabel } from './specialists'

export interface SpecialistSlotRef {
  date: string
  time: string
}

export interface SpecialistEntry {
  specialist: Specialist
  hospitals: Hospital[]
  nearestHospital: Hospital | null
  distanceKm: number
  nextSlot: SpecialistSlotRef | null
  availableToday: boolean
}

export interface SpecialistFilters {
  query: string
  specialty: 'all' | Specialty
  consultationType: 'all' | ConsultationType
  availability: 'all' | 'today' | 'next-3-days'
  hospitalId: 'all' | string
  sort: 'distance' | 'earliest' | 'experience'
}

export function getSpecialistHospitals(
  specialist: Specialist,
  hospitals: Hospital[],
): Hospital[] {
  return hospitals.filter((hospital) => specialist.hospitalIds.includes(hospital.id))
}

export function isSlotBooked(
  appointments: Appointment[],
  doctorId: string,
  date: string,
  time: string,
): boolean {
  return appointments.some(
    (appointment) =>
      appointment.doctorId === doctorId &&
      appointment.date === date &&
      appointment.time === time &&
      appointment.status !== 'cancelled',
  )
}

export function isSlotPast(
  date: string,
  time: string,
  now = new Date(),
): boolean {
  const [hour, minute] = time.split(':').map(Number)
  const slotStart = parseISODate(date)
  slotStart.setHours(hour, minute, 0, 0)
  return slotStart.getTime() <= now.getTime()
}

export function getDoctorSlotAvailability(
  specialist: Specialist,
  date: string,
  appointments: Appointment[],
  now = new Date(),
): Array<{ time: string; booked: boolean; past: boolean }> {
  const day = specialist.availability.find((item) => item.date === date)
  if (!day) return []

  return [...day.slots]
    .sort()
    .map((time) => ({
      time,
      booked: isSlotBooked(appointments, specialist.id, date, time),
      past: isSlotPast(date, time, now),
    }))
}

export function getAvailableSlotCount(
  specialist: Specialist,
  date: string,
  appointments: Appointment[],
  now = new Date(),
): number {
  return getDoctorSlotAvailability(specialist, date, appointments, now).filter(
    (slot) => !slot.booked && !slot.past,
  ).length
}

export function getNextAvailableSlot(
  specialist: Specialist,
  appointments: Appointment[],
  today = getTodayISO(),
  now = new Date(),
): SpecialistSlotRef | null {
  const days = [...specialist.availability].sort((a, b) => a.date.localeCompare(b.date))

  for (const day of days) {
    if (day.date < today) continue

    for (const time of [...day.slots].sort()) {
      if (
        !isSlotBooked(appointments, specialist.id, day.date, time) &&
        !isSlotPast(day.date, time, now)
      ) {
        return { date: day.date, time }
      }
    }
  }

  return null
}

export function getSpecialistEntry(
  specialist: Specialist,
  hospitals: Hospital[],
  appointments: Appointment[],
  today = getTodayISO(),
  preferredHospitalId?: string,
): SpecialistEntry {
  const associatedHospitals = getSpecialistHospitals(specialist, hospitals)
  const nearestHospital =
    (preferredHospitalId
      ? associatedHospitals.find((hospital) => hospital.id === preferredHospitalId)
      : undefined) ??
    associatedHospitals.reduce<Hospital | null>(
      (nearest, hospital) =>
        nearest === null || hospital.distanceKm < nearest.distanceKm
          ? hospital
          : nearest,
      null,
    )
  const nextSlot = getNextAvailableSlot(specialist, appointments, today)

  return {
    specialist,
    hospitals: associatedHospitals,
    nearestHospital,
    distanceKm: nearestHospital?.distanceKm ?? specialist.distanceKm,
    nextSlot,
    availableToday: nextSlot?.date === today,
  }
}

export function formatNextSlotLabel(
  nextSlot: SpecialistSlotRef | null,
  today = getTodayISO(),
): string {
  if (!nextSlot) return 'No demo slots in the next 5 days'
  if (nextSlot.date === today) {
    return `Available today · ${formatTimeSlot(nextSlot.time)}`
  }

  return `Next: ${formatRelativeDate(nextSlot.date, today)} · ${formatTimeSlot(nextSlot.time)}`
}

export function filterAndSortSpecialists(
  specialists: Specialist[],
  hospitals: Hospital[],
  appointments: Appointment[],
  filters: SpecialistFilters,
  today = getTodayISO(),
): SpecialistEntry[] {
  const normalizedQuery = filters.query.trim().toLowerCase()
  const preferredHospitalId =
    filters.hospitalId === 'all' ? undefined : filters.hospitalId

  const entries = specialists
    .filter((specialist) => {
      const specialistHospitals = getSpecialistHospitals(specialist, hospitals)

      const matchesQuery =
        normalizedQuery.length === 0 ||
        [
          specialist.name,
          getSpecialtyLabel(specialist.specialty),
          specialist.specialty,
          ...specialistHospitals.flatMap((hospital) => [
            hospital.name,
            hospital.area,
            hospital.address,
          ]),
        ].some((value) => value.toLowerCase().includes(normalizedQuery))

      const matchesSpecialty =
        filters.specialty === 'all' || specialist.specialty === filters.specialty
      const matchesConsultation =
        filters.consultationType === 'all' ||
        specialist.consultationTypes.includes(filters.consultationType)
      const matchesHospital =
        filters.hospitalId === 'all' ||
        specialist.hospitalIds.includes(filters.hospitalId)

      return (
        matchesQuery && matchesSpecialty && matchesConsultation && matchesHospital
      )
    })
    .map((specialist) =>
      getSpecialistEntry(
        specialist,
        hospitals,
        appointments,
        today,
        preferredHospitalId,
      ),
    )
    .filter((entry) => {
      if (filters.availability === 'all') return true
      if (!entry.nextSlot) return false
      if (filters.availability === 'today') return entry.nextSlot.date === today

      const daysAway = differenceInCalendarDays(today, entry.nextSlot.date)
      return daysAway >= 0 && daysAway <= 2
    })

  entries.sort((a, b) => {
    if (filters.sort === 'earliest') {
      const aKey = a.nextSlot ? `${a.nextSlot.date}T${a.nextSlot.time}` : '9999-12-31'
      const bKey = b.nextSlot ? `${b.nextSlot.date}T${b.nextSlot.time}` : '9999-12-31'
      return aKey.localeCompare(bKey) || a.distanceKm - b.distanceKm
    }

    if (filters.sort === 'experience') {
      return (
        b.specialist.experienceYears - a.specialist.experienceYears ||
        a.distanceKm - b.distanceKm
      )
    }

    return a.distanceKm - b.distanceKm || b.specialist.experienceYears - a.specialist.experienceYears
  })

  return entries
}
