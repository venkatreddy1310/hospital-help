import { Badge } from '../ui/Badge'
import { claimStatusOptions, type ClaimStatus } from '../../types/claims'

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const label = claimStatusOptions.find((option) => option.value === status)?.label ?? status
  const tone = status === 'rejected-simulated' ? 'critical' : status === 'not-started' || status === 'documents-pending' ? 'neutral' : 'teal'

  return <Badge tone={tone}>{label}</Badge>
}
