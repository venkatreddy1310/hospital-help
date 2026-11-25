import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { appointmentRemote } from '../services/appointmentRemote'
import { appointmentStorage } from '../services/appointmentStorage'
import { DEMO_ACCOUNT_ID } from '../services/demoAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'
import type { Appointment, AppointmentRecordStatus } from '../types/appointment'
import { AppointmentContext, type AppointmentContextValue } from './appointmentStore'
import { useAuth } from './authStore'

interface RemoteAppointments {
  ownerId: string
  records: Appointment[]
  error: string | null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The appointment change could not be saved.'
}

export function AppointmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(() =>
    isSupabaseConfigured ? [] : appointmentStorage.load(),
  )
  const [remote, setRemote] = useState<RemoteAppointments | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return

    let active = true
    const ownerId = user.id

    void appointmentRemote
      .list()
      .then((records) => {
        if (!active) return
        setRemote({ ownerId, records, error: null })
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setRemote({
          ownerId,
          records: [],
          error: getErrorMessage(loadError),
        })
      })

    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (isSupabaseConfigured) return
    appointmentStorage.save(localAppointments)
  }, [localAppointments])

  const remoteForUser =
    isSupabaseConfigured && user && remote?.ownerId === user.id ? remote : null
  const appointments = useMemo(
    () => (isSupabaseConfigured ? remoteForUser?.records ?? [] : localAppointments),
    [remoteForUser, localAppointments],
  )

  const myAppointments = useMemo(() => {
    if (isSupabaseConfigured) return appointments
    if (!user) return []

    return appointments.filter(
      (appointment) =>
        appointment.ownerId === user.id ||
        (!appointment.ownerId && user.id === DEMO_ACCOUNT_ID),
    )
  }, [appointments, user])

  const addAppointment = useCallback(
    async (appointment: Appointment): Promise<string | null> => {
      if (!user) return 'Sign in before creating an appointment.'

      const ownedAppointment: Appointment = {
        ...appointment,
        ownerId: appointment.ownerId ?? user.id,
      }

      if (isSupabaseConfigured) {
        try {
          const saved = await appointmentRemote.create(ownedAppointment, user.id)
          setRemote((state) =>
            state?.ownerId === user.id
              ? {
                  ...state,
                  records: state.records.some((item) => item.id === saved.id)
                    ? state.records
                    : [saved, ...state.records],
                  error: null,
                }
              : { ownerId: user.id, records: [saved], error: null },
          )
          setActionError(null)
          return null
        } catch (saveError) {
          const message = getErrorMessage(saveError)
          setActionError(message)
          return message
        }
      }

      setLocalAppointments((current) =>
        current.some((item) => item.id === ownedAppointment.id)
          ? current
          : [ownedAppointment, ...current],
      )
      return null
    },
    [user],
  )

  const updateStatus = useCallback(
    async (
      appointmentId: string,
      status: AppointmentRecordStatus,
    ): Promise<string | null> => {
      if (isSupabaseConfigured) {
        try {
          await appointmentRemote.updateStatus(appointmentId, status)
        } catch (updateError) {
          const message = getErrorMessage(updateError)
          setActionError(message)
          return message
        }

        setRemote((state) =>
          state
            ? {
                ...state,
                records: state.records.map((item) =>
                  item.id === appointmentId
                    ? {
                        ...item,
                        status,
                        cancelledAt:
                          status === 'cancelled'
                            ? new Date().toISOString()
                            : undefined,
                      }
                    : item,
                ),
              }
            : state,
        )
        setActionError(null)
        return null
      }

      setLocalAppointments((current) =>
        current.map((item) => {
          if (item.id !== appointmentId || item.status === status) return item

          if (status === 'cancelled') {
            return {
              ...item,
              status,
              cancelledAt: new Date().toISOString(),
            }
          }

          return { ...item, status, cancelledAt: undefined }
        }),
      )
      setActionError(null)
      return null
    },
    [],
  )

  const cancelAppointment = useCallback(
    (appointmentId: string) => updateStatus(appointmentId, 'cancelled'),
    [updateStatus],
  )

  const setAppointmentStatus = useCallback(
    (appointmentId: string, status: AppointmentRecordStatus) =>
      updateStatus(appointmentId, status),
    [updateStatus],
  )

  const resetAppointments = useCallback(async (): Promise<string | null> => {
    if (isSupabaseConfigured) {
      return 'Reset is available only for the local demo; Supabase records are not deleted.'
    }

    setLocalAppointments([])
    return null
  }, [])

  const isLoading =
    isSupabaseConfigured && Boolean(user) && remoteForUser === null

  const value = useMemo<AppointmentContextValue>(
    () => ({
      appointments,
      myAppointments,
      isLoading,
      error: actionError ?? remoteForUser?.error ?? null,
      addAppointment,
      cancelAppointment,
      setAppointmentStatus,
      resetAppointments,
    }),
    [
      appointments,
      myAppointments,
      isLoading,
      actionError,
      remoteForUser,
      addAppointment,
      cancelAppointment,
      setAppointmentStatus,
      resetAppointments,
    ],
  )

  return (
    <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>
  )
}
