import type { ConsultationType, Specialty } from '../types/domain'

export const specialtyOptions: Specialty[] = [
  'Cardiology',
  'Neurology',
  'Dermatology',
  'Orthopaedics',
  'Paediatrics',
  'Gynaecology',
  'General Medicine',
  'ENT',
]

export const specialtyMeta: Record<
  Specialty,
  { label: string; avatarClass: string }
> = {
  Cardiology: {
    label: 'Cardiologist',
    avatarClass: 'bg-brand-blue-soft text-brand-blue',
  },
  Neurology: {
    label: 'Neurologist',
    avatarClass: 'bg-brand-navy text-white',
  },
  Dermatology: {
    label: 'Dermatologist',
    avatarClass: 'bg-brand-teal-soft text-brand-teal-dark',
  },
  Orthopaedics: {
    label: 'Orthopedic',
    avatarClass: 'bg-brand-warning-soft text-brand-warning',
  },
  Paediatrics: {
    label: 'Pediatrician',
    avatarClass: 'bg-brand-blue-soft text-brand-blue',
  },
  Gynaecology: {
    label: 'Gynecologist',
    avatarClass: 'bg-brand-teal-soft text-brand-teal-dark',
  },
  'General Medicine': {
    label: 'General Physician',
    avatarClass: 'bg-brand-surface text-brand-navy',
  },
  ENT: {
    label: 'ENT',
    avatarClass: 'bg-brand-warning-soft text-brand-warning',
  },
}

export const consultationTypeMeta: Record<
  ConsultationType,
  { label: string; shortLabel: string; description: string }
> = {
  'in-person': {
    label: 'In-person consultation',
    shortLabel: 'In-person',
    description: 'Visit the demo hospital for a simulated consultation.',
  },
  online: {
    label: 'Online consultation (demo)',
    shortLabel: 'Online demo',
    description: 'A simulated video consultation. No real video call is placed.',
  },
}

export function getSpecialtyLabel(specialty: Specialty): string {
  return specialtyMeta[specialty].label
}

export function isSpecialty(value: string | null): value is Specialty {
  return value !== null && specialtyOptions.includes(value as Specialty)
}
