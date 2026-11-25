import type {
  ConsultationType,
  Specialty,
  Specialist,
  SpecialistAvailabilityDay,
} from '../types/domain'
import { addDaysISO, formatRelativeDate, formatTimeSlot, getTodayISO } from './dateTime'
import { demoHospitals } from './demoData'

const SLOT_TEMPLATES = [
  ['09:00', '10:30', '12:00', '15:00', '17:30'],
  ['08:30', '11:00', '14:00', '16:30'],
  ['10:00', '12:30', '15:30', '18:00'],
  ['09:30', '11:30', '13:30', '17:00'],
]

interface DoctorSeed {
  id: string
  name: string
  specialty: Specialty
  experienceYears: number
  qualifications: string[]
  bio: string
  languages: string[]
  consultationFee: number
  consultationTypes: ConsultationType[]
  hospitalIds: string[]
  availabilitySeed: number
}

const doctorSeeds: DoctorSeed[] = [
  {
    id: 'dr-ananya-rao',
    name: 'Dr. Ananya Rao',
    specialty: 'Cardiology',
    experienceYears: 14,
    qualifications: ['MBBS', 'MD (General Medicine)', 'DM (Cardiology)'],
    bio: 'Preventive heart care and long-term follow-up for adults. Explains tests and next steps in plain language.',
    languages: ['English', 'Hindi', 'Telugu'],
    consultationFee: 900,
    consultationTypes: ['in-person', 'online'],
    hospitalIds: ['apollo-jubilee-hills', 'care-banjara-hills'],
    availabilitySeed: 1,
  },
  {
    id: 'dr-vikram-reddy',
    name: 'Dr. Vikram Reddy',
    specialty: 'Neurology',
    experienceYears: 11,
    qualifications: ['MBBS', 'MD (General Medicine)', 'DM (Neurology)'],
    bio: 'Neurology care with a focus on headache and movement-related concerns. Values clear explanations and shared decision-making.',
    languages: ['English', 'Telugu', 'Hindi'],
    consultationFee: 1000,
    consultationTypes: ['in-person', 'online'],
    hospitalIds: ['kims-secunderabad', 'continental-gachibowli'],
    availabilitySeed: 0,
  },
  {
    id: 'dr-meera-iyer',
    name: 'Dr. Meera Iyer',
    specialty: 'Paediatrics',
    experienceYears: 9,
    qualifications: ['MBBS', 'DNB (Paediatrics)'],
    bio: 'Child-friendly consultations with a calm, parent-inclusive approach. Focused on developmental and preventive paediatric care.',
    languages: ['English', 'Tamil', 'Telugu'],
    consultationFee: 700,
    consultationTypes: ['in-person'],
    hospitalIds: ['rainbow-banjara-hills', 'care-banjara-hills'],
    availabilitySeed: 2,
  },
  {
    id: 'dr-arjun-menon',
    name: 'Dr. Arjun Menon',
    specialty: 'Orthopaedics',
    experienceYears: 16,
    qualifications: ['MBBS', 'MS (Orthopaedics)'],
    bio: 'Orthopaedic assessment and rehabilitation planning. Works with patients to set practical recovery goals.',
    languages: ['English', 'Malayalam', 'Hindi'],
    consultationFee: 1100,
    consultationTypes: ['in-person'],
    hospitalIds: ['continental-gachibowli', 'apollo-jubilee-hills'],
    availabilitySeed: 0,
  },
  {
    id: 'dr-sneha-kulkarni',
    name: 'Dr. Sneha Kulkarni',
    specialty: 'Dermatology',
    experienceYears: 7,
    qualifications: ['MBBS', 'MD (Dermatology)'],
    bio: 'General and cosmetic skin concerns with a focus on long-term skin health. Enjoys clear, practical skincare education.',
    languages: ['English', 'Hindi', 'Marathi'],
    consultationFee: 650,
    consultationTypes: ['in-person', 'online'],
    hospitalIds: ['care-banjara-hills', 'apollo-jubilee-hills'],
    availabilitySeed: 3,
  },
  {
    id: 'dr-rohan-gupta',
    name: 'Dr. Rohan Gupta',
    specialty: 'General Medicine',
    experienceYears: 12,
    qualifications: ['MBBS', 'MD (General Medicine)'],
    bio: 'Broad adult medicine with an emphasis on preventive care and chronic condition follow-up.',
    languages: ['English', 'Hindi'],
    consultationFee: 500,
    consultationTypes: ['in-person', 'online'],
    hospitalIds: ['osmania-afzal-gunj', 'care-banjara-hills'],
    availabilitySeed: 1,
  },
  {
    id: 'dr-kavya-nair',
    name: 'Dr. Kavya Nair',
    specialty: 'Gynaecology',
    experienceYears: 10,
    qualifications: ['MBBS', 'MS (Obstetrics & Gynaecology)'],
    bio: "Women's health across life stages, with a calm and privacy-focused consultation style.",
    languages: ['English', 'Malayalam', 'Hindi'],
    consultationFee: 850,
    consultationTypes: ['in-person', 'online'],
    hospitalIds: ['rainbow-banjara-hills', 'apollo-jubilee-hills'],
    availabilitySeed: 2,
  },
  {
    id: 'dr-aditya-sharma',
    name: 'Dr. Aditya Sharma',
    specialty: 'ENT',
    experienceYears: 8,
    qualifications: ['MBBS', 'MS (ENT)'],
    bio: 'Ear, nose, and throat care for adults and children, with a focus on clear communication.',
    languages: ['English', 'Hindi'],
    consultationFee: 600,
    consultationTypes: ['in-person'],
    hospitalIds: ['kims-secunderabad', 'osmania-afzal-gunj'],
    availabilitySeed: 0,
  },
  {
    id: 'dr-isha-verma',
    name: 'Dr. Isha Verma',
    specialty: 'Cardiology',
    experienceYears: 9,
    qualifications: ['MBBS', 'MD (General Medicine)', 'DM (Cardiology)'],
    bio: 'Heart health for adults with a special interest in prevention and lifestyle-focused follow-up.',
    languages: ['English', 'Hindi'],
    consultationFee: 800,
    consultationTypes: ['in-person', 'online'],
    hospitalIds: ['continental-gachibowli'],
    availabilitySeed: 4,
  },
  {
    id: 'dr-karan-malhotra',
    name: 'Dr. Karan Malhotra',
    specialty: 'Neurology',
    experienceYears: 13,
    qualifications: ['MBBS', 'MD (General Medicine)', 'DM (Neurology)'],
    bio: 'Neurology consultations centred on clear explanations and coordinated long-term care.',
    languages: ['English', 'Hindi', 'Punjabi'],
    consultationFee: 950,
    consultationTypes: ['in-person', 'online'],
    hospitalIds: ['apollo-jubilee-hills', 'kims-secunderabad'],
    availabilitySeed: 5,
  },
  {
    id: 'dr-priya-raghavan',
    name: 'Dr. Priya Raghavan',
    specialty: 'Paediatrics',
    experienceYears: 6,
    qualifications: ['MBBS', 'DNB (Paediatrics)'],
    bio: 'Paediatric care with a warm, family-centred style and a focus on early prevention.',
    languages: ['English', 'Tamil'],
    consultationFee: 600,
    consultationTypes: ['in-person', 'online'],
    hospitalIds: ['rainbow-banjara-hills', 'care-banjara-hills'],
    availabilitySeed: 6,
  },
  {
    id: 'dr-nikhil-joshi',
    name: 'Dr. Nikhil Joshi',
    specialty: 'Orthopaedics',
    experienceYears: 7,
    qualifications: ['MBBS', 'MS (Orthopaedics)'],
    bio: 'Bone, joint, and sports-related assessment with practical rehabilitation guidance.',
    languages: ['English', 'Hindi', 'Marathi'],
    consultationFee: 700,
    consultationTypes: ['in-person'],
    hospitalIds: ['osmania-afzal-gunj', 'kims-secunderabad'],
    availabilitySeed: 3,
  },
  {
    id: 'dr-tara-bansal',
    name: 'Dr. Tara Bansal',
    specialty: 'Dermatology',
    experienceYears: 12,
    qualifications: ['MBBS', 'MD (Dermatology)'],
    bio: 'Skin, hair, and nail concerns with a focus on realistic, evidence-aligned care.',
    languages: ['English', 'Hindi'],
    consultationFee: 750,
    consultationTypes: ['in-person', 'online'],
    hospitalIds: ['continental-gachibowli', 'care-banjara-hills'],
    availabilitySeed: 7,
  },
  {
    id: 'dr-sameer-khan',
    name: 'Dr. Sameer Khan',
    specialty: 'General Medicine',
    experienceYears: 15,
    qualifications: ['MBBS', 'MD (General Medicine)'],
    bio: 'Adult general medicine with a preventive focus and support for long-term conditions.',
    languages: ['English', 'Hindi', 'Urdu'],
    consultationFee: 550,
    consultationTypes: ['in-person', 'online'],
    hospitalIds: ['apollo-jubilee-hills', 'continental-gachibowli'],
    availabilitySeed: 1,
  },
  {
    id: 'dr-neha-reddy',
    name: 'Dr. Neha Reddy',
    specialty: 'Gynaecology',
    experienceYears: 8,
    qualifications: ['MBBS', 'MS (Obstetrics & Gynaecology)'],
    bio: "Women's health consultations with an emphasis on comfort, privacy, and informed choice.",
    languages: ['English', 'Telugu', 'Hindi'],
    consultationFee: 800,
    consultationTypes: ['in-person'],
    hospitalIds: ['rainbow-banjara-hills', 'kims-secunderabad'],
    availabilitySeed: 2,
  },
  {
    id: 'dr-rakesh-iyer',
    name: 'Dr. Rakesh Iyer',
    specialty: 'ENT',
    experienceYears: 14,
    qualifications: ['MBBS', 'MS (ENT)'],
    bio: 'ENT care with a focus on practical symptom management and follow-up.',
    languages: ['English', 'Tamil', 'Telugu'],
    consultationFee: 700,
    consultationTypes: ['in-person', 'online'],
    hospitalIds: ['care-banjara-hills', 'kims-secunderabad'],
    availabilitySeed: 5,
  },
]

