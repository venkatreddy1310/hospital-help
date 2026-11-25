import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  ScrollText,
  Settings2,
  ShieldCheck,
  Stethoscope,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

export interface AdminNavItem {
  to: string
  label: string
  shortLabel: string
  icon: LucideIcon
  end?: boolean
}

export const adminNavItems: AdminNavItem[] = [
  {
    to: '/admin',
    label: 'Overview',
    shortLabel: 'Overview',
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: '/admin/hospitals',
    label: 'Hospitals',
    shortLabel: 'Hospitals',
    icon: Building2,
  },
  {
    to: '/admin/doctors',
    label: 'Doctors',
    shortLabel: 'Doctors',
    icon: Stethoscope,
  },
  {
    to: '/admin/appointments',
    label: 'Appointments',
    shortLabel: 'Appointments',
    icon: CalendarDays,
  },
  {
    to: '/admin/patients',
    label: 'Patients & families',
    shortLabel: 'Patients',
    icon: UsersRound,
  },
  {
    to: '/admin/insurance',
    label: 'Insurance providers',
    shortLabel: 'Insurance',
    icon: ShieldCheck,
  },
  {
    to: '/admin/activity',
    label: 'Activity log',
    shortLabel: 'Activity',
    icon: ScrollText,
  },
  {
    to: '/admin/settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: Settings2,
  },
]
