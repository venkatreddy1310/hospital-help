import { Building2 } from 'lucide-react'
import type { Hospital } from '../../types/domain'
import { SelectionCard } from './SelectionCard'

interface BookingHospitalStepProps {
  hospitals: Hospital[]
  selectedHospitalId: string | null
  onSelect: (hospitalId: string) => void
}

export function BookingHospitalStep({
  hospitals,
  selectedHospitalId,
  onSelect,
}: BookingHospitalStepProps) {
  if (hospitals.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-brand-line bg-brand-surface/60 px-4 py-3 text-xs text-brand-navy-soft">
        No demo hospitals are linked to this profile. Return to the directory and choose
        another doctor.
      </p>
    )
  }

  return (
    <div role="group" aria-label="Choose a demo hospital" className="space-y-2">
      {hospitals.map((hospital) => (
        <SelectionCard
          key={hospital.id}
          selected={selectedHospitalId === hospital.id}
          onSelect={() => onSelect(hospital.id)}
          title={hospital.name}
          description={hospital.address}
          meta={`${hospital.type} · ${hospital.area} · ${hospital.distanceKm.toFixed(1)} km from your selected area`}
          icon={Building2}
        />
      ))}
      <p className="pt-1 text-[11px] leading-relaxed text-brand-navy-soft/80">
        Hospitals and distances are simulated demo data. No real hospital is contacted.
      </p>
    </div>
  )
}
