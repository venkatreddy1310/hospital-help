import { createContext, useContext } from 'react'
import type { Appointment, AppointmentRecordStatus } from '../types/appointment'

export interface AppointmentContextValue {
  appointments: Appointment[]
  myAppointments: Appointment[]
  isLoading: boolean
  error: string | null
  addAppointment: (appointment: Appointment) => Promise<string | null>
  cancelAppointment: (appointmentId: string) => Promise<string | null>
  setAppointmentStatus: (
    appointmentId: string,
    status: AppointmentRecordStatus,
  ) => Promise<string | null>
  resetAppointments: () => Promise<string | null>
}

export const AppointmentContext = createContext<AppointmentContextValue | null>(null)

export function useAppointments(): AppointmentContextValue {
  const context = useContext(AppointmentContext)
  if (context === null) {
    throw new Error('useAppointments must be used inside AppointmentProvider')
  }
  return context
}
