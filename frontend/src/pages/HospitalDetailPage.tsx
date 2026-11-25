import {
  Ambulance,
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  Droplets,
  HeartPulse,
  MapPin,
  Pill,
  ScanLine,
  ShieldCheck,
  Siren,
  Star,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useMemo } from 'react'
import { DemoNotice } from '../components/common/DemoNotice'
import { BedAvailabilityBar } from '../components/hospitals/BedAvailabilityBar'
import { HospitalFacilityCard } from '../components/hospitals/HospitalFacilityCard'
import { SpecialistCard } from '../components/specialists/SpecialistCard'
import { InsuranceStatusBadge } from '../components/insurance/InsuranceStatusBadge'
import { AvailabilityBadge } from '../components/ui/AvailabilityBadge'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { useAppointments } from '../context/appointmentStore'
import { useAccount } from '../context/accountStore'
import { useDemoCatalog } from '../context/catalogStore'
import { useInsuranceWorkspace } from '../context/insuranceWorkspaceStore'
import { useServiceLocation } from '../context/locationStore'
import type { FacilityKey } from '../types/domain'
import { getHospitalsForLocationFrom } from '../utils/demoData'
import { facilityMeta } from '../utils/facilities'
import { evaluateHospitalInsurance } from '../utils/insurance'
import { getSpecialistEntry } from '../utils/specialistDirectory'

const facilityIcons: Record<FacilityKey, LucideIcon> = {
  icu: HeartPulse,
  ambulance: Ambulance,
  diagnostics: ScanLine,
  pharmacy: Pill,
  bloodBank: Droplets,
}

