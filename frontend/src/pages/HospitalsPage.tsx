import { GitCompare, List, Loader2, LocateFixed, Map as MapIcon, MapPin, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DemoNotice } from '../components/common/DemoNotice'
import { PageHeader } from '../components/common/PageHeader'
import { CompareBar } from '../components/hospitals/CompareBar'
import { HospitalCard } from '../components/hospitals/HospitalCard'
import { HospitalComparison } from '../components/hospitals/HospitalComparison'
import { LocationSheet } from '../components/layout/LocationSheet'
import { HospitalMap } from '../components/map/HospitalMap'
import { Badge } from '../components/ui/Badge'
import { BottomSheet } from '../components/ui/BottomSheet'
import { FilterChip } from '../components/ui/FilterChip'
import { SearchBar } from '../components/ui/SearchBar'
import { useServiceLocation } from '../context/locationStore'
import { useDemoCatalog } from '../context/catalogStore'
import { useAccount } from '../context/accountStore'
import { useInsuranceWorkspace } from '../context/insuranceWorkspaceStore'
import { useGeolocation } from '../hooks/useGeolocation'
import type { AvailabilityStatus, HospitalType } from '../types/domain'
import { getHospitalsForLocationFrom } from '../utils/demoData'
import { getHospitalsForCoordinates } from '../utils/geo'
import { evaluateHospitalInsurance } from '../utils/insurance'

type AvailabilityFilter = 'all' | AvailabilityStatus
type OwnershipFilter = 'all' | HospitalType
type SortOption = 'distance' | 'beds'
type CareFilter = 'all' | 'network' | 'non-network' | 'emergency' | 'icu' | 'beds'
type ViewMode = 'list' | 'map'

const MAX_COMPARE = 3

const careFilters: Array<{ value: CareFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'network', label: 'Potential cashless network' },
  { value: 'non-network', label: 'Non-network' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'icu', label: 'ICU' },
  { value: 'beds', label: 'Beds free' },
]

const availabilityFilters: Array<{ value: AvailabilityFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'available', label: 'Available' },
  { value: 'limited', label: 'Limited' },
  { value: 'full', label: 'Full' },
]

const ownershipFilters: Array<{ value: OwnershipFilter; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'Government', label: 'Government' },
  { value: 'Private', label: 'Private' },
]

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: 'distance', label: 'Closest' },
  { value: 'beds', label: 'Most beds free' },
]

