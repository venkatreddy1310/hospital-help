import type { DemoPatientAccount } from '../types/admin'
import type { Appointment, AppointmentStatus } from '../types/appointment'
import type { Hospital, Specialist } from '../types/domain'
import type { InsuranceProvider } from '../types/insurance'
import { getAppointmentDisplayStatus } from './appointments'
import { addDaysISO, formatRelativeDate, getTodayISO } from './dateTime'

export interface AdminCatalogStats {
  demoPatientAccounts: number
  familyProfiles: number
  hospitals: number
  specialists: number
  activeSpecialists: number
  appointments: number
  availableBeds: number
  occupiedBeds: number
  totalBeds: number
  insuranceProviders: number
  activeInsuranceProviders: number
}

export interface AppointmentStatusCounts {
  all: number
  upcoming: number
  completed: number
  cancelled: number
}

export interface PatientAppointmentSummary {
  total: number
  upcoming: number
  completed: number
  cancelled: number
}

export interface ActivityDay {
  date: string
  label: string
  count: number
}

export function getAppointmentStatusCounts(
  appointments: Appointment[],
  now = new Date(),
): AppointmentStatusCounts {
  const counts: AppointmentStatusCounts = {
    all: appointments.length,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  }

  for (const appointment of appointments) {
    counts[getAppointmentDisplayStatus(appointment, now)] += 1
  }

  return counts
}

export function getAdminCatalogStats(
  hospitals: Hospital[],
  specialists: Specialist[],
  appointments: Appointment[],
  insuranceProviders: InsuranceProvider[],
  patientAccounts: DemoPatientAccount[],
): AdminCatalogStats {
  const totalBeds = hospitals.reduce((sum, hospital) => sum + hospital.totalBeds, 0)
  const availableBeds = hospitals.reduce(
    (sum, hospital) => sum + hospital.availableBeds,
    0,
  )

  return {
    demoPatientAccounts: patientAccounts.length,
    familyProfiles: patientAccounts.reduce(
      (sum, account) =>
        sum + account.members.filter((member) => member.relationship !== 'Self').length,
      0,
    ),
    hospitals: hospitals.length,
    specialists: specialists.length,
    activeSpecialists: specialists.filter((specialist) => specialist.active).length,
    appointments: appointments.length,
    availableBeds,
    occupiedBeds: Math.max(0, totalBeds - availableBeds),
    totalBeds,
    insuranceProviders: insuranceProviders.length,
    activeInsuranceProviders: insuranceProviders.filter((provider) => provider.active)
      .length,
  }
}

/** Counts scheduled, non-cancelled demo appointments for the next few local days. */
export function getAppointmentActivityDays(
  appointments: Appointment[],
  dayCount = 5,
): ActivityDay[] {
  const today = getTodayISO()

  return Array.from({ length: dayCount }, (_, index) => {
    const date = addDaysISO(today, index)
    const count = appointments.filter(
      (appointment) => appointment.date === date && appointment.status !== 'cancelled',
    ).length

    return { date, label: formatRelativeDate(date, today), count }
  })
}

export function getPatientAppointmentSummary(
  account: DemoPatientAccount,
  appointments: Appointment[],
  now = new Date(),
): PatientAppointmentSummary {
  const memberIds = new Set(account.members.map((member) => member.id))
  const summary: PatientAppointmentSummary = {
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  }

  for (const appointment of appointments) {
    if (!memberIds.has(appointment.patientId)) continue

    summary.total += 1
    const status: AppointmentStatus = getAppointmentDisplayStatus(appointment, now)
    summary[status] += 1
  }

  return summary
}
