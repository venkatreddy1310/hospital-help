import { HeartPulse, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import markUrl from '../../assets/medipulse-mark.svg'
import { useAuth } from '../../context/authStore'
import { DemoNotice } from '../common/DemoNotice'

interface AuthShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

const highlights = [
  {
    icon: UsersRound,
    title: 'Family care profiles',
    description: 'Keep simulated patient details organised for the people you book for.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    description: 'Profiles, policies, and appointments are scoped to your own account.',
  },
  {
    icon: HeartPulse,
    title: 'Demo-safe records',
    description: 'Every hospital, clinician, and policy detail is fictional sample data.',
  },
]

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  const { isDemoMode } = useAuth()

  return (
    <div className="mx-auto max-w-5xl">
      <div className="overflow-hidden rounded-3xl border border-brand-line bg-white shadow-sm lg:grid lg:grid-cols-[0.92fr_1.08fr]">
        <div className="relative overflow-hidden bg-brand-navy px-6 py-7 text-white sm:px-8 lg:flex lg:flex-col lg:justify-between lg:px-9 lg:py-10">
          <div
            className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-brand-teal/15 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-16 size-56 rounded-full bg-brand-blue/35 blur-2xl"
            aria-hidden="true"
          />
          <div className="relative">
            <Link
              to="/"
              aria-label="MediPulse home"
              className="inline-flex items-center gap-2.5"
            >
              <img src={markUrl} alt="" className="size-9 rounded-xl" />
              <span className="text-lg font-bold tracking-tight">MediPulse</span>
            </Link>
            <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase">
              <LockKeyhole className="size-3" aria-hidden="true" />
              Patient account
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              Care details for you and your family, in one place.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              A simulated MediPulse account for demo bookings, family profiles, and
              user-entered insurance records.
            </p>
          </div>

          <ul className="relative mt-7 hidden space-y-4 lg:block">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-teal-soft">
                  <item.icon className="size-4.5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/60">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <p className="relative mt-6 text-[10px] leading-relaxed text-white/45">
            Not for emergencies. MediPulse is a fictional preview and does not provide
            medical advice.
          </p>
        </div>

        <div className="px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          <p className="text-[10px] font-semibold tracking-[0.16em] text-brand-teal-dark uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-brand-navy">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-navy-soft">
            {description}
          </p>

          {isDemoMode ? (
            <DemoNotice className="mt-5">
              Supabase credentials are not configured in this build. Authentication is
              simulated locally, passwords are never stored, and judge-friendly demo
              access remains available.
            </DemoNotice>
          ) : null}

          <div className="mt-6">{children}</div>
          {footer ? (
            <div className="mt-6 border-t border-brand-line pt-4 text-xs text-brand-navy-soft">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
