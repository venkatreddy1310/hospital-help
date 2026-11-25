import type { AvailabilityStatus } from '../types/domain'

export const availabilityMeta: Record<
  AvailabilityStatus,
  { label: string; shortLabel: string }
> = {
  available: { label: 'Beds available', shortLabel: 'Available' },
  limited: { label: 'Limited beds', shortLabel: 'Limited' },
  full: { label: 'At capacity', shortLabel: 'Full' },
}

export const availabilityToneClasses: Record<AvailabilityStatus, string> = {
  available: 'bg-brand-teal-soft text-brand-teal-dark',
  limited: 'bg-brand-warning-soft text-brand-warning',
  full: 'bg-brand-critical-soft text-brand-critical',
}

export const availabilityDotClasses: Record<AvailabilityStatus, string> = {
  available: 'bg-brand-teal',
  limited: 'bg-brand-warning',
  full: 'bg-brand-critical',
}
