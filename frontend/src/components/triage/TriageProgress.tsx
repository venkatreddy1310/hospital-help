import { StepProgress } from '../common/StepProgress'

interface TriageProgressProps {
  current: number
  steps: readonly string[]
}

export function TriageProgress({ current, steps }: TriageProgressProps) {
  return (
    <StepProgress
      current={current}
      steps={steps}
      ariaLabel="Assessment progress"
    />
  )
}
