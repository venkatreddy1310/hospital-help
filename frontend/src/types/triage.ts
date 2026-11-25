import type { Specialty } from './domain'

export type SymptomId =
  | 'fever'
  | 'headache'
  | 'cough'
  | 'breathing'
  | 'chest'
  | 'stomach'
  | 'vomiting'
  | 'dizziness'
  | 'injury'
  | 'other'

export type DurationId = 'today' | '1-2-days' | '3-7-days' | 'more-than-week'

export type SeverityId = 'mild' | 'moderate' | 'severe'

export type AgeGroupId = 'under-5' | '5-17' | '18-39' | '40-64' | '65-plus'

export type TrendId = 'better' | 'same' | 'worse'

export type EmergencySignId =
  | 'severe-breathing'
  | 'severe-chest'
  | 'unconscious'
  | 'severe-bleeding'
  | 'stroke-signs'
  | 'seizures'

export type TriageUrgency = 'emergency' | 'urgent' | 'routine' | 'self-care'

export interface TriageOption<T extends string> {
  id: T
  label: string
  description?: string
}

export interface EmergencySignOption extends TriageOption<EmergencySignId> {
  description: string
}

export interface TriageAnswers {
  symptoms: SymptomId[]
  duration: DurationId | null
  severity: SeverityId | null
  ageGroup: AgeGroupId | null
  trend: TrendId | null
  context: string
  emergencySigns: EmergencySignId[]
}

export interface TriageAssessment {
  urgency: TriageUrgency
  explanation: string
  nextStep: string
  reasons: string[]
  recommendedSpecialties: Specialty[]
}
