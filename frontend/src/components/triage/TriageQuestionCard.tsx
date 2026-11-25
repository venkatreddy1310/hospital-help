import type { ReactNode } from 'react'
import { FlowStepCard } from '../common/FlowStepCard'

interface TriageQuestionCardProps {
  title: string
  description: string
  error?: string | null
  continueLabel?: string
  backLabel?: string
  onBack: () => void
  onContinue: () => void
  children: ReactNode
}

export function TriageQuestionCard({
  title,
  description,
  error,
  continueLabel = 'Continue',
  backLabel = 'Back',
  onBack,
  onContinue,
  children,
}: TriageQuestionCardProps) {
  return (
    <FlowStepCard
      eyebrow="Guided assessment"
      title={title}
      description={description}
      error={error}
      backLabel={backLabel}
      primaryLabel={continueLabel}
      onBack={onBack}
      onPrimary={onContinue}
    >
      {children}
    </FlowStepCard>
  )
}
