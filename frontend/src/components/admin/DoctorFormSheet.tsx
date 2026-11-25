import { useState, type FormEvent } from 'react'
import type { DoctorInput } from '../../context/catalogStore'
import type {
  ConsultationType,
  Hospital,
  Specialty,
  Specialist,
  SpecialistAvailabilityDay,
} from '../../types/domain'
import { AVAILABILITY_SLOT_OPTIONS, createDefaultAvailability } from '../../utils/adminCatalog'
import { formatShortDate, formatTimeSlot, getCalendarParts } from '../../utils/dateTime'
import { specialtyOptions } from '../../utils/specialists'
import { BottomSheet } from '../ui/BottomSheet'
import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextareaClass,
} from './fieldStyles'

const consultationModeOptions: Array<{ value: ConsultationType; label: string }> = [
  { value: 'in-person', label: 'In-person consultation' },
  { value: 'online', label: 'Online demo consultation' },
]

function cloneAvailability(days: SpecialistAvailabilityDay[]): SpecialistAvailabilityDay[] {
  return days.map((day) => ({ date: day.date, slots: [...day.slots] }))
}

interface DoctorFormSheetProps {
  doctor?: Specialist
  hospitals: Hospital[]
  onSave: (input: DoctorInput) => void
  onClose: () => void
}

