import type { AdminActivityEntry, DemoPatientAccount } from '../types/admin'
import type { CoverageCategory, InsuranceProvider } from '../types/insurance'

export const coverageCategoryOptions: CoverageCategory[] = [
  'general-hospitalization',
  'emergency',
  'icu',
  'surgery',
  'diagnostics',
]

export const coverageCategoryMeta: Record<
  CoverageCategory,
  { label: string; description: string }
> = {
  'general-hospitalization': {
    label: 'General hospitalization',
    description: 'Simulated room and inpatient stay coverage.',
  },
  emergency: {
    label: 'Emergency treatment',
    description: 'Simulated emergency department coverage.',
  },
  icu: {
    label: 'ICU',
    description: 'Simulated intensive care coverage.',
  },
  surgery: {
    label: 'Surgery',
    description: 'Simulated surgical procedure coverage.',
  },
  diagnostics: {
    label: 'Diagnostics',
    description: 'Simulated scans and laboratory coverage.',
  },
}

const seedTimestamp = new Date().toISOString()

export const demoInsuranceProviders: InsuranceProvider[] = [
  {
    id: 'insurance-aarogya',
    name: 'Aarogya Shield',
    planName: 'Essential Care 5L · demo plan',
    active: true,
    coverage: [
      'general-hospitalization',
      'emergency',
      'icu',
      'surgery',
      'diagnostics',
    ],
    rules: {
      'general-hospitalization': {
        coPayPercent: 10,
        deductible: 5000,
        perClaimLimit: 250000,
        waitingPeriodDays: 30,
        excluded: false,
        notes: 'Configured demo inpatient rule; not a real policy benefit.',
      },
      emergency: {
        coPayPercent: 0,
        deductible: 0,
        perClaimLimit: 100000,
        waitingPeriodDays: 0,
        excluded: false,
        notes: 'Emergency care must never be delayed for insurance checks.',
      },
      icu: {
        coPayPercent: 10,
        deductible: 5000,
        perClaimLimit: 150000,
        waitingPeriodDays: 30,
        excluded: false,
        notes: 'Illustrative ICU sub-limit.',
      },
      surgery: {
        coPayPercent: 10,
        deductible: 5000,
        perClaimLimit: 200000,
        waitingPeriodDays: 60,
        excluded: false,
        notes: 'Illustrative surgery waiting period and limit.',
      },
      diagnostics: {
        coPayPercent: 0,
        deductible: 0,
        perClaimLimit: 0,
        waitingPeriodDays: 0,
        excluded: true,
        notes: 'Configured demo exclusion for this diagnostics scenario.',
      },
    },
    hospitalIds: [
      'apollo-jubilee-hills',
      'care-banjara-hills',
      'kims-secunderabad',
      'citycare-gachibowli',
      'novamed-madhapur',
      'meditrust-miyapur',
      'heritage-mehdipatnam',
      'cantonment-secunderabad',
      'northpoint-kompally',
      'northstar-kompally',
      'horizon-gandimaisamma',
      'riverstone-dulapally',
      'stonebridge-medchal',
      'aerovista-dundigal',
    ],
    updatedAt: seedTimestamp,
  },
  {
    id: 'insurance-novacare',
    name: 'NovaCare Simulated Cover',
    planName: 'Family Plus 10L · demo plan',
    active: true,
    coverage: ['general-hospitalization', 'emergency', 'icu', 'diagnostics'],
    rules: {
      'general-hospitalization': {
        coPayPercent: 20,
        deductible: 10000,
        perClaimLimit: 400000,
        waitingPeriodDays: 30,
        excluded: false,
        notes: 'Configured family-plan demo rule.',
      },
      emergency: {
        coPayPercent: 0,
        deductible: 0,
        perClaimLimit: 150000,
        waitingPeriodDays: 0,
        excluded: false,
        notes: 'No demo waiting period for emergency treatment.',
      },
      icu: {
        coPayPercent: 20,
        deductible: 10000,
        perClaimLimit: 200000,
        waitingPeriodDays: 30,
        excluded: false,
        notes: 'Illustrative ICU co-pay and sub-limit.',
      },
      diagnostics: {
        coPayPercent: 20,
        deductible: 2000,
        perClaimLimit: 50000,
        waitingPeriodDays: 0,
        excluded: false,
        notes: 'Illustrative diagnostics limit.',
      },
    },
    hospitalIds: [
      'rainbow-banjara-hills',
      'continental-gachibowli',
      'lifespring-kondapur',
      'aurora-begumpet',
      'lakeside-lb-nagar',
      'willowbrook-manikonda',
      'silveroak-kompally',
      'lotusvalley-gandimaisamma',
      'serene-dulapally',
      'vista-suchitra',
      'qube-quthbullapur',
      'maplewood-bowenpally',
    ],
    updatedAt: seedTimestamp,
  },
  {
    id: 'insurance-sahayak',
    name: 'Sahayak Health Demo',
    planName: 'Public scheme preview · demo plan',
    active: false,
    coverage: ['general-hospitalization', 'emergency', 'diagnostics'],
    rules: {
      'general-hospitalization': {
        coPayPercent: 0,
        deductible: 0,
        perClaimLimit: 150000,
        waitingPeriodDays: 0,
        excluded: false,
        notes: 'Inactive demo scheme rule retained for admin preview.',
      },
      emergency: {
        coPayPercent: 0,
        deductible: 0,
        perClaimLimit: 75000,
        waitingPeriodDays: 0,
        excluded: false,
        notes: 'Inactive demo scheme rule retained for admin preview.',
      },
      diagnostics: {
        coPayPercent: 0,
        deductible: 0,
        perClaimLimit: 25000,
        waitingPeriodDays: 0,
        excluded: false,
        notes: 'Inactive demo scheme rule retained for admin preview.',
      },
    },
    hospitalIds: [
      'osmania-afzal-gunj',
      'kims-secunderabad',
      'sanjeevani-kukatpally',
      'sunrise-uppal',
      'primecare-dilsukhnagar',
      'vidyagiri-gandimaisamma',
      'olivebranch-dulapally',
      'falconcrest-bahadurpally',
    ],
    updatedAt: seedTimestamp,
  },
  {
    id: 'insurance-bluelotus',
    name: 'BlueLotus Demo Cover',
    planName: 'Surgical Advantage · demo plan',
    active: true,
    coverage: ['surgery', 'icu', 'general-hospitalization'],
    rules: {
      surgery: {
        coPayPercent: 15,
        deductible: 15000,
        perClaimLimit: 350000,
        waitingPeriodDays: 90,
        excluded: false,
        notes: 'Illustrative surgical waiting period and sub-limit.',
      },
      icu: {
        coPayPercent: 20,
        deductible: 10000,
        perClaimLimit: 150000,
        waitingPeriodDays: 30,
        excluded: false,
        notes: 'Illustrative ICU co-pay and sub-limit.',
      },
      'general-hospitalization': {
        coPayPercent: 20,
        deductible: 10000,
        perClaimLimit: 250000,
        waitingPeriodDays: 30,
        excluded: false,
        notes: 'Illustrative general hospitalization rule.',
      },
    },
    hospitalIds: [
      'continental-gachibowli',
      'rainbow-banjara-hills',
      'sterling-jubilee-hills',
      'citycare-gachibowli',
      'greenleaf-tarnaka',
      'meridian-kompally',
      'compass-kompally',
      'bluebell-dulapally',
      'induspark-jeedimetla',
    ],
    updatedAt: seedTimestamp,
  },
]

