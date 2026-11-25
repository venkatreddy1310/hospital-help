import { ArrowRight, ArrowUpRight, PhoneCall } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DemoNotice } from '../components/common/DemoNotice'
import { PageHeader } from '../components/common/PageHeader'
import { Card } from '../components/ui/Card'

const waitingSteps = [
  'Call and stay on the line with the dispatcher.',
  'Share your exact location and describe what happened.',
  'Follow the dispatcher’s instructions until help arrives.',
  'Keep your phone nearby and make sure access is unlocked.',
]

export function EmergencyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Emergency"
        title="Emergency information"
        description="If someone is seriously ill or injured, call for help before using any app."
      />

      <Card className="border-brand-critical/20 bg-brand-critical-soft">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-critical">
            <PhoneCall className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold text-brand-critical">
              Call emergency services
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-brand-critical/85">
              India&apos;s public emergency helplines are available 24 hours a day.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href="tel:112"
            className="flex items-center justify-between rounded-xl bg-brand-critical p-4 text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <span>
              <span className="block text-2xl font-bold">112</span>
              <span className="text-xs font-medium text-white/80">All emergencies</span>
            </span>
            <ArrowUpRight className="size-5" aria-hidden="true" />
          </a>
          <a
            href="tel:108"
            className="flex items-center justify-between rounded-xl border border-brand-critical/25 bg-white p-4 text-brand-critical shadow-sm transition-colors hover:bg-brand-critical-soft"
          >
            <span>
              <span className="block text-2xl font-bold">108</span>
              <span className="text-xs font-medium text-brand-critical/70">Ambulance</span>
            </span>
            <ArrowUpRight className="size-5" aria-hidden="true" />
          </a>
        </div>
      </Card>

      <Card className="mt-4 bg-white">
        <h2 className="text-sm font-semibold text-brand-navy">While you wait</h2>
        <ol className="mt-3 space-y-2.5">
          {waitingSteps.map((step, index) => (
            <li key={step} className="flex items-start gap-2.5 text-sm text-brand-navy-soft">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-blue-soft text-[10px] font-bold text-brand-blue">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Card>

      <DemoNotice className="mt-4">
        The 112 and 108 helplines are real public services. Hospital listings, bed counts, and
        availability in MediPulse are simulated and must not be relied on in an emergency.
      </DemoNotice>

      <Link
        to="/hospitals"
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-blue hover:underline"
      >
        Find hospitals near you
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  )
}
