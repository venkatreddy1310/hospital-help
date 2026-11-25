import { Pencil, Plus, Stethoscope, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { DoctorFormSheet } from '../../components/admin/DoctorFormSheet'
import { FeedbackBanner, type AdminFeedbackState } from '../../components/admin/FeedbackBanner'
import {
  adminDangerIconButtonClass,
  adminIconButtonClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from '../../components/admin/fieldStyles'
import { PageHeader } from '../../components/common/PageHeader'
import { Card } from '../../components/ui/Card'
import { FilterChip } from '../../components/ui/FilterChip'
import { SearchBar } from '../../components/ui/SearchBar'
import { DoctorAvatar } from '../../components/specialists/DoctorAvatar'
import { useDemoCatalog } from '../../context/catalogStore'
import type { DoctorInput } from '../../context/catalogStore'
import type { Specialist } from '../../types/domain'
import { formatTimeSlot } from '../../utils/dateTime'

type StatusFilter = 'all' | 'active' | 'inactive'

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? 'inline-flex rounded-full bg-brand-teal-soft px-2 py-0.5 text-[11px] font-semibold text-brand-teal-dark'
          : 'inline-flex rounded-full bg-brand-surface px-2 py-0.5 text-[11px] font-semibold text-brand-navy-soft'
      }
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export function AdminDoctorsPage() {
  const {
    hospitals,
    specialists,
    addSpecialist,
    updateSpecialist,
    setSpecialistActive,
    removeSpecialist,
  } = useDemoCatalog()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [hospitalFilter, setHospitalFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [formTarget, setFormTarget] = useState<'new' | string | null>(
    searchParams.get('new') === '1' ? 'new' : null,
  )
  const [removeTarget, setRemoveTarget] = useState<Specialist | null>(null)
  const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null)

  const hospitalName = (id: string) => hospitals.find((hospital) => hospital.id === id)?.name ?? 'Removed hospital'

  const query = search.trim().toLowerCase()
  const filteredDoctors = specialists.filter((doctor) => {
    if (statusFilter === 'active' && !doctor.active) return false
    if (statusFilter === 'inactive' && doctor.active) return false
    if (hospitalFilter !== 'all' && !doctor.hospitalIds.includes(hospitalFilter)) return false
    if (!query) return true
    const haystack = [
      doctor.name,
      doctor.specialty,
      doctor.area,
      doctor.hospital,
      ...doctor.hospitalIds.map(hospitalName),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(query)
  })

  const editingDoctor =
    formTarget && formTarget !== 'new'
      ? specialists.find((doctor) => doctor.id === formTarget) ?? null
      : null

  function openNew() {
    if (hospitals.length === 0) {
      setFeedback({
        tone: 'error',
        message: 'Add at least one simulated hospital before creating a doctor profile.',
      })
      return
    }
    setFormTarget('new')
    setFeedback(null)
  }

  function closeForm() {
    setFormTarget(null)
    if (searchParams.has('new')) {
      const next = new URLSearchParams(searchParams)
      next.delete('new')
      setSearchParams(next, { replace: true })
    }
  }

  function handleSave(input: DoctorInput) {
    if (formTarget === 'new') {
      addSpecialist(input)
      setFeedback({
        tone: 'success',
        message: `${input.name} was added${input.active ? '' : ' as an inactive profile'}.`,
      })
    } else if (formTarget) {
      updateSpecialist(formTarget, input)
      setFeedback({ tone: 'success', message: `${input.name} was updated.` })
    }
    setFormTarget(null)
  }

  function handleToggleStatus(doctor: Specialist) {
    if (!doctor.active && doctor.hospitalIds.length === 0) {
      setFeedback({
        tone: 'error',
        message: 'Associate this doctor with a hospital before activating the profile.',
      })
      return
    }
    setSpecialistActive(doctor.id, !doctor.active)
    setFeedback({
      tone: 'success',
      message: `${doctor.name} was ${doctor.active ? 'removed from' : 'listed in'} the patient directory.`,
    })
  }

  function handleRemove() {
    if (!removeTarget) return
    removeSpecialist(removeTarget.id)
    setFeedback({ tone: 'success', message: `${removeTarget.name} was removed from the demo catalog.` })
    setRemoveTarget(null)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin · Doctors"
        title="Doctor management"
        description="Maintain the fictional consultant profiles used by the specialist directory and booking flow."
        actions={
          <button type="button" onClick={openNew} className={adminPrimaryButtonClass}>
            <Plus className="size-4" aria-hidden="true" />
            Add doctor
          </button>
        }
      />

      {feedback ? (
        <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} className="mb-4" />
      ) : null}

      <Card className="bg-white">
        <SearchBar
          value={search}
          onChange={setSearch}
          label="Search doctors"
          placeholder="Search by name, specialty, or hospital"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
            All statuses
          </FilterChip>
          <FilterChip active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>
            Active
          </FilterChip>
          <FilterChip active={statusFilter === 'inactive'} onClick={() => setStatusFilter('inactive')}>
            Inactive
          </FilterChip>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={hospitalFilter === 'all'} onClick={() => setHospitalFilter('all')}>
            All hospitals
          </FilterChip>
          {hospitals.map((hospital) => (
            <FilterChip
              key={hospital.id}
              active={hospitalFilter === hospital.id}
              onClick={() => setHospitalFilter(hospital.id)}
            >
              {hospital.shortName}
            </FilterChip>
          ))}
        </div>
      </Card>

      <p className="mt-4 text-xs text-brand-navy-soft">
        Showing <span className="font-semibold text-brand-navy">{filteredDoctors.length}</span> of{' '}
        {specialists.length} fictional doctor profiles.
      </p>

      {filteredDoctors.length === 0 ? (
        <Card className="mt-3 bg-white">
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Stethoscope className="size-7 text-brand-navy-soft/50" aria-hidden="true" />
            <p className="text-sm font-semibold text-brand-navy">No doctors match those filters</p>
            <p className="max-w-xs text-xs text-brand-navy-soft">
              Adjust the search or filters, or add a new fictional profile.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-3 hidden overflow-hidden rounded-2xl border border-brand-line bg-white lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-surface text-[11px] font-semibold tracking-[0.1em] text-brand-navy-soft uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">Doctor</th>
                  <th scope="col" className="px-4 py-3">Hospital</th>
                  <th scope="col" className="px-4 py-3">Fee & modes</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <DoctorAvatar name={doctor.name} specialty={doctor.specialty} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-brand-navy">{doctor.name}</p>
                          <p className="text-xs text-brand-navy-soft">
                            {doctor.specialty} · {doctor.experienceYears} yrs
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium text-brand-navy">{doctor.hospital || 'Unlinked'}</p>
                      <p className="text-[11px] text-brand-navy-soft">
                        {doctor.hospitalIds.length} site{doctor.hospitalIds.length === 1 ? '' : 's'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-brand-navy">₹{doctor.consultationFee}</p>
                      <p className="text-[11px] capitalize text-brand-navy-soft">
                        {doctor.consultationTypes.join(' · ') || 'No modes'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={doctor.active} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(doctor)}
                          className="rounded-lg border border-brand-line px-2.5 py-1.5 text-[11px] font-semibold text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
                        >
                          {doctor.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormTarget(doctor.id)}
                          className={adminIconButtonClass}
                          aria-label={`Edit ${doctor.name}`}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(doctor)}
                          className={adminDangerIconButtonClass}
                          aria-label={`Remove ${doctor.name}`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="mt-3 space-y-3 lg:hidden">
            {filteredDoctors.map((doctor) => (
              <li key={doctor.id}>
                <Card className="bg-white">
                  <div className="flex items-start gap-3">
                    <DoctorAvatar name={doctor.name} specialty={doctor.specialty} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-brand-navy">{doctor.name}</h3>
                          <p className="text-xs text-brand-navy-soft">
                            {doctor.specialty} · {doctor.experienceYears} yrs
                          </p>
                        </div>
                        <StatusBadge active={doctor.active} />
                      </div>
                      <p className="mt-2 text-xs text-brand-navy-soft">
                        {doctor.hospital || 'No hospital linked'}
                      </p>
                      <p className="mt-1 text-xs text-brand-navy-soft">
                        ₹{doctor.consultationFee} ·{' '}
                        {doctor.consultationTypes.join(' · ') || 'No consultation modes'}
                      </p>
                      {doctor.nextAvailable ? (
                        <p className="mt-1 text-[11px] text-brand-navy-soft">
                          Next demo slot: {formatTimeSlot(doctor.nextAvailable)}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(doctor)}
                          className={`${adminSecondaryButtonClass} flex-1`}
                        >
                          {doctor.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormTarget(doctor.id)}
                          className={`${adminSecondaryButtonClass} flex-1`}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(doctor)}
                          className={`${adminSecondaryButtonClass} flex-1 text-brand-critical hover:border-brand-critical/30 hover:text-brand-critical`}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      {formTarget ? (
        <DoctorFormSheet
          key={formTarget}
          doctor={editingDoctor ?? undefined}
          hospitals={hospitals}
          onSave={handleSave}
          onClose={closeForm}
        />
      ) : null}

      {removeTarget ? (
        <ConfirmDialog
          title={`Remove ${removeTarget.name}?`}
          description={
            <>
              This fictional profile is deleted from the demo catalog. Existing demo appointments
              remain in My Appointments, but the profile can no longer be booked.
            </>
          }
          confirmLabel="Remove doctor"
          tone="danger"
          onConfirm={handleRemove}
          onClose={() => setRemoveTarget(null)}
        />
      ) : null}
    </div>
  )
}