export function HospitalsPage() {
  const { location } = useServiceLocation()
  const { hospitals: catalogHospitals } = useDemoCatalog()
  const { activeProfile, policies } = useAccount()
  const { providers } = useInsuranceWorkspace()
  const geolocation = useGeolocation()
  const [query, setQuery] = useState('')
  const [availability, setAvailability] = useState<AvailabilityFilter>('all')
  const [careFilter, setCareFilter] = useState<CareFilter>('all')
  const [ownership, setOwnership] = useState<OwnershipFilter>('all')
  const [sort, setSort] = useState<SortOption>('distance')
  const [view, setView] = useState<ViewMode>('list')
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  const hospitals = useMemo(() => {
    const base = getHospitalsForLocationFrom(catalogHospitals, location.id)
    return geolocation.coordinates
      ? getHospitalsForCoordinates(base, geolocation.coordinates)
      : base
  }, [catalogHospitals, location.id, geolocation.coordinates])

  const insuranceEvaluations = useMemo(
    () => Object.fromEntries(
      hospitals.map((hospital) => [
        hospital.id,
        evaluateHospitalInsurance(activeProfile?.id ?? null, policies, providers, hospital.id),
      ]),
    ),
    [hospitals, activeProfile?.id, policies, providers],
  )

  const filteredHospitals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return hospitals.filter((hospital) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [hospital.name, hospital.area, hospital.address, ...hospital.specialties].some(
          (value) => value.toLowerCase().includes(normalizedQuery),
        )
      const matchesAvailability =
        availability === 'all' || hospital.availability === availability
      const matchesOwnership = ownership === 'all' || hospital.type === ownership
      const insuranceStatus = insuranceEvaluations[hospital.id]?.status
      const matchesCare =
        careFilter === 'all' ||
        (careFilter === 'network' && insuranceStatus === 'potential-network') ||
        (careFilter === 'non-network' && insuranceStatus === 'non-network') ||
        (careFilter === 'emergency' && hospital.emergency) ||
        (careFilter === 'icu' && hospital.facilities.includes('icu')) ||
        (careFilter === 'beds' && hospital.availableBeds > 0)

      return matchesQuery && matchesAvailability && matchesOwnership && matchesCare
    })
  }, [hospitals, query, availability, ownership, careFilter, insuranceEvaluations])

  const visibleHospitals = useMemo(() => {
    const sorted = [...filteredHospitals]

    sorted.sort((a, b) =>
      sort === 'beds'
        ? b.availableBeds - a.availableBeds || a.distanceKm - b.distanceKm
        : a.distanceKm - b.distanceKm,
    )

    return sorted
  }, [filteredHospitals, sort])

  const selectedHospitals = useMemo(
    () =>
      selectedIds.flatMap((id) => {
        const hospital = hospitals.find((item) => item.id === id)
        return hospital ? [hospital] : []
      }),
    [hospitals, selectedIds],
  )

  const hasActiveFilters =
    query.trim().length > 0 || availability !== 'all' || careFilter !== 'all' || ownership !== 'all' || sort !== 'distance'

  const clearFilters = () => {
    setQuery('')
    setAvailability('all')
    setCareFilter('all')
    setOwnership('all')
    setSort('distance')
  }

  const toggleCompare = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id)
      if (current.length >= MAX_COMPARE) return current
      return [...current, id]
    })
  }

  const removeCompare = (id: string) => {
    const next = selectedIds.filter((value) => value !== id)
    setSelectedIds(next)
    if (next.length < 2) setIsCompareOpen(false)
  }

  const clearCompare = () => {
    setSelectedIds([])
    setIsCompareOpen(false)
  }

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Hospitals"
        description="Find emergency-ready hospitals near you, compare bed availability, and check facilities before you go."
        actions={<Badge tone="teal">Demo data</Badge>}
      />

      <DemoNotice className="mb-4">
        Hospitals, distances, bed counts, and facilities on this page are simulated demo data
        for Hyderabad, with distances from {location.area}. Nothing here reflects live
        hospital capacity.
      </DemoNotice>

      <div className="rounded-2xl border border-brand-line bg-white p-4 shadow-sm">
        <SearchBar
          value={query}
          onChange={setQuery}
          label="Search hospitals"
          placeholder="Search by hospital, area, or specialty"
        />

        <fieldset className="mt-4">
          <legend className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/70 uppercase">
            Care & insurance · {activeProfile?.fullName ?? 'choose a patient in Account'}
          </legend>
          <div className="flex flex-wrap gap-2">
            {careFilters.map((filter) => (
              <FilterChip
                key={filter.value}
                active={careFilter === filter.value}
                onClick={() => setCareFilter(filter.value)}
              >
                {filter.label}
              </FilterChip>
            ))}
          </div>
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

          <fieldset>
            <legend className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/70 uppercase">
              Hospital type
            </legend>
            <div className="flex flex-wrap gap-2">
              {ownershipFilters.map((filter) => (
                <FilterChip
                  key={filter.value}
                  active={ownership === filter.value}
                  onClick={() => setOwnership(filter.value)}
                >
                  {filter.label}
                </FilterChip>
              ))}
            </div>
          </fieldset>

          <fieldset className="sm:col-span-2 lg:col-span-1">
            <legend className="mb-2 text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/70 uppercase">
              Sort by
            </legend>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <FilterChip
                  key={option.value}
                  active={sort === option.value}
                  onClick={() => setSort(option.value)}
                >
                  {option.label}
                </FilterChip>
              ))}
            </div>
          </fieldset>
        </div>

        <p className="mt-3 flex items-start gap-1.5 border-t border-brand-line pt-3 text-[11px] leading-relaxed text-brand-navy-soft">
          <GitCompare
            className="mt-0.5 size-3.5 shrink-0 text-brand-blue"
            aria-hidden="true"
          />
          <span>
            Select up to {MAX_COMPARE} hospitals with{' '}
            <span className="font-semibold text-brand-navy">Compare</span> to review beds,
            distance, and facilities side by side.
          </span>
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-brand-line bg-white p-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Choose hospital view"
          className="inline-flex rounded-lg bg-brand-surface p-0.5"
        >
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            className={`inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors sm:flex-none ${
              view === 'list'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-brand-navy-soft hover:text-brand-navy'
            }`}
          >
            <List className="size-3.5" aria-hidden="true" />
            List
          </button>
          <button
            type="button"
            onClick={() => setView('map')}
            aria-pressed={view === 'map'}
            className={`inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors sm:flex-none ${
              view === 'map'
                ? 'bg-white text-brand-blue shadow-sm'
                : 'text-brand-navy-soft hover:text-brand-navy'
            }`}
          >
            <MapIcon className="size-3.5" aria-hidden="true" />
            Map
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={geolocation.request}
            disabled={geolocation.status === 'requesting'}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand-line bg-white px-2.5 text-[11px] font-semibold text-brand-blue transition-colors hover:border-brand-blue/30 hover:bg-brand-blue-soft/50 disabled:cursor-wait disabled:opacity-60"
          >
            {geolocation.status === 'requesting' ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <LocateFixed className="size-3.5" aria-hidden="true" />
            )}
            {geolocation.coordinates ? 'Update location' : 'Use my location'}
          </button>
          {geolocation.coordinates ? (
            <button
              type="button"
              onClick={geolocation.clear}
              className="inline-flex min-h-9 items-center rounded-lg px-2 text-[11px] font-semibold text-brand-navy-soft hover:bg-brand-surface"
            >
              Clear device location
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setIsLocationOpen(true)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand-line bg-white px-2.5 text-[11px] font-semibold text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
          >
            <MapPin className="size-3.5" aria-hidden="true" />
            {location.area}
          </button>
        </div>
      </div>

      {geolocation.message &&
      geolocation.status !== 'idle' &&
      geolocation.status !== 'requesting' &&
      geolocation.status !== 'granted' ? (
        <p
          role="status"
          className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-brand-warning-soft px-3 py-2 text-[11px] text-brand-warning"
        >
          {geolocation.message}
          <button
            type="button"
            onClick={() => setIsLocationOpen(true)}
            className="font-semibold text-brand-blue hover:underline"
          >
            Choose a demo area
          </button>
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-xs font-medium text-brand-navy-soft">
          Showing {visibleHospitals.length} of {hospitals.length} hospitals ·{' '}
          {sort === 'distance'
            ? geolocation.coordinates
              ? 'closest to device location'
              : 'closest first'
            : 'most beds free first'}
          {view === 'map' ? ' · map view' : ''}
        </p>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-brand-blue hover:underline"
          >
            Reset filters
          </button>
        ) : null}
      </div>

      {visibleHospitals.length > 0 ? (
        view === 'map' ? (
          <div className="mt-3">
            <HospitalMap
              hospitals={visibleHospitals}
              locationLabel={`${location.area}, ${location.city}`}
              insuranceEvaluations={insuranceEvaluations}
              userCoordinates={geolocation.coordinates}
              locationStatus={geolocation.status}
              locationMessage={geolocation.message}
              onLocate={geolocation.request}
              onClearLocation={geolocation.clear}
              className="h-[440px] lg:h-[580px]"
            />
            <p className="mt-1.5 text-[10px] leading-relaxed text-brand-navy-soft/80">
              Tap a simulated pin to see availability, insurance network status, details, and
              an OpenStreetMap directions link. Public map tiles are best-effort for this
              demo; no uptime guarantee is made.
            </p>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleHospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                comparison={{
                  selected: selectedIds.includes(hospital.id),
                  disabled:
                    selectedIds.length >= MAX_COMPARE && !selectedIds.includes(hospital.id),
                  onToggle: () => toggleCompare(hospital.id),
                }}
              />
            ))}
          </div>
        )
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-brand-line bg-white px-6 py-10 text-center">
          <SearchX className="mx-auto size-8 text-brand-navy-soft/40" aria-hidden="true" />
          <h2 className="mt-3 text-sm font-semibold text-brand-navy">
            No hospitals match your filters
          </h2>
          <p className="mt-1 text-xs text-brand-navy-soft">
            Try a different search term, or reset the filters to see all hospitals.
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

      {selectedHospitals.length > 0 ? (
        <div className="h-24 lg:h-12" aria-hidden="true" />
      ) : null}

      {selectedHospitals.length > 0 ? (
        <CompareBar
          hospitals={selectedHospitals}
          maxCompare={MAX_COMPARE}
          onRemove={removeCompare}
          onClear={clearCompare}
          onCompare={() => {
            if (selectedHospitals.length >= 2) setIsCompareOpen(true)
          }}
        />
      ) : null}

      {isCompareOpen && selectedHospitals.length >= 2 ? (
        <BottomSheet
          title="Compare hospitals"
          description={`Distances from ${location.area}, ${location.city} · simulated demo data`}
          onClose={() => setIsCompareOpen(false)}
          panelClassName="sm:max-w-3xl"
        >
          <HospitalComparison
            hospitals={selectedHospitals}
            locationLabel={location.area}
            onRemove={removeCompare}
          />
        </BottomSheet>
      ) : null}

      {isLocationOpen ? (
        <LocationSheet onClose={() => setIsLocationOpen(false)} />
      ) : null}
    </>
  )
}
