import { CalendarX, CircleCheck, Plus, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppointmentCard } from '../components/appointments/AppointmentCard'
import { DemoNotice } from '../components/common/DemoNotice'
import { PageHeader } from '../components/common/PageHeader'
import { Badge } from '../components/ui/Badge'
import { BottomSheet } from '../components/ui/BottomSheet'
import { FilterChip } from '../components/ui/FilterChip'
import { useAccount } from '../context/accountStore'
import { useAppointments } from '../context/appointmentStore'
import { useAuth } from '../context/authStore'
import type {
  Appointment,
  AppointmentStatus,
  AppointmentStatusFilter,
} from '../types/appointment'
import {
  appointmentStatusLabels,
  getAppointmentDisplayStatus,
  getAppointmentSortKey,
  getCancellationSortKey,
} from '../utils/appointments'
import { formatLongDate, formatTimeSlot } from '../utils/dateTime'

const STATUS_ORDER: AppointmentStatus[] = ['upcoming', 'completed', 'cancelled']
const STATUS_FILTERS: AppointmentStatusFilter[] = [
  'all',
  'upcoming',
  'completed',
  'cancelled',
]

export function AppointmentsPage() {
  const {
    myAppointments: appointments,
    cancelAppointment,
    isLoading,
    error,
  } = useAppointments()
  const { user, isDemoMode } = useAuth()
  const { activeProfile } = useAccount()
  const [filter, setFilter] = useState<AppointmentStatusFilter>('all')
  const [pendingCancel, setPendingCancel] = useState<Appointment | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const entries = useMemo(
    () =>
      appointments.map((appointment) => ({
        appointment,
        status: getAppointmentDisplayStatus(appointment),
      })),
    [appointments],
  )

  const grouped = useMemo<Record<AppointmentStatus, typeof entries>>(
    () => ({
      upcoming: entries
        .filter((entry) => entry.status === 'upcoming')
        .sort((a, b) =>
          getAppointmentSortKey(a.appointment).localeCompare(
            getAppointmentSortKey(b.appointment),
          ),
        ),
      completed: entries
        .filter((entry) => entry.status === 'completed')
        .sort((a, b) =>
          getAppointmentSortKey(b.appointment).localeCompare(
            getAppointmentSortKey(a.appointment),
          ),
        ),
      cancelled: entries
        .filter((entry) => entry.status === 'cancelled')
        .sort((a, b) =>
          getCancellationSortKey(b.appointment).localeCompare(
            getCancellationSortKey(a.appointment),
          ),
        ),
    }),
    [entries],
  )

  const counts: Record<AppointmentStatusFilter, number> = {
    all: entries.length,
    upcoming: grouped.upcoming.length,
    completed: grouped.completed.length,
    cancelled: grouped.cancelled.length,
  }

  const visibleStatuses = filter === 'all' ? STATUS_ORDER : [filter]
  const isFilterEmpty = filter !== 'all' && grouped[filter].length === 0

  const confirmCancellation = async () => {
    if (!pendingCancel) return

    setActionError(null)
    const cancelError = await cancelAppointment(pendingCancel.id)

    if (cancelError) {
      setActionError(cancelError)
      return
    }

    setStatusMessage(
      `Demo appointment ${pendingCancel.id} cancelled. The simulated slot is available again.`,
    )
    setPendingCancel(null)
  }

  return (
    <>
      <PageHeader
        eyebrow="Account bookings"
        title="My Appointments"
        description="Review the simulated appointments owned by this account, including bookings made for family profiles."
        actions={
          <>
            <Link
              to="/specialists"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-blue px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Find a specialist
            </Link>
            <Badge tone="teal">
              {isDemoMode ? 'Local demo data' : 'Account records'}
            </Badge>
          </>
        }
      />

      <DemoNotice>
        These appointments are simulated. {isDemoMode ? 'They are stored only in this browser and scoped to your demo account.' : 'They are stored in Supabase and restricted to your signed-in account by row-level security.'} No real hospital or clinician has been contacted and no payment has been taken.
      </DemoNotice>

      <p className="mt-2 text-[11px] text-brand-navy-soft">
        Signed in as <strong className="font-semibold text-brand-navy">{user?.email}</strong>
        {activeProfile ? (
          <>
            {' '}· Active patient:{' '}
            <strong className="font-semibold text-brand-navy">
              {activeProfile.fullName}
            </strong>
          </>
        ) : null}
      </p>

      {error || actionError ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-xl border border-brand-critical/20 bg-brand-critical-soft px-3.5 py-3 text-xs font-medium text-brand-critical"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {actionError ?? error}
        </p>
      ) : null}

      {statusMessage ? (
        <p
          role="status"
          className="mt-3 flex items-start gap-2 rounded-xl border border-brand-teal/20 bg-brand-teal-soft/70 px-3.5 py-3 text-xs font-medium text-brand-teal-dark"
        >
          <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {statusMessage}
        </p>
      ) : null}

      <div
        role="group"
        aria-label="Filter demo appointments by status"
        className="mt-4 flex flex-wrap gap-2"
      >
        {STATUS_FILTERS.map((statusFilter) => {
          const isActive = filter === statusFilter
          const label =
            statusFilter === 'all'
              ? 'All'
              : appointmentStatusLabels[statusFilter]

          return (
            <FilterChip
              key={statusFilter}
              active={isActive}
              onClick={() => setFilter(statusFilter)}
            >
              {label}
              <span
                className={
                  isActive
                    ? 'ml-1.5 rounded-full bg-white/20 px-1.5 text-[10px]'
                    : 'ml-1.5 rounded-full bg-brand-surface px-1.5 text-[10px]'
                }
              >
                {counts[statusFilter]}
              </span>
            </FilterChip>
          )
        })}
      </div>

      {isLoading ? (
        <div className="mt-5 rounded-2xl border border-brand-line bg-white px-6 py-10 text-center text-xs text-brand-navy-soft">
          Loading your account appointments…
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-brand-line bg-white px-6 py-10 text-center">
          <CalendarX className="mx-auto size-8 text-brand-navy-soft/40" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-brand-navy">
            No demo appointments yet
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-brand-navy-soft">
            Browse a fictional doctor profile and complete the guided demo booking. The
            selected patient profile will be attached to the record here.
          </p>
          <Link
            to="/specialists"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Find a specialist
          </Link>
        </div>
      ) : isFilterEmpty ? (
        <div className="mt-5 rounded-2xl border border-dashed border-brand-line bg-white px-6 py-10 text-center">
          <CalendarX className="mx-auto size-8 text-brand-navy-soft/40" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-brand-navy">
            No {appointmentStatusLabels[filter].toLowerCase()} demo appointments
          </h2>
          <p className="mt-1 text-xs text-brand-navy-soft">
            Switch filters to review the other demo appointments stored in this browser.
          </p>
        </div>
      ) : (
        visibleStatuses.map((status) => {
          const group = grouped[status]
          if (group.length === 0) return null

          const headingId = `appointments-${status}-heading`

          return (
            <section key={status} aria-labelledby={headingId} className="mt-5">
              <div className="flex items-center justify-between gap-2">
                <h2
                  id={headingId}
                  className="text-base font-bold tracking-tight text-brand-navy"
                >
                  {appointmentStatusLabels[status]}
                </h2>
                <span className="text-[11px] font-medium text-brand-navy-soft">
                  {group.length} {group.length === 1 ? 'appointment' : 'appointments'}
                </span>
              </div>
              <div className="mt-3 grid gap-3 xl:grid-cols-2">
                {group.map((entry) => (
                  <AppointmentCard
                    key={entry.appointment.id}
                    appointment={entry.appointment}
                    status={status}
                    onCancel={setPendingCancel}
                  />
                ))}
              </div>
            </section>
          )
        })
      )}

      {pendingCancel ? (
        <BottomSheet
          title="Cancel this demo appointment?"
          description="This only updates the simulated record stored in this browser."
          onClose={() => setPendingCancel(null)}
        >
          <div className="mt-4 rounded-xl bg-brand-surface px-3.5 py-3">
            <p className="text-sm font-semibold text-brand-navy">
              {pendingCancel.doctorName}
            </p>
            <p className="mt-0.5 text-xs text-brand-navy-soft">
              {formatLongDate(pendingCancel.date)} ·{' '}
              {formatTimeSlot(pendingCancel.time)}
            </p>
            <p className="mt-1 text-xs text-brand-navy-soft">
              {pendingCancel.hospitalName}
            </p>
            <p className="mt-2 font-mono text-[9px] text-brand-navy-soft/70">
              {pendingCancel.id}
            </p>
          </div>

          {actionError ? (
            <p role="alert" className="mt-3 text-xs font-medium text-brand-critical">
              {actionError}
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                void confirmCancellation()
              }}
              className="min-h-11 rounded-xl bg-brand-critical px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-critical/90"
            >
              Cancel demo appointment
            </button>
            <button
              type="button"
              onClick={() => setPendingCancel(null)}
              className="min-h-11 rounded-xl border border-brand-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-surface"
            >
              Keep appointment
            </button>
          </div>

          <p className="mt-3 text-[10px] leading-relaxed text-brand-navy-soft/75">
            Cancelling releases the simulated slot. No real hospital appointment exists to
            cancel, and no fee is refunded because no payment was taken.
          </p>
        </BottomSheet>
      ) : null}
    </>
  )
}
