import { ArrowRight, Building2, CalendarClock, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Hospital, Specialist } from '../../types/domain'
import { formatDemoFee } from '../../utils/appointments'
import { cn } from '../../utils/cn'
import { getTodayISO } from '../../utils/dateTime'
import {
  formatNextSlotLabel,
  type SpecialistSlotRef,
} from '../../utils/specialistDirectory'
import { consultationTypeMeta, getSpecialtyLabel } from '../../utils/specialists'
import { DoctorAvatar } from './DoctorAvatar'

interface SpecialistCardProps {
  specialist: Specialist
  hospital: Hospital
  distanceKm: number
  nextSlot: SpecialistSlotRef | null
  extraHospitalCount?: number
}

export function SpecialistCard({
  specialist,
  hospital,
  distanceKm,
  nextSlot,
  extraHospitalCount = 0,
}: SpecialistCardProps) {
  const today = getTodayISO()
  const availableToday = nextSlot?.date === today
  const availabilityLabel = formatNextSlotLabel(nextSlot, today)

  return (
    <Link
      to={`/specialists/${specialist.id}`}
      className="group flex h-full flex-col rounded-2xl border border-brand-line bg-white p-4 shadow-sm transition-colors hover:border-brand-blue/30 hover:bg-brand-surface/30"
    >
      <div className="flex items-start gap-3">
        <DoctorAvatar name={specialist.name} specialty={specialist.specialty} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-brand-navy group-hover:text-brand-blue">
              {specialist.name}
            </h3>
            <span className="rounded-full bg-brand-surface px-2 py-0.5 text-[10px] font-semibold text-brand-navy-soft">
              Demo profile
            </span>
          </div>
          <p className="mt-0.5 text-xs text-brand-navy-soft">
            {getSpecialtyLabel(specialist.specialty)}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-brand-surface/75 px-3 py-2">
          <dt className="text-[9px] font-semibold tracking-[0.1em] text-brand-navy-soft/70 uppercase">
            Experience
          </dt>
          <dd className="mt-0.5 text-xs font-semibold text-brand-navy">
            {specialist.experienceYears} years
          </dd>
        </div>
        <div className="rounded-xl bg-brand-surface/75 px-3 py-2">
          <dt className="text-[9px] font-semibold tracking-[0.1em] text-brand-navy-soft/70 uppercase">
            Demo fee
          </dt>
          <dd className="mt-0.5 text-xs font-semibold text-brand-navy">
            {formatDemoFee(specialist.consultationFee)}
          </dd>
        </div>
      </dl>

      <div className="mt-3 space-y-1.5 text-xs text-brand-navy-soft">
        <p className="flex items-start gap-1.5">
          <Building2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block truncate font-medium text-brand-navy">
              {hospital.name}
            </span>
            {extraHospitalCount > 0 ? (
              <span className="block text-[10px] text-brand-navy-soft/80">
                +{extraHospitalCount} more demo hospital
                {extraHospitalCount === 1 ? '' : 's'}
              </span>
            ) : null}
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span>
            {hospital.area} · {distanceKm.toFixed(1)} km
          </span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {specialist.consultationTypes.map((type) => (
          <span
            key={type}
            className="rounded-md bg-brand-blue-soft px-2 py-1 text-[10px] font-semibold text-brand-blue"
          >
            {consultationTypeMeta[type].shortLabel}
          </span>
        ))}
      </div>

      <div
        className={cn(
          'mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-[11px] font-semibold',
          availableToday
            ? 'bg-brand-teal-soft text-brand-teal-dark'
            : nextSlot
              ? 'bg-brand-warning-soft text-brand-warning'
              : 'bg-brand-surface text-brand-navy-soft',
        )}
      >
        <CalendarClock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{availabilityLabel}</span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-brand-line/80 pt-3 text-[11px]">
        <span className="text-brand-navy-soft/70">Simulated availability</span>
        <span className="inline-flex items-center gap-1 font-semibold text-brand-blue">
          View profile
          <ArrowRight
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  )
}
