import type { FacilityKey, Hospital } from '../types/domain'

export const facilityMeta: Record<FacilityKey, { label: string; description: string }> = {
  icu: { label: 'ICU', description: 'Intensive care unit' },
  ambulance: { label: 'Ambulance', description: 'Emergency transport' },
  diagnostics: { label: 'Diagnostics', description: 'Imaging and lab tests' },
  pharmacy: { label: 'Pharmacy', description: 'On-site medicines' },
  bloodBank: { label: 'Blood bank', description: 'Blood availability support' },
}

/** Emergency-related facilities available in the simulated hospital record. */
export function getEmergencyFacilities(hospital: Hospital): string[] {
  const facilities: string[] = []

  if (hospital.emergency) facilities.push('24/7 emergency dept.')
  if (hospital.facilities.includes('ambulance')) facilities.push('Ambulance service')
  if (hospital.facilities.includes('icu')) facilities.push('ICU')

  return facilities
}
