import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
  CirclePlus,
  Settings2,
  ShieldCheck,
  Stethoscope,
  UserRoundPlus,
  Users,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AdminActivityList } from '../../components/admin/AdminActivityList'
import { AppointmentActivityChart } from '../../components/admin/AppointmentActivityChart'
import { BedDistributionCard } from '../../components/admin/BedDistributionCard'
import { DemoNotice } from '../../components/common/DemoNotice'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/dashboard/StatCard'
import { AvailabilityBadge } from '../../components/ui/AvailabilityBadge'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { useAppointments } from '../../context/appointmentStore'
import { useDemoCatalog } from '../../context/catalogStore'
import {
  getAdminCatalogStats,
  getAppointmentStatusCounts,
} from '../../utils/adminInsights'

const quickActions = [
  {
    to: '/admin/hospitals?new=1',
    icon: CirclePlus,
    title: 'Add a demo hospital',
    description: 'Extend the simulated directory and capacity view.',
  },
  {
    to: '/admin/doctors?new=1',
    icon: UserRoundPlus,
    title: 'Add a fictional doctor',
    description: 'Create a demo profile with simulated clinic slots.',
  },
  {
    to: '/admin/appointments',
    icon: CalendarDays,
    title: 'Review appointments',
    description: 'Search local demo bookings and manage their status.',
  },
  {
    to: '/admin/settings',
    icon: Settings2,
    title: 'Demo data settings',
    description: 'Reset admin edits and local demo appointments.',
  },
]

export function AdminOverviewPage() {
  const { hospitals, specialists, insuranceProviders, patientAccounts, activity } =
    useDemoCatalog()
  const { appointments } = useAppointments()

  const stats = getAdminCatalogStats(
    hospitals,
    specialists,
    appointments,
    insuranceProviders,
    patientAccounts,
  )
  const appointmentCounts = getAppointmentStatusCounts(appointments)

  const statCards = [
    {
      label: 'Demo patient accounts',
      value: stats.demoPatientAccounts,
      hint: 'Simulated primary accounts',
      icon: UsersRound,
      tone: 'teal' as const,
    },
    {
      label: 'Family profiles',
      value: stats.familyProfiles,
      hint: 'Linked fictional family members',
      icon: Users,
      tone: 'blue' as const,
    },
    {
      label: 'Demo hospitals',
      value: stats.hospitals,
      hint: 'Simulated directory',
      icon: Building2,
      tone: 'blue' as const,
    },
    {
      label: 'Active specialists',
      value: stats.activeSpecialists,
      hint: `${stats.specialists} fictional profiles total`,
      icon: Stethoscope,
      tone: 'teal' as const,
    },
    {
      label: 'Demo appointments',
      value: stats.appointments,
      hint: `${appointmentCounts.upcoming} upcoming · local records`,
      icon: CalendarDays,
      tone: 'blue' as const,
    },
    {
      label: 'Beds free',
      value: stats.availableBeds,
      hint: `${stats.occupiedBeds} occupied · simulated`,
      icon: BedDouble,
      tone: 'teal' as const,
    },
    {
      label: 'Total beds',
      value: stats.totalBeds,
      hint: 'Across demo hospitals',
      icon: BedDouble,
      tone: 'blue' as const,
    },
    {
      label: 'Insurance providers',
      value: stats.insuranceProviders,
      hint: `${stats.activeInsuranceProviders} active · fictional`,
      icon: ShieldCheck,
      tone: 'teal' as const,
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Admin · Overview"
        title="Operations overview"
        description="A simulated administration view of the MediPulse demo directory, locally stored appointments, and fictional insurance coverage."
        actions={<Badge tone="teal">Demo admin</Badge>}
      />

      <DemoNotice className="mb-4">
        Patients, hospitals, doctors, insurance providers, and bed counts are simulated
        directory data. Appointment figures come from demo records saved in this browser
        only. None of these metrics are live operational statistics.
      </DemoNotice>

      <section aria-labelledby="admin-stats-heading">
        <h2 id="admin-stats-heading" className="sr-only">
          Key administration metrics
        </h2>
        <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
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
        <BedDistributionCard hospitals={hospitals} />
        <AppointmentActivityChart appointments={appointments} />
      </div>

      <section aria-labelledby="quick-actions-heading" className="mt-5">
        <div className="mb-2 flex items-end justify-between gap-2">
          <h2
            id="quick-actions-heading"
            className="text-sm font-bold tracking-tight text-brand-navy sm:text-base"
          >
            Quick management actions
          </h2>
          <span className="text-[10px] font-medium text-brand-navy-soft">
            Demo changes save locally
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group flex items-start gap-2.5 rounded-2xl border border-brand-line bg-white p-3.5 shadow-sm transition-colors hover:border-brand-blue/30 hover:bg-brand-surface/40"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue-soft text-brand-blue"
                aria-hidden="true"
              >
                <action.icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-brand-navy group-hover:text-brand-blue">
                  {action.title}
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-brand-navy-soft">
                  {action.description}
                </span>
              </span>
              <ArrowRight
                className="mt-1 size-3.5 shrink-0 text-brand-navy-soft/60 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-white">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
                <Building2 className="size-4 text-brand-blue" aria-hidden="true" />
                Hospital availability overview
              </h2>
              <p className="mt-1 text-[11px] text-brand-navy-soft">
                Simulated status and bed counts from the demo directory.
              </p>
            </div>
            <Link
              to="/admin/hospitals"
              className="text-[11px] font-semibold text-brand-blue hover:underline"
            >
              Manage hospitals
            </Link>
          </div>

          {hospitals.length > 0 ? (
            <ul className="mt-3 divide-y divide-brand-line/80">
              {hospitals.map((hospital) => {
                const percent =
                  hospital.totalBeds > 0
                    ? Math.round((hospital.availableBeds / hospital.totalBeds) * 100)
                    : 0

                return (
                  <li
                    key={hospital.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/hospitals/${hospital.id}`}
                        className="block truncate text-xs font-semibold text-brand-navy hover:text-brand-blue"
                      >
                        {hospital.name}
                      </Link>
                      <p className="mt-0.5 text-[10px] text-brand-navy-soft">
                        {hospital.area} · {hospital.availableBeds}/{hospital.totalBeds}{' '}
                        beds free
                      </p>
                    </div>
                    <div className="hidden w-24 sm:block">
                      <div className="h-1.5 overflow-hidden rounded-full bg-brand-surface">
                        <div
                          className="h-full rounded-full bg-brand-teal"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <AvailabilityBadge status={hospital.availability} />
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-brand-line bg-brand-surface/60 px-4 py-3 text-xs text-brand-navy-soft">
              No demo hospitals are registered. Add one from hospital management.
            </p>
          )}
        </Card>

        <Card className="bg-white">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-brand-navy">Recent system activity</h2>
              <p className="mt-1 text-[11px] text-brand-navy-soft">
                Admin actions recorded in this browser.
              </p>
            </div>
            <Link
              to="/admin/activity"
              className="text-[11px] font-semibold text-brand-blue hover:underline"
            >
              View log
            </Link>
          </div>
          <div className="mt-3">
            <AdminActivityList activity={activity} limit={4} />
          </div>
        </Card>
      </div>
    </>
  )
}
