import { UserRound, Video, type LucideIcon } from 'lucide-react'
import type { ConsultationType, Specialist } from '../../types/domain'
import { consultationTypeMeta } from '../../utils/specialists'
import { SelectionCard } from './SelectionCard'

const consultationIcons: Record<ConsultationType, LucideIcon> = {
  'in-person': UserRound,
  online: Video,
}

interface BookingConsultationStepProps {
  specialist: Specialist
  selectedType: ConsultationType | null
  onSelect: (type: ConsultationType) => void
}

export function BookingConsultationStep({
  specialist,
  selectedType,
  onSelect,
}: BookingConsultationStepProps) {
  return (
    <div role="group" aria-label="Choose a consultation type" className="space-y-2">
      {specialist.consultationTypes.map((type) => {
        const meta = consultationTypeMeta[type]

        return (
          <SelectionCard
            key={type}
            selected={selectedType === type}
            onSelect={() => onSelect(type)}
            title={meta.label}
            description={meta.description}
            icon={consultationIcons[type]}
          />
        )
      })}
      <p className="pt-1 text-[11px] leading-relaxed text-brand-navy-soft/80">
        No video call is started and no payment is collected in this preview.
      </p>
    </div>
  )
}
