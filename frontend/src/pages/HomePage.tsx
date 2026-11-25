import {
  ArrowRight,
  BedDouble,
  Bell,
  Bot,
  Building2,
  CalendarClock,
  ChevronDown,
  CircleCheck,
  MapPin,
  Navigation,
  PhoneCall,
  RefreshCw,
  Siren,
  Sparkles,
  Stethoscope,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageSectionHeader } from '../components/common/PageSectionHeader'
import { AvailabilityDistribution } from '../components/dashboard/AvailabilityDistribution'
import { InsightCard } from '../components/dashboard/InsightCard'
import { StatCard } from '../components/dashboard/StatCard'
import { HospitalCard } from '../components/hospitals/HospitalCard'
import { LocationSheet } from '../components/layout/LocationSheet'
import { NotificationsSheet } from '../components/layout/NotificationsSheet'
import { Badge } from '../components/ui/Badge'
import { QuickActionCard } from '../components/ui/QuickActionCard'
import { useServiceLocation } from '../context/locationStore'
import { useDemoCatalog } from '../context/catalogStore'
import { useAccount } from '../context/accountStore'
import { useInsuranceWorkspace } from '../context/insuranceWorkspaceStore'
import { useGeolocation } from '../hooks/useGeolocation'
import type { InsightKind, UpdateKind } from '../utils/dashboard'
import { getDashboardInsights, getDashboardStats, getDemoUpdates } from '../utils/dashboard'
import { getHospitalsForLocationFrom } from '../utils/demoData'
import { getHospitalsForCoordinates, sortHospitalsByDistance } from '../utils/geo'
import { evaluateHospitalInsurance } from '../utils/insurance'
import { HospitalMap } from '../components/map/HospitalMap'

const insightIcons: Record<InsightKind, LucideIcon> = {
  'most-beds': BedDouble,
  'nearest-open': Navigation,
  limited: TriangleAlert,
  specialists: Stethoscope,
}

