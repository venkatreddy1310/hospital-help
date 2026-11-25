import {
  Building2,
  CalendarDays,
  SearchX,
  Stethoscope,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DemoNotice } from '../components/common/DemoNotice'
import { PageHeader } from '../components/common/PageHeader'
import { SpecialistCard } from '../components/specialists/SpecialistCard'
import { Badge } from '../components/ui/Badge'
import { FilterChip } from '../components/ui/FilterChip'
import { SearchBar } from '../components/ui/SearchBar'
import { useAppointments } from '../context/appointmentStore'
import { useDemoCatalog } from '../context/catalogStore'
import { useServiceLocation } from '../context/locationStore'
import type { SpecialistFilters } from '../utils/specialistDirectory'
import { filterAndSortSpecialists } from '../utils/specialistDirectory'
import { getHospitalsForLocationFrom } from '../utils/demoData'
import {
  getSpecialtyLabel,
  isSpecialty,
  specialtyOptions,
} from '../utils/specialists'

type SpecialtyFilter = SpecialistFilters['specialty']
type ConsultationFilter = SpecialistFilters['consultationType']
type AvailabilityFilter = SpecialistFilters['availability']
type SortOption = SpecialistFilters['sort']

const consultationFilters: Array<{ value: ConsultationFilter; label: string }> = [
  { value: 'all', label: 'All modes' },
  { value: 'in-person', label: 'In-person' },
  { value: 'online', label: 'Online demo' },
]

const availabilityFilters: Array<{ value: AvailabilityFilter; label: string }> = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Available today' },
  { value: 'next-3-days', label: 'Next 3 days' },
]

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'distance', label: 'Nearest hospital' },
  { value: 'earliest', label: 'Earliest available slot' },
  { value: 'experience', label: 'Most experience' },
]

const selectClassName =
  'mt-1 h-11 w-full rounded-xl border border-brand-line bg-white px-3 text-sm text-brand-navy shadow-sm transition focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/15 focus:outline-none'

