import { useState, type FormEvent } from 'react'
import type { HospitalInput } from '../../context/catalogStore'
import type { AvailabilityStatus, FacilityKey, Hospital, HospitalType } from '../../types/domain'
import { availabilityMeta } from '../../utils/availability'
import { availabilityStatuses, facilityOptions } from '../../utils/adminCatalog'
import { demoHospitals, demoLocations } from '../../utils/demoData'
import { facilityMeta } from '../../utils/facilities'
import { specialtyOptions } from '../../utils/specialists'
import { BedAvailabilityBar } from '../hospitals/BedAvailabilityBar'
import { BottomSheet } from '../ui/BottomSheet'
import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from './fieldStyles'

const areaSuggestions = [
  ...new Set([...demoHospitals.map((hospital) => hospital.area), ...demoLocations.map((location) => location.area)]),
]

function suggestStatus(availableBeds: number, totalBeds: number): AvailabilityStatus {
  if (availableBeds <= 0) return 'full'
  if (totalBeds > 0 && availableBeds / totalBeds < 0.15) return 'limited'
  return 'available'
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

interface HospitalFormSheetProps {
  hospital?: Hospital
  onSave: (input: HospitalInput) => void
  onClose: () => void
}

export function HospitalFormSheet({ hospital, onSave, onClose }: HospitalFormSheetProps) {
  const [name, setName] = useState(hospital?.name ?? '')
  const [shortName, setShortName] = useState(hospital?.shortName ?? '')
  const [type, setType] = useState<HospitalType>(hospital?.type ?? 'Private')
  const [area, setArea] = useState(hospital?.area ?? '')
  const [address, setAddress] = useState(hospital?.address ?? '')
  const [distanceKm, setDistanceKm] = useState(String(hospital?.distanceKm ?? 1.5))
  const [totalBeds, setTotalBeds] = useState(String(hospital?.totalBeds ?? 120))
  const [availableBeds, setAvailableBeds] = useState(String(hospital?.availableBeds ?? 24))
  const [availability, setAvailability] = useState<AvailabilityStatus>(
    hospital?.availability ?? 'available',
  )
  const [emergency, setEmergency] = useState(hospital?.emergency ?? true)
  const [facilities, setFacilities] = useState<FacilityKey[]>(hospital?.facilities ?? ['icu'])
  const [specialties, setSpecialties] = useState<string[]>(
    hospital?.specialties ?? ['General Medicine'],
  )
  const [error, setError] = useState<string | null>(null)

  const totalValue = Number(totalBeds)
  const availableValue = Number(availableBeds)
  const previewTotal = Number.isFinite(totalValue) ? Math.max(0, Math.trunc(totalValue)) : 0
  const previewAvailable = Number.isFinite(availableValue)
    ? Math.min(previewTotal, Math.max(0, Math.trunc(availableValue)))
    : 0

  function handleBedsChange(field: 'total' | 'available', raw: string) {
    const nextTotal = field === 'total' ? raw : totalBeds
    const nextAvailable = field === 'available' ? raw : availableBeds
    if (field === 'total') setTotalBeds(raw)
    else setAvailableBeds(raw)

    const totalNumber = Number(nextTotal)
    const availableNumber = Number(nextAvailable)
    if (Number.isFinite(totalNumber) && Number.isFinite(availableNumber)) {
      setAvailability(suggestStatus(availableNumber, totalNumber))
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim() || !shortName.trim()) {
      setError('Hospital name and short name are required.')
      return
    }
    if (!area.trim() || !address.trim()) {
      setError('Area and address are required for the hospital directory.')
      return
    }
    if (!Number.isInteger(totalValue) || totalValue < 0) {
      setError('Total beds must be a whole number of zero or more.')
      return
    }
    if (!Number.isInteger(availableValue) || availableValue < 0) {
      setError('Available beds must be a whole number of zero or more.')
      return
    }
    if (availableValue > totalValue) {
      setError('Available beds cannot exceed total beds.')
      return
    }
    const distance = Number(distanceKm)
    if (!Number.isFinite(distance) || distance < 0) {
      setError('Distance must be a positive number of kilometres.')
      return
    }
    if (specialties.length === 0) {
      setError('Select at least one service or specialty.')
      return
    }

    onSave({
      name: name.trim(),
      shortName: shortName.trim(),
      type,
      area: area.trim(),
      address: address.trim(),
      distanceKm: Math.round(distance * 10) / 10,
      totalBeds: totalValue,
      availableBeds: availableValue,
      availability,
      emergency,
      facilities,
      specialties,
    })
  }

  return (
    <BottomSheet
      title={hospital ? 'Edit hospital' : 'Add hospital'}
      description={
        hospital
          ? 'Changes update the patient directory and dashboard immediately.'
          : 'This creates a simulated hospital record for the demo only.'
      }
      onClose={onClose}
      panelClassName="sm:max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-brand-critical/20 bg-brand-critical-soft px-3 py-2 text-xs font-medium text-brand-critical"
          >
            {error}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={adminLabelClass}>Hospital name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={adminInputClass}
              placeholder="e.g. Apollo Hospitals"
              maxLength={80}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Short name</span>
            <input
              value={shortName}
              onChange={(event) => setShortName(event.target.value)}
              className={adminInputClass}
              placeholder="e.g. Apollo"
              maxLength={30}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Type</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as HospitalType)}
              className={adminInputClass}
            >
              <option value="Private">Private</option>
              <option value="Government">Government</option>
            </select>
          </label>
          <label className="block">
            <span className={adminLabelClass}>Area</span>
            <input
              value={area}
              onChange={(event) => setArea(event.target.value)}
              list="hospital-area-suggestions"
              className={adminInputClass}
              placeholder="e.g. Jubilee Hills"
              maxLength={60}
            />
            <datalist id="hospital-area-suggestions">
              {areaSuggestions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </label>
        </div>

        <label className="block">
          <span className={adminLabelClass}>Address</span>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className={adminInputClass}
            placeholder="Street, area, city"
            maxLength={140}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className={adminLabelClass}>Total beds</span>
            <input
              type="number"
              inputMode="numeric"
              value={totalBeds}
              onChange={(event) => handleBedsChange('total', event.target.value)}
              className={adminInputClass}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Available beds</span>
            <input
              type="number"
              inputMode="numeric"
              value={availableBeds}
              onChange={(event) => handleBedsChange('available', event.target.value)}
              className={adminInputClass}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Distance (km)</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.1}
              value={distanceKm}
              onChange={(event) => setDistanceKm(event.target.value)}
              className={adminInputClass}
            />
          </label>
        </div>

        <BedAvailabilityBar
          available={previewAvailable}
          total={previewTotal}
          status={availability}
        />

        <fieldset>
          <legend className={adminLabelClass}>Availability status</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {availabilityStatuses.map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={availability === status}
                onClick={() => setAvailability(status)}
                className={
                  availability === status
                    ? 'rounded-full border border-brand-blue bg-brand-blue-soft px-3 py-1.5 text-xs font-semibold text-brand-blue'
                    : 'rounded-full border border-brand-line bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy-soft hover:border-brand-blue/30'
                }
              >
                {availabilityMeta[status].label}
              </button>
            ))}
          </div>
          {availableValue === 0 && availability !== 'full' ? (
            <p className="mt-2 text-[11px] font-medium text-brand-warning">
              Zero available beds normally maps to the at-capacity status.
            </p>
          ) : null}
        </fieldset>

        <fieldset>
          <legend className={adminLabelClass}>Emergency services</legend>
          <label className="mt-2 flex items-center gap-2.5 rounded-xl border border-brand-line px-3 py-2.5">
            <input
              type="checkbox"
              checked={emergency}
              onChange={(event) => setEmergency(event.target.checked)}
              className="size-4 accent-brand-blue"
            />
            <span className="text-xs font-medium text-brand-navy">
              24/7 emergency department
            </span>
          </label>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {facilityOptions.map((facility) => (
              <label
                key={facility}
                className="flex items-center gap-2.5 rounded-xl border border-brand-line px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={facilities.includes(facility)}
                  onChange={() => setFacilities((current) => toggleValue(current, facility))}
                  className="size-4 accent-brand-blue"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-brand-navy">
                    {facilityMeta[facility].label}
                  </span>
                  <span className="block text-[11px] text-brand-navy-soft">
                    {facilityMeta[facility].description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={adminLabelClass}>Services & specialties</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {specialtyOptions.map((specialty) => (
              <button
                key={specialty}
                type="button"
                aria-pressed={specialties.includes(specialty)}
                onClick={() => setSpecialties((current) => toggleValue(current, specialty))}
                className={
                  specialties.includes(specialty)
                    ? 'rounded-full border border-brand-teal bg-brand-teal-soft px-3 py-1.5 text-xs font-semibold text-brand-teal-dark'
                    : 'rounded-full border border-brand-line bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy-soft hover:border-brand-teal/40'
                }
              >
                {specialty}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col-reverse gap-2 border-t border-brand-line pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={adminSecondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" className={adminPrimaryButtonClass}>
            {hospital ? 'Save changes' : 'Add hospital'}
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