const updateIcons: Record<UpdateKind, LucideIcon> = {
  availability: RefreshCw,
  specialists: CalendarClock,
  location: MapPin,
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const { location } = useServiceLocation()
  const { hospitals: catalogHospitals, specialists } = useDemoCatalog()
  const { activeProfile, policies } = useAccount()
  const { providers } = useInsuranceWorkspace()
  const geolocation = useGeolocation()
  const [searchParams] = useSearchParams()
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const hospitals = useMemo(() => {
    const base = getHospitalsForLocationFrom(catalogHospitals, location.id)
    return geolocation.coordinates
      ? sortHospitalsByDistance(
          getHospitalsForCoordinates(base, geolocation.coordinates),
        )
      : base
  }, [catalogHospitals, location.id, geolocation.coordinates])
  const insuranceEvaluations = useMemo(
    () =>
      Object.fromEntries(
        hospitals.map((hospital) => [
          hospital.id,
          evaluateHospitalInsurance(
            activeProfile?.id ?? null,
            policies,
            providers,
            hospital.id,
          ),
        ]),
      ),
    [hospitals, activeProfile?.id, policies, providers],
  )
  const activeSpecialists = useMemo(
    () => specialists.filter((specialist) => specialist.active),
    [specialists],
  )
  const stats = getDashboardStats(hospitals, activeSpecialists)
  const insights = getDashboardInsights(hospitals, activeSpecialists)
  const updates = getDemoUpdates(hospitals, activeSpecialists, location)
  const nearbyHospitals = hospitals.slice(0, 3)
  const initialHospitalId = searchParams.get('hospital')

  const statCards = [
    {
      label: 'Nearby hospitals',
      value: stats.nearbyHospitals,
      hint: 'Within 5 km',
      icon: Building2,
      tone: 'blue' as const,
    },
    {
      label: 'Hospitals with available beds',
      value: stats.nearbyHospitalsWithBeds,
      hint: 'Within 5 km',
      icon: CircleCheck,
      tone: 'teal' as const,
    },
    {
      label: 'Total available beds',
      value: stats.nearbyAvailableBeds,
      hint: 'Within 5 km',
      icon: BedDouble,
      tone: 'blue' as const,
    },
    {
      label: 'Available specialists',
      value: stats.availableSpecialists,
      hint: 'Demo slots today',
      icon: Stethoscope,
      tone: 'teal' as const,
    },
  ]

  return (
    <>
      <section
        aria-labelledby="dashboard-greeting"
        className="relative isolate overflow-hidden rounded-3xl bg-brand-navy px-4 py-4 text-white shadow-sm sm:px-5 sm:py-5"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-12 size-48 rounded-full bg-brand-blue/60 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/4 size-48 rounded-full bg-brand-teal/25 blur-3xl"
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-white/60 uppercase">
              MediPulse command centre
            </p>
            <h1
              id="dashboard-greeting"
              className="mt-1 text-xl font-bold tracking-tight sm:text-2xl"
            >
              {getGreeting()}
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-white/75">
              Emergency care around {location.area}, {location.city}. All data is simulated.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            aria-label="Open notifications"
            aria-haspopup="dialog"
            aria-expanded={isNotificationsOpen}
            className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:bg-white/25"
          >
            <Bell className="size-4.5" aria-hidden="true" />
            <span
              className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand-teal ring-2 ring-brand-navy"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLocationOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isLocationOpen}
            className="group inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/10 py-1.5 pr-2 pl-2.5 text-xs font-semibold text-white transition-colors hover:bg-white/20 active:bg-white/25"
          >
            <MapPin className="size-3.5 shrink-0 text-brand-teal" aria-hidden="true" />
            <span className="truncate">
              {location.area}, {location.city}
            </span>
            <ChevronDown
              className="size-3.5 shrink-0 text-white/60 transition-transform group-hover:translate-y-0.5"
              aria-hidden="true"
            />
          </button>
          <span className="rounded-full bg-white/5 px-2.5 py-1.5 text-[10px] font-medium text-white/55">
            {geolocation.status === 'granted'
              ? 'GPS on · approximate device location'
              : geolocation.status === 'requesting'
                ? 'Locating…'
                : 'GPS off · demo distances'}
          </span>
        </div>
      </section>

      <section aria-label="Hospital map" className="mt-4">
        <HospitalMap
          hospitals={hospitals}
          locationLabel={`${location.area}, ${location.city}`}
          initialSelectedId={initialHospitalId}
          insuranceEvaluations={insuranceEvaluations}
          userCoordinates={geolocation.coordinates}
          locationStatus={geolocation.status}
          locationMessage={geolocation.message}
          onLocate={geolocation.request}
          onClearLocation={geolocation.clear}
        />
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-brand-navy-soft/80">
          <span>
            {geolocation.coordinates
              ? 'Distances are straight-line estimates from your approximate device location.'
              : 'Distances use the selected demo area. Use the locate control to try browser geolocation.'}
          </span>
          {geolocation.status === 'denied' ||
          geolocation.status === 'unavailable' ||
          geolocation.status === 'timeout' ||
          geolocation.status === 'unsupported' ? (
            <button
              type="button"
              onClick={() => setIsLocationOpen(true)}
              className="font-semibold text-brand-blue hover:underline"
            >
              Choose a demo area instead
            </button>
          ) : null}
        </p>
      </section>

      <section aria-labelledby="overview-heading" className="mt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2
            id="overview-heading"
            className="text-sm font-bold tracking-tight text-brand-navy sm:text-base"
          >
            Care overview
          </h2>
          <span className="text-[10px] font-medium text-brand-navy-soft">
            Nearby radius of 5 km from{' '}
            {geolocation.coordinates ? 'your device' : location.area}
          </span>
        </div>
        <ul className="mt-2 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {statCards.map((item) => (
            <li key={item.label}>
              <StatCard
                icon={item.icon}
                label={item.label}
                value={item.value}
                hint={item.hint}
                tone={item.tone}
              />
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <AvailabilityDistribution hospitals={hospitals} />

        <section
          aria-labelledby="insights-heading"
          className="flex h-full flex-col rounded-2xl border border-brand-line bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2
                id="insights-heading"
                className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-brand-navy"
              >
                <Sparkles className="size-4 text-brand-teal-dark" aria-hidden="true" />
                Quick insights
              </h2>
              <p className="mt-0.5 text-[11px] text-brand-navy-soft">
                Generated from simulated demo data
              </p>
            </div>
            <Badge tone="neutral">Demo</Badge>
          </div>
          <ul className="mt-3 grid flex-1 gap-2 sm:grid-cols-2">
            {insights.map((insight) => (
              <InsightCard
                key={insight.kind}
                icon={insightIcons[insight.kind]}
                title={insight.title}
                detail={insight.detail}
              />
            ))}
          </ul>
        </section>
      </div>

      <section aria-label="Nearby hospitals" className="mt-6">
        <PageSectionHeader
          title="Nearby hospitals"
          description={`Closest to ${geolocation.coordinates ? 'your device location' : location.area} · simulated availability`}
          action={
            <Link
              to="/hospitals"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {nearbyHospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              className="w-[272px] shrink-0 snap-start lg:w-auto"
            />
          ))}
        </div>
      </section>

      <section aria-label="Emergency assistance" className="mt-8">
        <PageSectionHeader
          title="Emergency assistance"
          description="Call for help now, or find the right care setting."
        />

        <div className="rounded-2xl border border-brand-critical/20 bg-brand-critical-soft p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-critical text-white">
              <PhoneCall className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-brand-critical">
                Call emergency services
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-brand-critical/80">
                India&apos;s free helplines, available 24 hours a day. Tap a number to open
                your phone dialer.
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <a
              href="tel:112"
              aria-label="Call 112, India's national emergency number"
              className="group flex items-center justify-between gap-3 rounded-xl border border-brand-critical/25 bg-white px-3.5 py-2.5 transition hover:border-brand-critical/50 hover:shadow-sm active:bg-brand-critical-soft/60"
            >
              <span className="min-w-0">
                <span className="block text-base leading-tight font-bold text-brand-critical">
                  112
                </span>
                <span className="block text-[11px] font-medium text-brand-navy-soft">
                  National emergency
                </span>
              </span>
              <PhoneCall
                className="size-4 shrink-0 text-brand-critical transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
            </a>
            <a
              href="tel:108"
              aria-label="Call 108, ambulance emergency service"
              className="group flex items-center justify-between gap-3 rounded-xl border border-brand-critical/25 bg-white px-3.5 py-2.5 transition hover:border-brand-critical/50 hover:shadow-sm active:bg-brand-critical-soft/60"
            >
              <span className="min-w-0">
                <span className="block text-base leading-tight font-bold text-brand-critical">
                  108
                </span>
                <span className="block text-[11px] font-medium text-brand-navy-soft">
                  Ambulance service
                </span>
              </span>
              <PhoneCall
                className="size-4 shrink-0 text-brand-critical transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
            </a>
          </div>

          <p className="mt-2.5 text-[10px] leading-relaxed text-brand-critical/75">
            This opens your dialer only. MediPulse does not place the call or dispatch
            emergency services.
          </p>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            to="/triage"
            icon={Siren}
            title="Start AI triage"
            description="Answer a few questions to gauge urgency."
            tone="primary"
          />
          <QuickActionCard
            to="/assistant"
            icon={Bot}
            title="Ask the health assistant"
            description="Plain-language education and doctor prep."
          />
          <QuickActionCard
            to="/hospitals"
            icon={Building2}
            title="Find nearby hospitals"
            description="Compare nearby emergency departments."
          />
          <QuickActionCard
            to="/specialists"
            icon={Stethoscope}
            title="Find specialists"
            description="Browse consultants by specialty."
          />
        </div>
      </section>

      <section aria-label="Latest updates" className="mt-8">
        <PageSectionHeader
          title="Latest updates"
          description="Simulated demo feed, not live hospital data."
          action={<Badge tone="neutral">Demo</Badge>}
        />
        <ul className="grid gap-2.5 sm:grid-cols-3">
          {updates.map((update) => {
            const Icon = updateIcons[update.kind]

            return (
              <li
                key={update.kind}
                className="rounded-2xl border border-brand-line bg-white p-3.5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="flex size-8 items-center justify-center rounded-lg bg-brand-blue-soft text-brand-blue"
                    aria-hidden="true"
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide text-brand-navy-soft/60 uppercase">
                    Simulated
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-brand-navy">{update.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-brand-navy-soft">
                  {update.detail}
                </p>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="mt-6 text-[11px] leading-relaxed text-brand-navy-soft/80">
        Hospital locations, facilities, bed counts, distances, and specialist availability
        shown here are simulated for the MediPulse demo. Nearby figures use a 5 km radius from{' '}
        {geolocation.coordinates ? 'your approximate device location' : 'the selected demo location'}.
        Nothing here reflects live hospital capacity.
      </p>

      {isLocationOpen ? <LocationSheet onClose={() => setIsLocationOpen(false)} /> : null}
      {isNotificationsOpen ? (
        <NotificationsSheet onClose={() => setIsNotificationsOpen(false)} />
      ) : null}
    </>
  )
}
