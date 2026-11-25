import { CircleHelp, ShieldCheck, ShieldX } from 'lucide-react'
import { Badge } from '../ui/Badge'
import type { HospitalInsuranceEvaluation } from '../../utils/insurance'

export function InsuranceStatusBadge({
  evaluation,
}: {
  evaluation: HospitalInsuranceEvaluation
}) {
  const isMatch = evaluation.status === 'potential-network'
  const Icon = isMatch ? ShieldCheck : evaluation.status === 'insufficient-information' ? CircleHelp : ShieldX

  return (
    <Badge tone={isMatch ? 'teal' : evaluation.status === 'no-policy' ? 'neutral' : 'critical'}>
      <Icon className="size-3" aria-hidden="true" />
      {evaluation.label}
    </Badge>
  )
}
