import type {
  BloodGroup,
  CareProfile,
  Gender,
  PatientDetails,
} from '../types/account'
import type { PatientProfile } from '../types/appointment'

export const genderOptions: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

export const genderLabels: Record<Gender, string> = {
  female: 'Female',
  male: 'Male',
  'non-binary': 'Non-binary',
  'prefer-not-to-say': 'Prefer not to say',
}

export const bloodGroupOptions: BloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'Unknown',
]

export interface ProfileFormValues {
  fullName: string
  dateOfBirth: string
  gender: Gender | ''
  phone: string
  bloodGroup: BloodGroup | ''
  addressLine: string
  city: string
  emergencyContactName: string
  emergencyContactPhone: string
  allergies: string
  medicalConditions: string
}

export type ProfileFieldErrors = Partial<Record<keyof ProfileFormValues, string>>

export const emptyProfileForm: ProfileFormValues = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  bloodGroup: '',
  addressLine: '',
  city: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  allergies: '',
  medicalConditions: '',
}

export function profileToForm(profile: PatientDetails): ProfileFormValues {
  return {
    fullName: profile.fullName,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    phone: profile.phone,
    bloodGroup: profile.bloodGroup,
    addressLine: profile.addressLine,
    city: profile.city,
    emergencyContactName: profile.emergencyContactName,
    emergencyContactPhone: profile.emergencyContactPhone,
    allergies: profile.allergies.join(', '),
    medicalConditions: profile.medicalConditions.join(', '),
  }
}

export function splitMedicalList(value: string): string[] {
  return [...new Set(
    value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean),
  )].slice(0, 20)
}

function normalizePhone(value: string): string {
  return value.replace(/[^\d+]/g, '')
}

export function isValidDateISO(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

function getTodayISO(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function calculateAge(dateOfBirth: string): number | null {
  if (!isValidDateISO(dateOfBirth)) return null

  const birth = new Date(`${dateOfBirth}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  return age
}

export function validateProfileForm(
  values: ProfileFormValues,
  kind: 'self' | 'family',
): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {}
  const name = values.fullName.trim()

  if (name.length < 2) {
    errors.fullName = 'Enter the patient’s full name.'
  } else if (name.length > 80) {
    errors.fullName = 'Use 80 characters or fewer.'
  }

  if (!values.dateOfBirth) {
    errors.dateOfBirth = 'Date of birth is required.'
  } else if (!isValidDateISO(values.dateOfBirth)) {
    errors.dateOfBirth = 'Enter a valid date.'
  } else if (values.dateOfBirth > getTodayISO()) {
    errors.dateOfBirth = 'Date of birth cannot be in the future.'
  } else {
    const age = calculateAge(values.dateOfBirth)
    if (age === null || age > 120) {
      errors.dateOfBirth = 'Enter a date of birth from the last 120 years.'
    }
  }

  if (!values.gender) errors.gender = 'Select a gender option.'
  if (!values.bloodGroup) errors.bloodGroup = 'Select a blood group.'

  const phone = normalizePhone(values.phone)
  if (kind === 'self' && !phone) {
    errors.phone = 'Phone number is required.'
  } else if (phone && (phone.replace(/\D/g, '').length < 10 || phone.replace(/\D/g, '').length > 15)) {
    errors.phone = 'Use a phone number with 10–15 digits.'
  }

  if (kind === 'self') {
    if (values.addressLine.trim().length < 4) {
      errors.addressLine = 'Address is required.'
    } else if (values.addressLine.trim().length > 160) {
      errors.addressLine = 'Use 160 characters or fewer.'
    }

    if (values.city.trim().length < 2) {
      errors.city = 'City is required.'
    }
  } else {
    if (values.addressLine.trim().length > 160) {
      errors.addressLine = 'Use 160 characters or fewer.'
    }
    if (values.city.trim().length > 60) {
      errors.city = 'Use 60 characters or fewer.'
    }
  }

  const emergencyName = values.emergencyContactName.trim()
  const emergencyPhone = normalizePhone(values.emergencyContactPhone)

  if (kind === 'self' && !emergencyName) {
    errors.emergencyContactName = 'Emergency contact name is required.'
  }
  if (kind === 'self' && !emergencyPhone) {
    errors.emergencyContactPhone = 'Emergency contact phone is required.'
  }

  if (emergencyName.length > 80) {
    errors.emergencyContactName = 'Use 80 characters or fewer.'
  }
  if (
    emergencyPhone &&
    (emergencyPhone.replace(/\D/g, '').length < 10 ||
      emergencyPhone.replace(/\D/g, '').length > 15)
  ) {
    errors.emergencyContactPhone = 'Use a phone number with 10–15 digits.'
  }

  if (splitMedicalList(values.allergies).some((item) => item.length > 60)) {
    errors.allergies = 'Keep each allergy to 60 characters or fewer.'
  }
  if (splitMedicalList(values.medicalConditions).some((item) => item.length > 80)) {
    errors.medicalConditions = 'Keep each condition to 80 characters or fewer.'
  }

  return errors
}

export function formToPatientDetails(values: ProfileFormValues): PatientDetails {
  return {
    fullName: values.fullName.trim(),
    dateOfBirth: values.dateOfBirth,
    gender: values.gender as Gender,
    phone: values.phone.trim(),
    bloodGroup: values.bloodGroup as BloodGroup,
    addressLine: values.addressLine.trim(),
    city: values.city.trim(),
    emergencyContactName: values.emergencyContactName.trim(),
    emergencyContactPhone: values.emergencyContactPhone.trim(),
    allergies: splitMedicalList(values.allergies),
    medicalConditions: splitMedicalList(values.medicalConditions),
  }
}

export function getProfileInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function getCareProfileSummary(profile: CareProfile): string {
  const age = calculateAge(profile.dateOfBirth)
  const parts = [
    profile.kind === 'self' ? 'Self' : profile.relationship,
    age === null ? null : `${age} yrs`,
    profile.bloodGroup === 'Unknown' ? null : profile.bloodGroup,
  ].filter((part): part is string => Boolean(part))

  return parts.join(' · ')
}

export function careProfileToPatientProfile(profile: CareProfile): PatientProfile {
  return {
    id: profile.id,
    name: profile.fullName,
    relationship: profile.kind === 'self' ? 'Self' : profile.relationship,
    summary: getCareProfileSummary(profile),
    isDefault: profile.kind === 'self',
  }
}

export function formatPolicyStatus(status: 'active' | 'inactive'): string {
  return status === 'active' ? 'Active' : 'Inactive'
}

export function formatInsuranceAmount(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}