export function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { location } = useServiceLocation()
  const { hospitals: catalogHospitals, specialists } = useDemoCatalog()
  const { appointments } = useAppointments()
  const { activeProfile, policies } = useAccount()
  const { providers } = useInsuranceWorkspace()
  const hospitals = useMemo(
    () => getHospitalsForLocationFrom(catalogHospitals, location.id),
    [catalogHospitals, location.id],
  )
  const hospital = hospitals.find((item) => item.id === id)

  if (!hospital) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link
          to="/hospitals"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All hospitals
        </Link>
        <Card className="bg-white">
          <h1 className="text-lg font-bold text-brand-navy">Hospital not found</h1>
          <p className="mt-2 text-sm text-brand-navy-soft">
            This hospital ID is not part of the simulated demo directory.
          </p>
          <Link
            to="/hospitals"
            className="mt-4 inline-flex rounded-lg bg-brand-blue px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
          >
            Back to directory
          </Link>
        </Card>
      </div>
    )
  }

  const occupiedBeds = hospital.totalBeds - hospital.availableBeds
  const insurance = evaluateHospitalInsurance(
    activeProfile?.id ?? null,
    policies,
    providers,
    hospital.id,
  )
  const hospitalSpecialists = specialists
    .filter(
      (specialist) =>
        specialist.active && specialist.hospitalIds.includes(hospital.id),
    )
    .map((specialist) =>
      getSpecialistEntry(
        specialist,
        hospitals,
        appointments,
        undefined,
        hospital.id,
      ),
    )
  const availableTodayCount = hospitalSpecialists.filter(
    (entry) => entry.availableToday,
  ).length

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/hospitals"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All hospitals
      </Link>

      <Card className="bg-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="teal">Demo profile</Badge>
              <Badge tone="neutral">{hospital.type}</Badge>
              {hospital.emergency ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue-soft px-2.5 py-1 text-[11px] font-semibold text-brand-blue">
                  <Siren className="size-3" aria-hidden="true" />
                  24/7 emergency
                </span>
              ) : null}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-brand-navy">
              {hospital.name}
            </h1>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-brand-navy-soft">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {hospital.address}
            </p>
            {hospital.rating !== undefined ? (
              <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-brand-navy-soft">
                <Star
                  className="size-3.5 text-brand-warning"
                  fill="currentColor"
                  aria-hidden="true"
                />
                <span className="font-semibold text-brand-navy">
                  {hospital.rating.toFixed(1)} / 5
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {(hospital.reviewCount ?? 0).toLocaleString('en-IN')} simulated reviews
                </span>
              </p>
            ) : null}
          </div>
          <AvailabilityBadge status={hospital.availability} className="px-3 py-1.5" />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-brand-line pt-4 sm:grid-cols-3">
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.12em] text-brand-navy-soft/70 uppercase">
              Location
            </dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">{hospital.area}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.12em] text-brand-navy-soft/70 uppercase">
              Distance
            </dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">
              {hospital.distanceKm.toFixed(1)} km
              <span className="mt-0.5 block text-[10px] font-medium text-brand-navy-soft/80">
                from {location.area}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-semibold tracking-[0.12em] text-brand-navy-soft/70 uppercase">
              Emergency
            </dt>
            <dd className="mt-1 text-sm font-semibold text-brand-navy">
              {hospital.emergency ? '24/7 department' : 'Not listed'}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            to={`/?hospital=${hospital.id}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand-blue px-4 text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark active:bg-brand-blue-dark/90"
          >
            <MapPin className="size-4" aria-hidden="true" />
            View on map
          </Link>
          <Link
            to="/hospitals"
            className="inline-flex h-10 items-center rounded-xl border border-brand-line bg-white px-4 text-xs font-semibold text-brand-navy-soft transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
          >
            Back to directory
          </Link>
        </div>
      </Card>

      <Card className="mt-4 border-brand-teal/20 bg-brand-teal-soft/35">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.12em] text-brand-navy-soft uppercase">Insurance · {activeProfile?.fullName ?? 'no active patient'}</p>
            <h2 className="mt-1 text-sm font-semibold text-brand-navy">Simulated network guidance</h2>
          </div>
          <InsuranceStatusBadge evaluation={insurance} />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-brand-navy-soft">{insurance.detail}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to={`/coverage-checker?hospital=${hospital.id}`} className="rounded-lg bg-brand-blue px-3 py-2 text-[11px] font-semibold text-white hover:bg-brand-blue-dark">Check illustrative coverage</Link>
          <Link to="/cashless-guidance" className="rounded-lg border border-brand-line bg-white px-3 py-2 text-[11px] font-semibold text-brand-blue hover:bg-brand-surface">Cashless guidance</Link>
        </div>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="bg-white">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
            <BedDouble className="size-4 text-brand-teal-dark" aria-hidden="true" />
            Bed availability
          </h2>

          <dl className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-brand-surface/70 p-2.5">
              <dt className="text-[10px] font-semibold tracking-wide text-brand-navy-soft/70 uppercase">
                Free
              </dt>
              <dd className="mt-0.5 text-lg leading-none font-bold text-brand-teal-dark">
                {hospital.availableBeds}
              </dd>
            </div>
            <div className="rounded-xl bg-brand-surface/70 p-2.5">
              <dt className="text-[10px] font-semibold tracking-wide text-brand-navy-soft/70 uppercase">
                Occupied
              </dt>
              <dd className="mt-0.5 text-lg leading-none font-bold text-brand-navy">
                {occupiedBeds}
              </dd>
            </div>
            <div className="rounded-xl bg-brand-surface/70 p-2.5">
              <dt className="text-[10px] font-semibold tracking-wide text-brand-navy-soft/70 uppercase">
                Total
              </dt>
              <dd className="mt-0.5 text-lg leading-none font-bold text-brand-navy">
                {hospital.totalBeds}
              </dd>
            </div>
          </dl>

          <BedAvailabilityBar
            available={hospital.availableBeds}
            total={hospital.totalBeds}
            status={hospital.availability}
            className="mt-3"
          />
          {hospital.icuBeds !== undefined ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-surface/70 px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-navy-soft">
                <HeartPulse className="size-3.5 text-brand-teal-dark" aria-hidden="true" />
                ICU beds free (simulated)
              </span>
              <span className="text-xs font-bold text-brand-navy">
                {hospital.icuBeds === 0
                  ? 'No ICU in this demo profile'
                  : `${hospital.availableIcuBeds ?? 0} of ${hospital.icuBeds}`}
              </span>
            </div>
          ) : null}
          <p className="mt-2 text-[10px] leading-relaxed text-brand-navy-soft/80">
            Occupied beds are calculated from the simulated total and available counts.
            ICU figures are simulated and not a live feed.
          </p>
        </Card>

        <Card className="bg-white">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
            <ShieldCheck className="size-4 text-brand-teal-dark" aria-hidden="true" />
            Facilities &amp; emergency services
          </h2>
          <p className="mt-1 text-[11px] text-brand-navy-soft">
            Simulated facility list for this demo hospital.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {hospital.emergency ? (
              <HospitalFacilityCard
                icon={Siren}
                title="Emergency dept."
                description="24/7 emergency care"
              />
            ) : null}
            {hospital.facilities.map((facility) => {
              const meta = facilityMeta[facility]

              return (
                <HospitalFacilityCard
                  key={facility}
                  icon={facilityIcons[facility]}
                  title={meta.label}
                  description={meta.description}
                />
              )
            })}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="bg-white">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
            <Stethoscope className="size-4 text-brand-blue" aria-hidden="true" />
            Departments &amp; services
          </h2>
          <p className="mt-1 text-[11px] text-brand-navy-soft">
            Specialties listed in this simulated profile.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {hospital.specialties.map((specialty) => (
              <li
                key={specialty}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-surface px-2.5 py-1.5 text-xs font-medium text-brand-navy-soft"
              >
                <Stethoscope
                  className="size-3.5 text-brand-teal-dark"
                  aria-hidden="true"
                />
                {specialty}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="bg-white">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
            <Building2 className="size-4 text-brand-blue" aria-hidden="true" />
            Before you visit
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-brand-navy-soft">
            Capacity can change quickly. In a life-threatening emergency, call 112 or 108
            instead of travelling to a hospital on your own.
          </p>
          <Link
            to="/emergency"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
          >
            View emergency numbers
          </Link>
        </Card>
      </div>

      <section aria-labelledby="hospital-specialists-heading" className="mt-4">
        <Card className="bg-white">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                id="hospital-specialists-heading"
                className="flex items-center gap-2 text-sm font-semibold text-brand-navy"
              >
                <Stethoscope className="size-4 text-brand-teal-dark" aria-hidden="true" />
                Associated demo specialists
              </h2>
              <p className="mt-1 text-[11px] text-brand-navy-soft">
                {hospitalSpecialists.length} fictional doctor
                {hospitalSpecialists.length === 1 ? '' : 's'} linked to this hospital
                {availableTodayCount > 0
                  ? ` · ${availableTodayCount} with simulated slots today`
                  : ''}
                .
              </p>
            </div>
            <Link
              to={`/specialists?hospital=${hospital.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
            >
              View specialists
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          {hospitalSpecialists.length > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {hospitalSpecialists.map((entry) => (
                <SpecialistCard
                  key={entry.specialist.id}
                  specialist={entry.specialist}
                  hospital={entry.nearestHospital ?? hospital}
                  distanceKm={entry.distanceKm}
                  nextSlot={entry.nextSlot}
                  extraHospitalCount={Math.max(entry.hospitals.length - 1, 0)}
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-brand-line bg-brand-surface/50 px-4 py-3 text-xs text-brand-navy-soft">
              No demo specialists are linked to this hospital in the simulated
              directory.
            </p>
          )}

          <p className="mt-2 text-[10px] leading-relaxed text-brand-navy-soft/75">
            Doctor profiles, qualifications, and availability are fictional demo data.
            Any demo appointment is stored locally on this device.
          </p>
        </Card>
      </section>

      <DemoNotice className="mt-4">
        This hospital profile, its facilities, services, and all bed counts are simulated demo
        data. No contact details are connected, and no real hospital appointment is made.
      </DemoNotice>
    </div>
  )
}
