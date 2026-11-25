import { ArrowRight, Building2, Siren, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DemoNotice } from '../components/common/DemoNotice'
import { PageHeader } from '../components/common/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

const pillars = [
  {
    icon: Building2,
    title: 'Hospital discovery',
    description: 'Compare nearby hospitals and their simulated bed availability.',
  },
  {
    icon: Siren,
    title: 'Care guidance',
    description: 'A future AI-assisted triage flow for choosing the right care setting.',
  },
  {
    icon: Stethoscope,
    title: 'Specialist directory',
    description: 'Browse simulated consultants by specialty and hospital.',
  },
]

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="About"
        title="MediPulse"
        description="A mobile-first emergency care navigator built for clarity when every minute counts."
        actions={<Badge tone="teal">Preview build</Badge>}
      />

      <Card className="bg-white">
        <h2 className="text-lg font-bold tracking-tight text-brand-navy">
          Care, closer when it matters.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-navy-soft">
          MediPulse helps people find emergency-ready hospitals, check simulated bed
          availability, and locate specialists in Hyderabad. The AI triage experience is
          introduced in a later milestone; this preview focuses on a clear, fast way to
          navigate care options.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-xl bg-brand-surface p-3.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-white text-brand-blue shadow-sm">
                <pillar.icon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="mt-2.5 text-xs font-semibold text-brand-navy">{pillar.title}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-brand-navy-soft">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <DemoNotice className="mt-4">
        Every hospital, bed count, specialist, and appointment slot in this preview is
        simulated demo data and does not describe a real facility.
      </DemoNotice>

      <Card className="mt-4 bg-white">
        <h2 className="text-sm font-semibold text-brand-navy">Safety first</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-brand-navy-soft">
          MediPulse does not diagnose conditions, prescribe treatment, or replace professional
          medical care. In a life-threatening emergency, contact emergency services
          immediately.
        </p>
        <Link
          to="/emergency"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
        >
          Emergency information
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </Card>

      <p className="mt-4 text-xs text-brand-navy-soft/70">MediPulse 2.0 · Foundation preview</p>
    </div>
  )
}