export function SpecialistsPage() {
  const { location } = useServiceLocation()
  const { hospitals: catalogHospitals, specialists } = useDemoCatalog()
  const { appointments } = useAppointments()
  const [searchParams, setSearchParams] = useSearchParams()

  const hospitals = useMemo(
    () => getHospitalsForLocationFrom(catalogHospitals, location.id),
    [catalogHospitals, location.id],
  )
  const activeSpecialists = useMemo(
    () => specialists.filter((specialist) => specialist.active),
    [specialists],
  )

  const [query, setQuery] = useState('')
  const [specialty, setSpecialty] = useState<SpecialtyFilter>(() => {
    const param = searchParams.get('specialty')
    return isSpecialty(param) ? param : 'all'
  })
  const [consultationType, setConsultationType] =
    useState<ConsultationFilter>('all')
  const [availability, setAvailability] = useState<AvailabilityFilter>('all')
  const [hospitalId, setHospitalId] = useState<string>(() => {
    const param = searchParams.get('hospital')
    return param && hospitals.some((hospital) => hospital.id === param)
      ? param
      : 'all'
  })
  const [sort, setSort] = useState<SortOption>('distance')

  const linkedSpecialtyParam = searchParams.get('specialty')
  const linkedSpecialty = isSpecialty(linkedSpecialtyParam)
    ? linkedSpecialtyParam
    : null
  const fromTriage = searchParams.get('from') === 'triage'
  const showTriageContext =
    fromTriage && linkedSpecialty !== null && specialty === linkedSpecialty

  const selectedHospital =
    hospitalId === 'all'
      ? null
      : (hospitals.find((hospital) => hospital.id === hospitalId) ?? null)

  const entries = useMemo(
    () =>
      filterAndSortSpecialists(activeSpecialists, hospitals, appointments, {
        query,
        specialty,
        consultationType,
        availability,
        hospitalId,
        sort,
      }),
    [
      activeSpecialists,
      appointments,
      availability,
      consultationType,
      hospitalId,
      hospitals,
      query,
      sort,
      specialty,
    ],
  )

  const hasActiveFilters =
    query.trim().length > 0 ||
    specialty !== 'all' ||
    consultationType !== 'all' ||
    availability !== 'all' ||
    hospitalId !== 'all' ||
    sort !== 'distance'

  const clearFilters = () => {
    setQuery('')
    setSpecialty('all')
    setConsultationType('all')
    setAvailability('all')
    setHospitalId('all')
    setSort('distance')
    setSearchParams({}, { replace: true })
  }

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Specialists"
        description="Search fictional consultants by specialty, hospital, location, mode, and simulated availability."
        actions={
          <>
            <Link
              to="/appointments"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand-line bg-white px-3 text-xs font-semibold text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
            >
              <CalendarDays className="size-3.5" aria-hidden="true" />
              My appointments
            </Link>
            <Badge tone="teal">Demo directory</Badge>
          </>
        }
      />

      <DemoNotice className="mb-4">
        Every doctor, qualification, fee, hospital association, and appointment slot is
        fictional simulation data. Booking creates a local demo record only; no real
        clinician or hospital is contacted.
      </DemoNotice>

      {showTriageContext || selectedHospital ? (
        <div className="mb-4 space-y-2">
          {showTriageContext ? (
            <p
              role="status"
              className="flex items-start gap-2 rounded-xl border border-brand-teal/20 bg-brand-teal-soft/70 px-3.5 py-3 text-xs leading-relaxed text-brand-navy-soft"
            >
              <Stethoscope
                className="mt-0.5 size-4 shrink-0 text-brand-teal-dark"
                aria-hidden="true"
              />
              Showing {getSpecialtyLabel(specialty)} demo profiles related to your triage
              recommendation. This is general guidance, not a diagnosis or referral.
            </p>
          ) : null}
          {selectedHospital ? (
            <p
              role="status"
              className="flex items-start gap-2 rounded-xl border border-brand-blue/10 bg-brand-blue-soft/70 px-3.5 py-3 text-xs leading-relaxed text-brand-navy-soft"
            >
              <Building2
                className="mt-0.5 size-4 shrink-0 text-brand-blue"
                aria-hidden="true"
              />
              Showing fictional doctors associated with {selectedHospital.name}. Hospital
              links use the existing simulated directory.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-brand-line bg-white p-4 shadow-sm">
        <SearchBar
          value={query}
          onChange={setQuery}
          label="Search specialists"
          placeholder="Search by doctor, specialty, hospital, or area"
        />

        <fieldset className="mt-4">
          <legend className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/70 uppercase">
            Specialty
          </legend>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={specialty === 'all'} onClick={() => setSpecialty('all')}>
              All
            </FilterChip>
            {specialtyOptions.map((option) => (
              <FilterChip
                key={option}
                active={specialty === option}
                onClick={() => setSpecialty(option)}
              >
                {getSpecialtyLabel(option)}
              </FilterChip>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/70 uppercase">
              Consultation type
            </legend>
            <div className="flex flex-wrap gap-2">
              {consultationFilters.map((filter) => (
                <FilterChip
                  key={filter.value}
                  active={consultationType === filter.value}
                  onClick={() => setConsultationType(filter.value)}
                >
                  {filter.label}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/70 uppercase">
              Availability
            </legend>
            <div className="flex flex-wrap gap-2">
              {availabilityFilters.map((filter) => (
                <FilterChip
                  key={filter.value}
                  active={availability === filter.value}
                  onClick={() => setAvailability(filter.value)}
                >
                  {filter.label}
                </FilterChip>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/70 uppercase">
              Hospital
            </span>
            <select
              value={hospitalId}
              onChange={(event) => setHospitalId(event.target.value)}
              className={selectClassName}
            >
              <option value="all">All demo hospitals</option>
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/70 uppercase">
              Sort by
            </span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className={selectClassName}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-xs font-medium text-brand-navy-soft">
          Showing {entries.length} of {activeSpecialists.length} demo doctors near{' '}
          {location.area}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-brand-blue hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {entries.length > 0 ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {entries.map((entry) =>
            entry.nearestHospital ? (
              <SpecialistCard
                key={entry.specialist.id}
                specialist={entry.specialist}
                hospital={entry.nearestHospital}
                distanceKm={entry.distanceKm}
                nextSlot={entry.nextSlot}
                extraHospitalCount={entry.hospitals.length - 1}
              />
            ) : null,
          )}
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-brand-line bg-white px-6 py-10 text-center">
          <SearchX className="mx-auto size-8 text-brand-navy-soft/40" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-brand-navy">
            No demo doctors match your filters
          </h2>
          <p className="mt-1 text-xs text-brand-navy-soft">
            Try a different name, specialty, hospital, consultation type, or availability
            window.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Clear filters
          </button>
        </div>
      )}
    </>
  )
}
