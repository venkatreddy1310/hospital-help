import { ArrowRight, BedDouble, Building2, Check, MapPin, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccount } from '../../context/accountStore'
import { useInsuranceWorkspace } from '../../context/insuranceWorkspaceStore'
import type { Hospital } from '../../types/domain'
import { cn } from '../../utils/cn'
import { evaluateHospitalInsurance } from '../../utils/insurance'
import { InsuranceStatusBadge } from '../insurance/InsuranceStatusBadge'
import { AvailabilityBadge } from '../ui/AvailabilityBadge'

export interface HospitalComparisonToggle {
  selected: boolean
  disabled?: boolean
  onToggle: () => void
}

interface HospitalCardProps {
  hospital: Hospital
  className?: string
  comparison?: HospitalComparisonToggle
}

export function HospitalCard({ hospital, className, comparison }: HospitalCardProps) {
  const { activeProfile, policies } = useAccount()
  const { providers } = useInsuranceWorkspace()
  const insurance = evaluateHospitalInsurance(
    activeProfile?.id ?? null,
    policies,
    providers,
    hospital.id,
  )

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition',
        comparison?.selected
          ? 'border-brand-blue ring-1 ring-brand-blue/25'
          : 'border-brand-line',
        'hover:border-brand-blue/30 hover:shadow-md active:border-brand-blue/40',
        className,
      )}
    >
      <Link
        to={`/hospitals/${hospital.id}`}
        aria-label={`View details for ${hospital.name}`}
        className="absolute inset-0 z-0 rounded-2xl"
      />

      {comparison ? (
        <button
          type="button"
          onClick={comparison.onToggle}
          disabled={comparison.disabled}
          aria-pressed={comparison.selected}
          aria-label={
            comparison.selected
              ? `Remove ${hospital.name} from comparison`
              : `Add ${hospital.name} to comparison`
          }
          className={cn(
            'absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold transition-colors',
            comparison.selected
              ? 'border-brand-blue bg-brand-blue text-white'
              : 'border-brand-line bg-white text-brand-navy-soft hover:border-brand-blue/40 hover:text-brand-blue',
            comparison.disabled && 'cursor-not-allowed opacity-40',
          )}
        >
          {comparison.selected ? (
            <Check className="size-3" aria-hidden="true" />
          ) : (
            <Plus className="size-3" aria-hidden="true" />
          )}
          {comparison.selected ? 'Added' : 'Compare'}
        </button>
      ) : null}

      <div className={cn('flex items-start gap-3', comparison && 'pr-[5.25rem]')}>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-soft text-brand-blue">
          <Building2 className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm leading-snug font-semibold text-brand-navy">
            {hospital.name}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-xs text-brand-navy-soft">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{hospital.area}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{hospital.distanceKm.toFixed(1)} km</span>
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-brand-line/80 pt-3">
        <AvailabilityBadge status={hospital.availability} />
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-navy-soft">
          <BedDouble className="size-3.5" aria-hidden="true" />
          {hospital.availableBeds} of {hospital.totalBeds} beds free
        </span>
      </div>

      <div className="mt-2.5">
        <InsuranceStatusBadge evaluation={insurance} />
      </div>

      <span className="mt-auto inline-flex items-center gap-1 pt-2.5 text-[11px] font-semibold text-brand-blue">
        View details
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </div>
  )
}