function buildAvailability(seed: number): SpecialistAvailabilityDay[] {
  const today = getTodayISO()

  return Array.from({ length: 5 }, (_, dayIndex) => {
    const isDayOff = (seed + dayIndex) % 4 === 0
    const slots = isDayOff ? [] : SLOT_TEMPLATES[(seed + dayIndex) % SLOT_TEMPLATES.length]

    return {
      date: addDaysISO(today, dayIndex),
      slots: [...slots],
    }
  })
}

function createSpecialist(seed: DoctorSeed): Specialist {
  const primaryHospital = demoHospitals.find(
    (hospital) => hospital.id === seed.hospitalIds[0],
  )!

  const availability = buildAvailability(seed.availabilitySeed)
  const firstOpenDay = availability.find((day) => day.slots.length > 0)
  const firstSlot = firstOpenDay?.slots[0]

  return {
    ...seed,
    hospital: primaryHospital.name,
    area: primaryHospital.area,
    distanceKm: primaryHospital.distanceKm,
    availableToday: availability[0].slots.length > 0,
    nextAvailable:
      firstOpenDay && firstSlot
        ? `${formatRelativeDate(firstOpenDay.date)} · ${formatTimeSlot(firstSlot)}`
        : 'No demo slots in the next 5 days',
    availability,
    active: true,
  }
}

export const demoSpecialists: Specialist[] = doctorSeeds.map(createSpecialist)
