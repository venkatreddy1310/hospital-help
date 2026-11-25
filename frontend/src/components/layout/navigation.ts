import {
  Bot,
  Building2,
  Calculator,
  CalendarDays,
  FileCheck2,
  FileText,
  House,
  Info,
  PhoneCall,
  ReceiptText,
  Settings2,
  ShieldCheck,
  Siren,
  Stethoscope,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export interface MoreNavItem extends NavItem {
  description: string
}

/** The four routed tabs; "More" is a sheet trigger in both navigation bars. */
export const primaryNav: NavItem[] = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/hospitals', label: 'Hospitals', icon: Building2 },
  { to: '/triage', label: 'Triage', icon: Siren },
  { to: '/specialists', label: 'Specialists', icon: Stethoscope },
]

export const moreNav: MoreNavItem[] = [
  {
    to: '/assistant',
    label: 'Health assistant',
    description: 'Safe health education and doctor prep',
    icon: Bot,
  },
  {
    to: '/appointments',
    label: 'My appointments',
    description: 'Upcoming and past demo bookings',
    icon: CalendarDays,
  },
  {
    to: '/account',
    label: 'Account & profiles',
    description: 'Personal details and active patient',
    icon: UserRound,
  },
  {
    to: '/family',
    label: 'Family profiles',
    description: 'Patients you can book for',
    icon: UsersRound,
  },
  {
    to: '/insurance',
    label: 'My Insurance',
    description: 'User-entered demo policies',
    icon: FileText,
  },
  {
    to: '/coverage-checker',
    label: 'Coverage Checker',
    description: 'Illustrative costs and configured limits',
    icon: Calculator,
  },
  {
    to: '/cashless-guidance',
    label: 'Cashless Guidance',
    description: 'Network check and pre-authorization',
    icon: FileCheck2,
  },
  {
    to: '/reimbursement-claims',
    label: 'Reimbursement Claims',
    description: 'Eight-item checklist and demo status',
    icon: ReceiptText,
  },
  {
    to: '/about',
    label: 'About MediPulse',
    description: 'Preview scope and demo data',
    icon: Info,
  },
  {
    to: '/emergency',
    label: 'Emergency information',
    description: '112 and 108 helplines',
    icon: PhoneCall,
  },
  {
    to: '/settings',
    label: 'Settings',
    description: 'Location and app preferences',
    icon: Settings2,
  },
  {
    to: '/admin',
    label: 'Admin dashboard',
    description: 'Hospital admin preview',
    icon: ShieldCheck,
  },
]

export const morePaths = moreNav.map((item) => item.to)
