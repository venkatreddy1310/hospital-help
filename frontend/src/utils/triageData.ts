import type { Specialty } from '../types/domain'
import type {
  AgeGroupId,
  DurationId,
  EmergencySignOption,
  SeverityId,
  SymptomId,
  TriageOption,
  TrendId,
} from '../types/triage'

export const symptomOptions: Array<TriageOption<SymptomId>> = [
  { id: 'fever', label: 'Fever' },
  { id: 'headache', label: 'Headache' },
  { id: 'cough', label: 'Cough' },
  { id: 'breathing', label: 'Breathing difficulty' },
  { id: 'chest', label: 'Chest discomfort' },
  { id: 'stomach', label: 'Stomach pain' },
  { id: 'vomiting', label: 'Vomiting' },
  { id: 'dizziness', label: 'Dizziness' },
  { id: 'injury', label: 'Injury' },
  { id: 'other', label: 'Other' },
]

export const durationOptions: Array<TriageOption<DurationId>> = [
  { id: 'today', label: 'Started today' },
  { id: '1-2-days', label: '1–2 days' },
  { id: '3-7-days', label: '3–7 days' },
  { id: 'more-than-week', label: 'More than a week' },
]

export const severityOptions: Array<TriageOption<SeverityId> & { description: string }> = [
  {
    id: 'mild',
    label: 'Mild',
    description: 'Noticeable, but daily activities are manageable.',
  },
  {
    id: 'moderate',
    label: 'Moderate',
    description: 'Interfering with work, sleep, or daily activities.',
  },
  {
    id: 'severe',
    label: 'Severe',
    description: 'Very hard to manage, or quickly getting worse.',
  },
]

export const ageGroupOptions: Array<TriageOption<AgeGroupId>> = [
  { id: 'under-5', label: 'Under 5' },
  { id: '5-17', label: '5–17' },
  { id: '18-39', label: '18–39' },
  { id: '40-64', label: '40–64' },
  { id: '65-plus', label: '65+' },
]

export const trendOptions: Array<TriageOption<TrendId>> = [
  { id: 'better', label: 'Getting better' },
  { id: 'same', label: 'Staying about the same' },
  { id: 'worse', label: 'Getting worse' },
]

export const emergencySignOptions: EmergencySignOption[] = [
  {
    id: 'severe-breathing',
    label: 'Severe difficulty breathing',
    description: 'Struggling to breathe, gasping, or unable to speak in full sentences.',
  },
  {
    id: 'severe-chest',
    label: 'Severe or persistent chest pain',
    description: 'Chest pressure, tightness, or pain that is severe or ongoing.',
  },
  {
    id: 'unconscious',
    label: 'Unconsciousness or inability to wake',
    description: 'Fainting, or someone who cannot be roused.',
  },
  {
    id: 'severe-bleeding',
    label: 'Severe bleeding',
    description: 'Heavy bleeding, or bleeding that will not stop.',
  },
  {
    id: 'stroke-signs',
    label: 'Sudden facial drooping, weakness, or difficulty speaking',
    description: 'A sudden change in the face, arm, or speech.',
  },
  {
    id: 'seizures',
    label: 'Seizures',
    description: 'A seizure happening now, or a first-time seizure.',
  },
]

export const symptomSpecialties: Record<SymptomId, Specialty[]> = {
  fever: ['General Medicine'],
  headache: ['General Medicine', 'Neurology'],
  cough: ['General Medicine'],
  breathing: ['General Medicine'],
  chest: ['Cardiology', 'General Medicine'],
  stomach: ['General Medicine'],
  vomiting: ['General Medicine'],
  dizziness: ['General Medicine'],
  injury: ['Orthopaedics'],
  other: ['General Medicine'],
}

export function getOptionLabel<T extends string>(
  options: ReadonlyArray<TriageOption<T>>,
  id: T,
): string {
  return options.find((option) => option.id === id)?.label ?? id
}
