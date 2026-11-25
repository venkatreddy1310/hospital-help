import { Building2, Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog } from '../../components/admin/ConfirmDialog'
import { FeedbackBanner, type AdminFeedbackState } from '../../components/admin/FeedbackBanner'
import { HospitalFormSheet } from '../../components/admin/HospitalFormSheet'
import {
  adminDangerIconButtonClass,
  adminIconButtonClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from '../../components/admin/fieldStyles'
import { PageHeader } from '../../components/common/PageHeader'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Card } from '../../components/ui/Card'
import { FilterChip } from '../../components/ui/FilterChip'
import { SearchBar } from '../../components/ui/SearchBar'
import { useDemoCatalog } from '../../context/catalogStore'
import type { AvailabilityStatus, Hospital, HospitalType } from '../../types/domain'
import { availabilityMeta, availabilityToneClasses } from '../../utils/availability'
import { availabilityStatuses } from '../../utils/adminCatalog'
import { facilityMeta } from '../../utils/facilities'

type TypeFilter = 'all' | HospitalType
type AvailabilityFilter = 'all' | AvailabilityStatus

function StatusPill({ status }: { status: AvailabilityStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${availabilityToneClasses[status]}`}
    >
      {availabilityMeta[status].shortLabel}
    </span>
  )
}

export function AdminHospitalsPage() {
  const { hospitals, addHospital, updateHospital, removeHospital } = useDemoCatalog()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all')
  const [formTarget, setFormTarget] = useState<'new' | string | null>(
    searchParams.get('new') === '1' ? 'new' : null,
  )
  const [detailId, setDetailId] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Hospital | null>(null)
  const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null)

  const query = search.trim().toLowerCase()
  const filteredHospitals = hospitals.filter((hospital) => {
    if (typeFilter !== 'all' && hospital.type !== typeFilter) return false
    if (availabilityFilter !== 'all' && hospital.availability !== availabilityFilter) return false
    if (!query) return true
    return [hospital.name, hospital.area, hospital.shortName, ...hospital.specialties]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const detailHospital = detailId ? hospitals.find((hospital) => hospital.id === detailId) ?? null : null
  const editingHospital =
    formTarget && formTarget !== 'new'
      ? hospitals.find((hospital) => hospital.id === formTarget) ?? null
      : null

  function openNew() {
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

  function handleSave(input: Parameters<typeof addHospital>[0]) {
    if (formTarget === 'new') {
      const id = addHospital(input)
      setFeedback({ tone: 'success', message: `${input.name} was added to the demo directory.` })
      setFormTarget(null)
      setDetailId(id)
    } else if (formTarget) {
      updateHospital(formTarget, input)
      setFeedback({ tone: 'success', message: `${input.name} was updated.` })
      setFormTarget(null)
    }
  }

  function handleRemove() {
    if (!removeTarget) return
    removeHospital(removeTarget.id)
    setFeedback({
      tone: 'success',
      message: `${removeTarget.name} was removed. Linked demo doctors are now hidden from the directory.`,
    })
    if (detailId === removeTarget.id) setDetailId(null)
    setRemoveTarget(null)
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin · Hospitals"
        title="Hospital management"
        description="Search, edit, and maintain the simulated hospitals shown across MediPulse."
        actions={
          <button type="button" onClick={openNew} className={adminPrimaryButtonClass}>
            <Plus className="size-4" aria-hidden="true" />
            Add hospital
          </button>
        }
      />

      {feedback ? (
        <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} className="mb-4" />
      ) : null}

      <Card className="bg-white">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            label="Search hospitals"
            placeholder="Name, area, or specialty"
            className="lg:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            {(['all', 'Private', 'Government'] as TypeFilter[]).map((option) => (
              <FilterChip
                key={option}
                active={typeFilter === option}
                onClick={() => setTypeFilter(option)}
              >
                {option === 'all' ? 'All types' : option}
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={availabilityFilter === 'all'} onClick={() => setAvailabilityFilter('all')}>
            Any availability
          </FilterChip>
          {availabilityStatuses.map((status) => (
            <FilterChip
              key={status}
              active={availabilityFilter === status}
              onClick={() => setAvailabilityFilter(status)}
            >
              {availabilityMeta[status].label}
            </FilterChip>
          ))}
        </div>
      </Card>

      <p className="mt-4 text-xs text-brand-navy-soft">
        Showing <span className="font-semibold text-brand-navy">{filteredHospitals.length}</span> of{' '}
        {hospitals.length} simulated hospitals.
      </p>

      {filteredHospitals.length === 0 ? (
        <Card className="mt-3 bg-white">
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Building2 className="size-7 text-brand-navy-soft/50" aria-hidden="true" />
            <p className="text-sm font-semibold text-brand-navy">No hospitals match those filters</p>
            <p className="max-w-xs text-xs text-brand-navy-soft">
              Try a different search term, or add a simulated hospital to the demo directory.
            </p>
            <button type="button" onClick={openNew} className={`${adminSecondaryButtonClass} mt-2`}>
              Add hospital
            </button>
          </div>
        </Card>
      ) : (
        <>
          <div className="mt-3 hidden overflow-hidden rounded-2xl border border-brand-line bg-white lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-surface text-[11px] font-semibold tracking-[0.1em] text-brand-navy-soft uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3">Hospital</th>
                  <th scope="col" className="px-4 py-3">Beds</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Emergency</th>
                  <th scope="col" className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-line">
                {filteredHospitals.map((hospital) => (
                  <tr key={hospital.id} className="align-middle">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-navy">{hospital.name}</p>
                      <p className="text-xs text-brand-navy-soft">
                        {hospital.area} · {hospital.type}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-brand-navy">
                        {hospital.availableBeds}
                        <span className="text-xs font-normal text-brand-navy-soft">
                          {' '}of {hospital.totalBeds} free
                        </span>
                      </p>
                      <p className="text-xs text-brand-navy-soft">{hospital.specialties.length} specialties</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={hospital.availability} />
                    </td>
                    <td className="px-4 py-3 text-xs text-brand-navy-soft">
                      {hospital.emergency ? '24/7 dept.' : 'No emergency dept.'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailId(hospital.id)}
                          className={adminIconButtonClass}
                          aria-label={`View ${hospital.name}`}
                        >
                          <Eye className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormTarget(hospital.id)}
                          className={adminIconButtonClass}
                          aria-label={`Edit ${hospital.name}`}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(hospital)}
                          className={adminDangerIconButtonClass}
                          aria-label={`Remove ${hospital.name}`}
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
            {filteredHospitals.map((hospital) => (
              <li key={hospital.id}>
                <Card className="bg-white">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-brand-navy">{hospital.name}</h3>
                      <p className="text-xs text-brand-navy-soft">
                        {hospital.area} · {hospital.type}
                      </p>
                    </div>
                    <StatusPill status={hospital.availability} />
                  </div>
                  <p className="mt-2 text-xs text-brand-navy-soft">
                    <span className="font-semibold text-brand-navy">{hospital.availableBeds}</span> of{' '}
                    {hospital.totalBeds} beds free · {hospital.emergency ? '24/7 emergency' : 'No emergency dept.'}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailId(hospital.id)}
                      className={`${adminSecondaryButtonClass} flex-1`}
                    >
                      <Eye className="size-4" aria-hidden="true" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTarget(hospital.id)}
                      className={`${adminSecondaryButtonClass} flex-1`}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemoveTarget(hospital)}
                      className={`${adminSecondaryButtonClass} flex-1 text-brand-critical hover:border-brand-critical/30 hover:text-brand-critical`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remove
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}

      {detailHospital ? (
        <BottomSheet
          title={detailHospital.name}
          description={`${detailHospital.area} · ${detailHospital.type} hospital`}
          onClose={() => setDetailId(null)}
        >
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-brand-surface p-3">
                <p className="text-[11px] font-semibold text-brand-navy-soft uppercase">Available beds</p>
                <p className="mt-1 text-lg font-bold text-brand-navy">
                  {detailHospital.availableBeds}
                  <span className="text-xs font-medium text-brand-navy-soft"> / {detailHospital.totalBeds}</span>
                </p>
              </div>
              <div className="rounded-xl bg-brand-surface p-3">
                <p className="text-[11px] font-semibold text-brand-navy-soft uppercase">Distance</p>
                <p className="mt-1 text-lg font-bold text-brand-navy">
                  {detailHospital.distanceKm.toFixed(1)} km
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-brand-navy-soft">{detailHospital.address}</p>
            <div>
              <h3 className="text-xs font-semibold text-brand-navy">Emergency & facilities</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {detailHospital.emergency ? (
                  <span className="rounded-full bg-brand-critical-soft px-2.5 py-1 text-[11px] font-semibold text-brand-critical">
                    24/7 emergency dept.
                  </span>
                ) : null}
                {detailHospital.facilities.map((facility) => (
                  <span
                    key={facility}
                    className="rounded-full bg-brand-blue-soft px-2.5 py-1 text-[11px] font-semibold text-brand-blue"
                  >
                    {facilityMeta[facility].label}
                  </span>
                ))}
                {!detailHospital.emergency && detailHospital.facilities.length === 0 ? (
                  <span className="text-xs text-brand-navy-soft">No facilities listed.</span>
                ) : null}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-brand-navy">Services & specialties</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {detailHospital.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full bg-brand-surface px-2.5 py-1 text-[11px] font-semibold text-brand-navy-soft"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            <p className="rounded-xl bg-brand-surface px-3 py-2 text-[11px] leading-relaxed text-brand-navy-soft">
              Bed counts and facilities are simulated demo values and do not describe a real facility.
            </p>
            <div className="flex flex-col gap-2 border-t border-brand-line pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setFormTarget(detailHospital.id)
                  setDetailId(null)
                }}
                className={adminSecondaryButtonClass}
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit hospital
              </button>
              <button
                type="button"
                onClick={() => {
                  setRemoveTarget(detailHospital)
                  setDetailId(null)
                }}
                className={`${adminSecondaryButtonClass} text-brand-critical hover:border-brand-critical/30 hover:text-brand-critical`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remove
              </button>
            </div>
          </div>
        </BottomSheet>
      ) : null}

      {formTarget ? (
        <HospitalFormSheet
          key={formTarget}
          hospital={editingHospital ?? undefined}
          onSave={handleSave}
          onClose={closeForm}
        />
      ) : null}

      {removeTarget ? (
        <ConfirmDialog
          title={`Remove ${removeTarget.name}?`}
          description={
            <>
              This removes the simulated hospital from the patient directory and dashboard.
              Appointments already booked with it stay in My Appointments, and linked demo
              doctors are hidden if they have no other hospital.
            </>
          }
          confirmLabel="Remove hospital"
          tone="danger"
          onConfirm={handleRemove}
          onClose={() => setRemoveTarget(null)}
        />
      ) : null}
    </div>
  )
}
