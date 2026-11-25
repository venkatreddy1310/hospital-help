import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { FeedbackBanner, type AdminFeedbackState } from '../../components/admin/FeedbackBanner'
import {
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from '../../components/admin/fieldStyles'
import { PageHeader } from '../../components/common/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Card } from '../../components/ui/Card'
import { FilterChip } from '../../components/ui/FilterChip'
import { SearchBar } from '../../components/ui/SearchBar'
import { useAppointments } from '../../context/appointmentStore'
import type {
  Appointment,
  AppointmentStatus,
  AppointmentStatusFilter,
} from '../../types/appointment'
import type { ConsultationType } from '../../types/domain'
import {
  appointmentStatusLabels,
  formatDemoFee,
  getAppointmentDisplayStatus,
  getAppointmentSortKey,
} from '../../utils/appointments'
import { formatLongDate, formatTimeSlot, formatRelativeTimestamp } from '../../utils/dateTime'

type ConsultationFilter = 'all' | ConsultationType

const statusToneClasses: Record<AppointmentStatus, string> = {
  upcoming: 'bg-brand-blue-soft text-brand-blue',
  completed: 'bg-brand-surface text-brand-navy-soft',
  cancelled: 'bg-brand-critical-soft text-brand-critical',
}

function StatusPill({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusToneClasses[status]}`}
    >
      {appointmentStatusLabels[status]}
    </span>
  )
}

export function AdminAppointmentsPage() {
  const { appointments, setAppointmentStatus } = useAppointments()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusFilter>('all')
  const [consultationFilter, setConsultationFilter] = useState<ConsultationFilter>('all')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null)

  const query = search.trim().toLowerCase()
  const filtered = appointments
    .filter((appointment) => {
      const displayStatus = getAppointmentDisplayStatus(appointment)
      if (statusFilter !== 'all' && displayStatus !== statusFilter) return false
      if (consultationFilter !== 'all' && appointment.consultationType !== consultationFilter) {
        return false
      }
      if (!query) return true
      return [
        appointment.id,
        appointment.patientName,
        appointment.doctorName,
        appointment.hospitalName,
        appointment.specialty,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    })
    .sort((a, b) => getAppointmentSortKey(b).localeCompare(getAppointmentSortKey(a)))

  const detailAppointment = detailId
    ? appointments.find((appointment) => appointment.id === detailId) ?? null
    : null

  const statusCounts = appointments.reduce<Record<AppointmentStatus, number>>(
    (counts, appointment) => {
      counts[getAppointmentDisplayStatus(appointment)] += 1
      return counts
    },
    { upcoming: 0, completed: 0, cancelled: 0 },
  )

  async function handleCancel() {
    if (!cancelTarget) return
    const error = await setAppointmentStatus(cancelTarget.id, 'cancelled')

    if (error) {
      setFeedback({ tone: 'error', message: error })
      return
    }

    setFeedback({
      tone: 'success',
      message: `${cancelTarget.id} was cancelled. The patient record stays in My Appointments.`,
    })
    setCancelTarget(null)
  }

  async function handleRestore(appointment: Appointment) {
    const error = await setAppointmentStatus(appointment.id, 'booked')
    setFeedback(
      error
        ? { tone: 'error', message: error }
        : { tone: 'success', message: `${appointment.id} was restored to booked.` },
    )
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin · Appointments"
        title="Appointment management"
        description="Review demo bookings created through the patient flow. No new appointment records are generated here."
      />

      {feedback ? (
        <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} className="mb-4" />
      ) : null}

      <div className="mb-4 grid grid-cols-3 gap-2">
        {(['upcoming', 'completed', 'cancelled'] as AppointmentStatus[]).map((status) => (
          <div key={status} className="rounded-2xl border border-brand-line bg-white px-3 py-3">
            <p className="text-[11px] font-semibold text-brand-navy-soft uppercase">
              {appointmentStatusLabels[status]}
            </p>
            <p className="mt-1 text-xl font-bold text-brand-navy">{statusCounts[status]}</p>
          </div>
        ))}
      </div>

      <Card className="bg-white">
        <SearchBar
          value={search}
          onChange={setSearch}
          label="Search appointments"
          placeholder="Search by ID, patient, doctor, or hospital"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {(['all', 'upcoming', 'completed', 'cancelled'] as AppointmentStatusFilter[]).map((option) => (
            <FilterChip
              key={option}
              active={statusFilter === option}
              onClick={() => setStatusFilter(option)}
            >
              {option === 'all' ? 'All statuses' : appointmentStatusLabels[option]}
            </FilterChip>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['all', 'in-person', 'online'] as ConsultationFilter[]).map((option) => (
            <FilterChip
              key={option}
              active={consultationFilter === option}
              onClick={() => setConsultationFilter(option)}
            >
              {option === 'all' ? 'All modes' : option === 'online' ? 'Online demo' : 'In-person'}
            </FilterChip>
          ))}
        </div>
      </Card>

      <p className="mt-4 text-xs text-brand-navy-soft">
        Showing <span className="font-semibold text-brand-navy">{filtered.length}</span> of{' '}
        {appointments.length} demo appointment records.
      </p>

      {filtered.length === 0 ? (
        <Card className="mt-3 bg-white">
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CalendarDays className="size-7 text-brand-navy-soft/50" aria-hidden="true" />
            <p className="text-sm font-semibold text-brand-navy">No appointments match</p>
            <p className="max-w-xs text-xs text-brand-navy-soft">
              {appointments.length === 0
                ? 'Book a demo appointment from the patient flow to see it appear here.'
                : 'Try a different search term or status filter.'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-3 hidden overflow-hidden rounded-2xl border border-brand-line bg-white lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-surface text-[11px] font-semibold tracking-[0.1em] text-brand-navy-soft uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">Appointment</th>
                  <th scope="col" className="px-4 py-3">Patient</th>
                  <th scope="col" className="px-4 py-3">Doctor & hospital</th>
                  <th scope="col" className="px-4 py-3">Date & mode</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {filtered.map((appointment) => {
                  const status = getAppointmentDisplayStatus(appointment)
                  return (
                    <tr key={appointment.id}>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-semibold text-brand-navy">{appointment.id}</p>
                        <p className="text-[11px] text-brand-navy-soft">
                          Booked {formatRelativeTimestamp(appointment.createdAt)}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-brand-navy">
                        {appointment.patientName}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-brand-navy">{appointment.doctorName}</p>
                        <p className="text-[11px] text-brand-navy-soft">{appointment.hospitalName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-brand-navy">
                          {formatLongDate(appointment.date)}
                        </p>
                        <p className="text-[11px] capitalize text-brand-navy-soft">
                          {formatTimeSlot(appointment.time)} · {appointment.consultationType}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailId(appointment.id)}
                            className={adminSecondaryButtonClass}
                          >
                            Details
                          </button>
                          {status === 'cancelled' ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(appointment)}
                              className="rounded-lg border border-brand-line px-2.5 py-1.5 text-[11px] font-semibold text-brand-navy-soft transition-colors hover:border-brand-teal/40 hover:text-brand-teal-dark"
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCancelTarget(appointment)}
                              className="rounded-lg border border-brand-line px-2.5 py-1.5 text-[11px] font-semibold text-brand-navy-soft transition-colors hover:border-brand-critical/30 hover:text-brand-critical"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <ul className="mt-3 space-y-3 lg:hidden">
            {filtered.map((appointment) => {
              const status = getAppointmentDisplayStatus(appointment)
              return (
                <li key={appointment.id}>
                  <Card className="bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-brand-navy">{appointment.id}</p>
                        <p className="mt-1 text-sm font-semibold text-brand-navy">
                          {appointment.patientName}
                        </p>
                        <p className="text-xs text-brand-navy-soft">
                          {appointment.doctorName} · {appointment.hospitalName}
                        </p>
                      </div>
                      <StatusPill status={status} />
                    </div>
                    <p className="mt-2 text-xs text-brand-navy-soft">
                      {formatLongDate(appointment.date)} · {formatTimeSlot(appointment.time)}
                    </p>
                    <p className="mt-1 text-[11px] capitalize text-brand-navy-soft">
                      {appointment.consultationType} · {formatDemoFee(appointment.fee)}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDetailId(appointment.id)}
                        className={`${adminSecondaryButtonClass} flex-1`}
                      >
                        Details
                      </button>
                      {status === 'cancelled' ? (
                        <button
                          type="button"
                          onClick={() => handleRestore(appointment)}
                          className={`${adminSecondaryButtonClass} flex-1`}
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setCancelTarget(appointment)}
                          className={`${adminSecondaryButtonClass} flex-1 text-brand-critical hover:border-brand-critical/30 hover:text-brand-critical`}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </Card>
                </li>
              )
            })}
          </ul>
        </>
      )}

      {detailAppointment ? (
        <BottomSheet
          title="Appointment details"
          description="Simulated record created by the patient booking flow."
          onClose={() => setDetailId(null)}
        >
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="font-mono text-xs font-semibold text-brand-navy">{detailAppointment.id}</p>
            <StatusPill status={getAppointmentDisplayStatus(detailAppointment)} />
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3 border-b border-brand-line pb-2">
              <dt className="text-xs text-brand-navy-soft">Patient</dt>
              <dd className="text-right text-xs font-semibold text-brand-navy">
                {detailAppointment.patientName}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-brand-line pb-2">
              <dt className="text-xs text-brand-navy-soft">Doctor</dt>
              <dd className="text-right text-xs font-semibold text-brand-navy">
                {detailAppointment.doctorName}
                <span className="block font-normal text-brand-navy-soft">{detailAppointment.specialty}</span>
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-brand-line pb-2">
              <dt className="text-xs text-brand-navy-soft">Hospital</dt>
              <dd className="text-right text-xs font-semibold text-brand-navy">
                {detailAppointment.hospitalName}
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-brand-line pb-2">
              <dt className="text-xs text-brand-navy-soft">Date & time</dt>
              <dd className="text-right text-xs font-semibold text-brand-navy">
                {formatLongDate(detailAppointment.date)}
                <span className="block font-normal text-brand-navy-soft">
                  {formatTimeSlot(detailAppointment.time)}
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-brand-line pb-2">
              <dt className="text-xs text-brand-navy-soft">Consultation</dt>
              <dd className="text-right text-xs font-semibold text-brand-navy capitalize">
                {detailAppointment.consultationType} · {formatDemoFee(detailAppointment.fee)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-xs text-brand-navy-soft">Created</dt>
              <dd className="text-right text-xs text-brand-navy-soft">
                {formatRelativeTimestamp(detailAppointment.createdAt)}
              </dd>
            </div>
          </dl>
          <Badge tone="neutral" className="mt-4">
            Completed status is derived automatically from the demo date and time.
          </Badge>
          <div className="mt-4 flex flex-col-reverse gap-2 border-t border-brand-line pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setDetailId(null)} className={adminSecondaryButtonClass}>
              Close
            </button>
            {getAppointmentDisplayStatus(detailAppointment) === 'cancelled' ? (
              <button
                type="button"
                onClick={() => {
                  handleRestore(detailAppointment)
                  setDetailId(null)
                }}
                className={adminPrimaryButtonClass}
              >
                Restore appointment
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCancelTarget(detailAppointment)
                  setDetailId(null)
                }}
                className={`${adminSecondaryButtonClass} text-brand-critical hover:border-brand-critical/30 hover:text-brand-critical`}
              >
                Cancel appointment
              </button>
            )}
          </div>
        </BottomSheet>
      ) : null}

      {cancelTarget ? (
        <ConfirmDialog
          title={`Cancel ${cancelTarget.id}?`}
          description={
            <>
              The demo slot for {cancelTarget.patientName} with {cancelTarget.doctorName} will be
              cancelled. The record remains in the patient and admin lists and can be restored.
            </>
          }
          confirmLabel="Cancel appointment"
          cancelLabel="Keep appointment"
          tone="danger"
          onConfirm={handleCancel}
          onClose={() => setCancelTarget(null)}
        />
      ) : null}
    </div>
  )
}