export const demoPatientAccounts: DemoPatientAccount[] = [
  {
    id: 'account-demo',
    primaryName: 'Demo Patient',
    area: 'Jubilee Hills',
    memberSince: '2025-08-14',
    members: [
      {
        id: 'demo-patient',
        name: 'Demo Patient',
        relationship: 'Self',
        ageBand: '30–44',
        insuranceProviderId: 'insurance-aarogya',
      },
      {
        id: 'family-meera-sharma',
        name: 'Meera Sharma',
        relationship: 'Spouse',
        ageBand: '30–44',
        insuranceProviderId: 'insurance-aarogya',
      },
      {
        id: 'family-aarav-sharma',
        name: 'Aarav Sharma',
        relationship: 'Child',
        ageBand: '5–12',
        insuranceProviderId: 'insurance-aarogya',
      },
    ],
  },
  {
    id: 'account-kavya-rao',
    primaryName: 'Kavya Rao',
    area: 'Gachibowli',
    memberSince: '2025-11-02',
    members: [
      {
        id: 'patient-kavya-rao',
        name: 'Kavya Rao',
        relationship: 'Self',
        ageBand: '30–44',
        insuranceProviderId: 'insurance-novacare',
      },
      {
        id: 'family-lakshmi-rao',
        name: 'Lakshmi Rao',
        relationship: 'Parent',
        ageBand: '60+',
        insuranceProviderId: 'insurance-novacare',
      },
      {
        id: 'family-vihaan-rao',
        name: 'Vihaan Rao',
        relationship: 'Child',
        ageBand: '0–4',
        insuranceProviderId: 'insurance-novacare',
      },
    ],
  },
  {
    id: 'account-imran-khan',
    primaryName: 'Imran Khan',
    area: 'Secunderabad',
    memberSince: '2026-01-19',
    members: [
      {
        id: 'patient-imran-khan',
        name: 'Imran Khan',
        relationship: 'Self',
        ageBand: '45–59',
        insuranceProviderId: null,
      },
      {
        id: 'family-fatima-khan',
        name: 'Fatima Khan',
        relationship: 'Spouse',
        ageBand: '45–59',
        insuranceProviderId: null,
      },
      {
        id: 'family-zoya-khan',
        name: 'Zoya Khan',
        relationship: 'Child',
        ageBand: '13–17',
        insuranceProviderId: null,
      },
    ],
  },
  {
    id: 'account-anjali-pillai',
    primaryName: 'Anjali Pillai',
    area: 'Banjara Hills',
    memberSince: '2026-04-08',
    members: [
      {
        id: 'patient-anjali-pillai',
        name: 'Anjali Pillai',
        relationship: 'Self',
        ageBand: '18–29',
        insuranceProviderId: 'insurance-sahayak',
      },
      {
        id: 'family-ramesh-pillai',
        name: 'Ramesh Pillai',
        relationship: 'Parent',
        ageBand: '60+',
        insuranceProviderId: 'insurance-sahayak',
      },
    ],
  },
]

/** Seed activity entries, timestamped relative to when the demo catalog is created. */
export function createDemoActivityEntries(now = new Date()): AdminActivityEntry[] {
  const minutesAgo = (minutes: number) =>
    new Date(now.getTime() - minutes * 60_000).toISOString()

  return [
    {
      id: 'activity-seed-availability',
      area: 'hospital',
      title: 'Simulated availability refreshed',
      detail: 'Bed availability was refreshed across the demo hospital network.',
      timestamp: minutesAgo(18),
    },
    {
      id: 'activity-seed-doctors',
      area: 'doctor',
      title: 'Demo specialist schedules seeded',
      detail: 'Sixteen fictional doctor profiles were prepared with five-day demo slots.',
      timestamp: minutesAgo(94),
    },
    {
      id: 'activity-seed-insurance',
      area: 'insurance',
      title: 'Demo coverage preview configured',
      detail: 'Four fictional insurance providers were linked to simulated hospitals.',
      timestamp: minutesAgo(260),
    },
    {
      id: 'activity-seed-workspace',
      area: 'system',
      title: 'Admin demo workspace started',
      detail: 'The operations console opened in demo mode without authentication.',
      timestamp: minutesAgo(420),
    },
  ]
}