export function DoctorFormSheet({ doctor, hospitals, onSave, onClose }: DoctorFormSheetProps) {
  const [name, setName] = useState(doctor?.name ?? '')
  const [specialty, setSpecialty] = useState<Specialty>(doctor?.specialty ?? 'General Medicine')
  const [experienceYears, setExperienceYears] = useState(String(doctor?.experienceYears ?? 8))
  const [qualifications, setQualifications] = useState(doctor?.qualifications.join(', ') ?? 'MBBS, MD')
  const [languages, setLanguages] = useState(doctor?.languages.join(', ') ?? 'English, Telugu, Hindi')
  const [bio, setBio] = useState(
    doctor?.bio ??
      'Fictional demo consultant profile. This description is simulated for the MediPulse preview.',
  )
  const [consultationFee, setConsultationFee] = useState(String(doctor?.consultationFee ?? 700))
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>(
    doctor?.consultationTypes ?? ['in-person'],
  )
  const [hospitalIds, setHospitalIds] = useState<string[]>(
    doctor?.hospitalIds.filter((id) => hospitals.some((hospital) => hospital.id === id)) ?? [],
  )
  const [availability, setAvailability] = useState<SpecialistAvailabilityDay[]>(
    doctor ? cloneAvailability(doctor.availability) : createDefaultAvailability(),
  )
  const [active, setActive] = useState(doctor?.active ?? true)
  const [error, setError] = useState<string | null>(null)

  function toggleSlot(date: string, slot: string) {
    setAvailability((current) =>
      current.map((day) =>
        day.date === date
          ? {
              date,
              slots: day.slots.includes(slot)
                ? day.slots.filter((item) => item !== slot)
                : [...day.slots, slot].sort(),
            }
          : day,
      ),
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Doctor name is required.')
      return
    }
    if (hospitalIds.length === 0) {
      setError('Associate the doctor with at least one demo hospital.')
      return
    }
    const experience = Number(experienceYears)
    if (!Number.isInteger(experience) || experience < 0 || experience > 60) {
      setError('Experience must be a whole number between 0 and 60 years.')
      return
    }
    const fee = Number(consultationFee)
    if (!Number.isFinite(fee) || fee < 0) {
      setError('Consultation fee must be zero or a positive amount.')
      return
    }
    if (consultationTypes.length === 0) {
      setError('Select at least one consultation mode.')
      return
    }
    if (!availability.some((day) => day.slots.length > 0)) {
      setError('Add at least one simulated availability slot so patients can book a demo visit.')
      return
    }

    onSave({
      name: name.trim(),
      specialty,
      experienceYears: experience,
      qualifications: qualifications.split(',').map((item) => item.trim()).filter(Boolean),
      bio: bio.trim(),
      languages: languages.split(',').map((item) => item.trim()).filter(Boolean),
      consultationFee: fee,
      consultationTypes,
      hospitalIds,
      availability: availability.map((day) => ({ date: day.date, slots: [...day.slots] })),
      active: active && hospitalIds.length > 0,
    })
  }

  return (
    <BottomSheet
      title={doctor ? 'Edit doctor' : 'Add doctor'}
      description="Fictional demo consultant records only. Nothing is verified with a real clinician."
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
            <span className={adminLabelClass}>Full name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={adminInputClass}
              placeholder="e.g. Dr. Meera Iyer"
              maxLength={70}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Specialty</span>
            <select
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value as Specialty)}
              className={adminInputClass}
            >
              {specialtyOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={adminLabelClass}>Experience (years)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              step={1}
              value={experienceYears}
              onChange={(event) => setExperienceYears(event.target.value)}
              className={adminInputClass}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Consultation fee (₹ demo)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={50}
              value={consultationFee}
              onChange={(event) => setConsultationFee(event.target.value)}
              className={adminInputClass}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Qualifications (comma separated)</span>
            <input
              value={qualifications}
              onChange={(event) => setQualifications(event.target.value)}
              className={adminInputClass}
              placeholder="MBBS, MD"
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Languages (comma separated)</span>
            <input
              value={languages}
              onChange={(event) => setLanguages(event.target.value)}
              className={adminInputClass}
              placeholder="English, Telugu"
            />
          </label>
        </div>

        <label className="block">
          <span className={adminLabelClass}>Short profile</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            maxLength={320}
            className={adminTextareaClass}
          />
        </label>

        <fieldset>
          <legend className={adminLabelClass}>Hospital associations</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {hospitals.map((hospital) => (
              <label
                key={hospital.id}
                className="flex items-center gap-2.5 rounded-xl border border-brand-line px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={hospitalIds.includes(hospital.id)}
                  onChange={() =>
                    setHospitalIds((current) =>
                      current.includes(hospital.id)
                        ? current.filter((id) => id !== hospital.id)
                        : [...current, hospital.id],
                    )
                  }
                  className="size-4 accent-brand-blue"
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-brand-navy">
                    {hospital.name}
                  </span>
                  <span className="block text-[11px] text-brand-navy-soft">{hospital.area}</span>
                </span>
              </label>
            ))}
          </div>
          {hospitals.length === 0 ? (
            <p className="mt-2 text-xs text-brand-warning">
              Add a hospital first so this fictional doctor can be associated with a site.
            </p>
          ) : null}
        </fieldset>

        <fieldset>
          <legend className={adminLabelClass}>Consultation modes</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {consultationModeOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2.5 rounded-xl border border-brand-line px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={consultationTypes.includes(option.value)}
                  onChange={() =>
                    setConsultationTypes((current) =>
                      current.includes(option.value)
                        ? current.filter((type) => type !== option.value)
                        : [...current, option.value],
                    )
                  }
                  className="size-4 accent-brand-blue"
                />
                <span className="text-xs font-medium text-brand-navy">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={adminLabelClass}>Simulated availability</legend>
          <p className="mt-1 text-[11px] text-brand-navy-soft">
            Pick the demo appointment slots shown to patients for the next five days.
          </p>
          <div className="mt-2 space-y-2">
            {availability.map((day) => {
              const parts = getCalendarParts(day.date)
              return (
                <div key={day.date} className="rounded-xl border border-brand-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-brand-navy">
                      {parts.weekday} · {formatShortDate(day.date)}
                    </p>
                    <span className="text-[11px] text-brand-navy-soft">
                      {day.slots.length} slot{day.slots.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {AVAILABILITY_SLOT_OPTIONS.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={day.slots.includes(slot)}
                        onClick={() => toggleSlot(day.date, slot)}
                        className={
                          day.slots.includes(slot)
                            ? 'rounded-md bg-brand-teal px-2 py-1 text-[11px] font-semibold text-white'
                            : 'rounded-md border border-brand-line bg-white px-2 py-1 text-[11px] font-medium text-brand-navy-soft hover:border-brand-teal/40'
                        }
                      >
                        {formatTimeSlot(slot)}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </fieldset>

        <label className="flex items-center gap-2.5 rounded-xl border border-brand-line px-3 py-2.5">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="size-4 accent-brand-blue"
          />
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-brand-navy">
              List in the patient directory
            </span>
            <span className="block text-[11px] text-brand-navy-soft">
              Inactive doctors stay in the admin console but cannot be booked.
            </span>
          </span>
        </label>

        <div className="flex flex-col-reverse gap-2 border-t border-brand-line pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={adminSecondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" className={adminPrimaryButtonClass}>
            {doctor ? 'Save changes' : 'Add doctor'}
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
