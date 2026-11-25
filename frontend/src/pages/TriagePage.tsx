import {
  ArrowRight,
  Building2,
  Info,
  Loader2,
  LockKeyhole,
  PencilLine,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { EmergencyAlert } from '../components/triage/EmergencyAlert'
import { EmergencyWarningList } from '../components/triage/EmergencyWarningList'
import { ChoiceSelector } from '../components/triage/ChoiceSelector'
import { RecommendationCard } from '../components/triage/RecommendationCard'
import { SeveritySelector } from '../components/triage/SeveritySelector'
import { SymptomSelector } from '../components/triage/SymptomSelector'
import { TriageProgress } from '../components/triage/TriageProgress'
import { TriageQuestionCard } from '../components/triage/TriageQuestionCard'
import { TriageResultCard } from '../components/triage/TriageResultCard'
import { AvailabilityBadge } from '../components/ui/AvailabilityBadge'
import { Badge } from '../components/ui/Badge'
import { useAppointments } from '../context/appointmentStore'
import { useDemoCatalog } from '../context/catalogStore'
import { useServiceLocation } from '../context/locationStore'
import type {
  AgeGroupId,
  DurationId,
  EmergencySignId,
  SeverityId,
  SymptomId,
  TriageAnswers,
  TrendId,
} from '../types/triage'
import { cn } from '../utils/cn'
import { getHospitalsForLocationFrom } from '../utils/demoData'
import {
  formatNextSlotLabel,
  getSpecialistEntry,
} from '../utils/specialistDirectory'
import { getSpecialtyLabel } from '../utils/specialists'
import { assessTriage } from '../utils/triageEngine'
import {
  ageGroupOptions,
  durationOptions,
  emergencySignOptions,
  trendOptions,
} from '../utils/triageData'

const FLOW_STEPS = ['Symptoms', 'Duration', 'Severity', 'Details', 'Safety check'] as const

type Phase = 'landing' | 'assessment' | 'processing' | 'result'

const introSteps = [
  {
    title: 'Describe your symptoms',
    description: 'Select what applies, then add duration, severity, and a little context.',
  },
  {
    title: 'Complete a safety check',
    description:
      'Emergency warning signs always take priority over the routine assessment and result.',
  },
  {
    title: 'Review simulated guidance',
    description:
      'See an urgency category, a suggested next step, and nearby demo hospitals or specialists.',
  },
]

function createEmptyAnswers(): TriageAnswers {
  return {
    symptoms: [],
    duration: null,
    severity: null,
    ageGroup: null,
    trend: null,
    context: '',
    emergencySigns: [],
  }
}

export function TriagePage() {
  const { location } = useServiceLocation()
  const { hospitals: catalogHospitals, specialists } = useDemoCatalog()
  const { appointments } = useAppointments()
  const hospitals = useMemo(
    () => getHospitalsForLocationFrom(catalogHospitals, location.id),
    [catalogHospitals, location.id],
  )
  const activeSpecialists = useMemo(
    () => specialists.filter((specialist) => specialist.active),
    [specialists],
  )

  const [phase, setPhase] = useState<Phase>('landing')
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<TriageAnswers>(createEmptyAnswers)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReturnType<typeof assessTriage> | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [phase, step])

  useEffect(() => {
    if (phase !== 'result') return
    document.getElementById('triage-result-heading')?.focus()
  }, [phase])

  useEffect(() => {
    if (phase !== 'processing') return

    const timer = window.setTimeout(() => {
      setResult(assessTriage(answers))
      setPhase('result')
    }, 900)

    return () => window.clearTimeout(timer)
  }, [answers, phase])

  const recommendedSpecialists = useMemo(() => {
    if (!result) return []

    return activeSpecialists
      .filter((specialist) =>
        result.recommendedSpecialties.includes(specialist.specialty),
      )
      .map((specialist) =>
        getSpecialistEntry(specialist, hospitals, appointments),
      )
      .sort(
        (a, b) =>
          Number(b.availableToday) - Number(a.availableToday) ||
          a.distanceKm - b.distanceKm,
      )
      .slice(0, 3)
  }, [activeSpecialists, appointments, hospitals, result])

  const startAssessment = () => {
    setAnswers(createEmptyAnswers())
    setResult(null)
    setError(null)
    setStep(1)
    setPhase('assessment')
  }

  const startAgain = () => {
    setAnswers(createEmptyAnswers())
    setResult(null)
    setError(null)
    setStep(1)
    setPhase('landing')
  }

  const editAnswers = () => {
    setResult(null)
    setError(null)
    setStep(1)
    setPhase('assessment')
  }

  const handleBack = () => {
    setError(null)
    if (step === 1) {
      setPhase('landing')
      return
    }
    setStep((current) => current - 1)
  }

  const handleContinue = () => {
    if (step === 1 && answers.symptoms.length === 0) {
      setError('Select at least one symptom to continue.')
      return
    }
    if (step === 2 && !answers.duration) {
      setError('Choose when your symptoms started.')
      return
    }
    if (step === 3 && !answers.severity) {
      setError('Choose how severe your symptoms feel.')
      return
    }
    if (step === 4 && !answers.ageGroup && !answers.trend) {
      setError('Choose an age group and describe the symptom trend.')
      return
    }
    if (step === 4 && !answers.ageGroup) {
      setError('Choose an age group.')
      return
    }
    if (step === 4 && !answers.trend) {
      setError('Choose how your symptoms are trending.')
      return
    }

    setError(null)

    if (step < 5) {
      setStep(step + 1)
      return
    }

    if (answers.emergencySigns.length > 0) {
      setResult(assessTriage(answers))
      setPhase('result')
      return
    }

    setPhase('processing')
  }

  const toggleSymptom = (symptom: SymptomId) => {
    setError(null)
    setAnswers((current) => ({
      ...current,
      symptoms: current.symptoms.includes(symptom)
        ? current.symptoms.filter((entry) => entry !== symptom)
        : [...current.symptoms, symptom],
    }))
  }

  const updateAnswer = <K extends keyof TriageAnswers>(
    key: K,
    value: TriageAnswers[K],
  ) => {
    setError(null)
    setAnswers((current) => ({ ...current, [key]: value }))
  }

  const toggleEmergencySign = (sign: EmergencySignId) => {
    setAnswers((current) => ({
      ...current,
      emergencySigns: current.emergencySigns.includes(sign)
        ? current.emergencySigns.filter((entry) => entry !== sign)
        : [...current.emergencySigns, sign],
    }))
  }

  if (phase === 'landing') {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader
          eyebrow="Guided assessment"
          title="AI Health Triage"
          description="Answer a few questions to see simulated urgency guidance and nearby care options. This is a hackathon demo, not a clinical service."
          actions={<Badge tone="teal">Simulated</Badge>}
        />

        <EmergencyAlert className="mb-4" />

        <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
          <section className="rounded-3xl border border-brand-line bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue">
                <Sparkles className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-brand-navy">
                  A safety-first symptom check
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-brand-navy-soft">
                  Five short steps. No name, phone number, or address is requested, and
                  your answers stay in this browser tab.
                </p>
              </div>
            </div>

            <ol className="mt-5 space-y-3">
              {introSteps.map((introStep, index) => (
                <li key={introStep.title} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-surface text-xs font-bold text-brand-blue">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">
                      {introStep.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-brand-navy-soft">
                      {introStep.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-brand-blue-soft/70 px-3.5 py-3 text-xs leading-relaxed text-brand-navy-soft">
              <Info className="mt-0.5 size-4 shrink-0 text-brand-blue" aria-hidden="true" />
              <p>
                <strong className="font-semibold text-brand-navy">
                  This tool provides general guidance, not a medical diagnosis.
                </strong>{' '}
                It does not prescribe medication or replace a qualified clinician.
              </p>
            </div>

            <button
              type="button"
              onClick={startAssessment}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark"
            >
              Start Assessment
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
            <p className="mt-2 text-center text-[11px] text-brand-navy-soft/75">
              5 steps · about 2 minutes · no personal contact details
            </p>
          </section>

          <div className="space-y-4">
            <section className="rounded-2xl border border-brand-line bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal-soft text-brand-teal-dark">
                  <LockKeyhole className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-brand-navy">Privacy in this demo</h2>
                  <p className="mt-1 text-xs leading-relaxed text-brand-navy-soft">
                    Answers are processed only in your browser. They are not sent to a real
                    hospital, saved to a database, or shared with anyone.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-brand-line bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-surface text-brand-navy-soft">
                  <ShieldCheck className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-brand-navy">
                    What this demo does not do
                  </h2>
                  <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-brand-navy-soft">
                    <li>No medical diagnosis or treatment plan.</li>
                    <li>No medication or dosage advice.</li>
                    <li>No automatic contact with emergency services.</li>
                    <li>No live AI model — results use a transparent ruleset.</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-brand-navy-soft/80">
          MediPulse supports care navigation. It does not replace emergency services. If you
          are worried about your symptoms, contact a qualified clinician.
        </p>
      </div>
    )
  }

  if (phase === 'assessment') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <TriageProgress current={step} steps={FLOW_STEPS} />
        </div>

        {step === 1 ? (
          <TriageQuestionCard
            title="What symptoms are you experiencing?"
            description="Select all that apply. No personal details are needed."
            error={error}
            onBack={handleBack}
            onContinue={handleContinue}
          >
            <SymptomSelector selected={answers.symptoms} onToggle={toggleSymptom} />
          </TriageQuestionCard>
        ) : null}

        {step === 2 ? (
          <TriageQuestionCard
            title="When did your symptoms start?"
            description="Choose the closest option. An approximate answer is fine."
            error={error}
            onBack={handleBack}
            onContinue={handleContinue}
          >
            <ChoiceSelector
              label="Duration"
              options={durationOptions}
              value={answers.duration}
              onChange={(duration: DurationId) => updateAnswer('duration', duration)}
            />
          </TriageQuestionCard>
        ) : null}

        {step === 3 ? (
          <TriageQuestionCard
            title="How severe do your symptoms feel?"
            description="This is your own assessment, not a clinical measurement."
            error={error}
            onBack={handleBack}
            onContinue={handleContinue}
          >
            <SeveritySelector
              value={answers.severity}
              onChange={(severity: SeverityId) => updateAnswer('severity', severity)}
            />
          </TriageQuestionCard>
        ) : null}

        {step === 4 ? (
          <TriageQuestionCard
            title="A little more context"
            description="Age group and symptom trend help the demo rules. Do not include names, phone numbers, or addresses."
            error={error}
            onBack={handleBack}
            onContinue={handleContinue}
          >
            <div className="space-y-5">
              <ChoiceSelector
                label="Age group"
                options={ageGroupOptions}
                value={answers.ageGroup}
                onChange={(ageGroup: AgeGroupId) => updateAnswer('ageGroup', ageGroup)}
              />
              <ChoiceSelector
                label="Symptom trend"
                options={trendOptions}
                value={answers.trend}
                onChange={(trend: TrendId) => updateAnswer('trend', trend)}
              />
              <div>
                <label
                  htmlFor="triage-context"
                  className="text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/70 uppercase"
                >
                  Anything else? (optional)
                </label>
                <textarea
                  id="triage-context"
                  rows={4}
                  maxLength={400}
                  value={answers.context}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      context: event.target.value,
                    }))
                  }
                  placeholder="For example, whether symptoms started after travel or activity."
                  className="mt-2 w-full resize-y rounded-xl border border-brand-line bg-white px-3.5 py-2.5 text-sm leading-relaxed text-brand-navy placeholder:text-brand-navy-soft/50 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 focus:outline-none"
                />
                <div className="mt-1 flex flex-wrap justify-between gap-2 text-[10px] text-brand-navy-soft/75">
                  <span>
                    Free text stays in this browser tab and is not analyzed by the demo
                    rules.
                  </span>
                  <span>{answers.context.length}/400</span>
                </div>
              </div>
            </div>
          </TriageQuestionCard>
        ) : null}

        {step === 5 ? (
          <TriageQuestionCard
            title="Safety check"
            description="Do any of these warning signs apply right now? This check takes priority over the rest of the assessment."
            error={error}
            continueLabel={
              answers.emergencySigns.length > 0
                ? 'Show emergency guidance'
                : 'See my result'
            }
            onBack={handleBack}
            onContinue={handleContinue}
          >
            <div className="flex items-start gap-2.5 rounded-xl border border-brand-critical/20 bg-brand-critical-soft/70 px-3.5 py-3 text-xs leading-relaxed text-brand-critical">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p>
                If any of these apply, call <strong>112</strong> or <strong>108</strong>{' '}
                immediately. This demo does not contact emergency services for you.
              </p>
            </div>

            <fieldset className="mt-4">
              <legend className="text-[10px] font-semibold tracking-[0.14em] text-brand-navy-soft/70 uppercase">
                Select any that apply right now
              </legend>
              <div className="mt-2 space-y-2">
                {emergencySignOptions.map((sign) => {
                  const isChecked = answers.emergencySigns.includes(sign.id)

                  return (
                    <label
                      key={sign.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors',
                        isChecked
                          ? 'border-brand-critical/40 bg-brand-critical-soft'
                          : 'border-brand-line bg-white hover:bg-brand-surface',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleEmergencySign(sign.id)}
                        className="mt-0.5 size-5 shrink-0 accent-brand-critical"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-brand-navy">
                          {sign.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-brand-navy-soft">
                          {sign.description}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {answers.emergencySigns.length > 0 ? (
              <EmergencyAlert
                className="mt-4"
                title="Emergency warning reported"
                description="Continuing will replace the routine result with immediate emergency guidance. Do not wait for this demo."
              />
            ) : (
              <p className="mt-3 text-xs leading-relaxed text-brand-navy-soft">
                If none of these apply, continue to your simulated result.
              </p>
            )}
          </TriageQuestionCard>
        ) : null}
      </div>
    )
  }

  if (phase === 'processing') {
    return (
      <div className="mx-auto max-w-2xl">
        <section
          role="status"
          className="rounded-3xl border border-brand-line bg-white p-8 text-center shadow-sm sm:p-10"
        >
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-blue-soft text-brand-blue">
            <Loader2 className="size-7 animate-spin" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-bold tracking-tight text-brand-navy">
            Reviewing your answers
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-navy-soft">
            Running the simulated safety check against the demo rules…
          </p>
          <p className="mx-auto mt-4 max-w-sm text-[11px] leading-relaxed text-brand-navy-soft/75">
            This uses a transparent ruleset, not a live AI model. It does not produce a
            diagnosis.
          </p>
        </section>
      </div>
    )
  }

  if (!result) return null

  const primarySpecialty = result.recommendedSpecialties[0]
  const findSpecialistsHref = primarySpecialty
    ? `/specialists?specialty=${encodeURIComponent(primarySpecialty)}&from=triage`
    : '/specialists'

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-brand-navy-soft">
          Demo guidance for{' '}
          <span className="font-semibold text-brand-navy">{location.area}</span>
        </p>
        <Badge tone="neutral">Rules-based · not a diagnosis</Badge>
      </div>

      <TriageResultCard result={result} />

      {result.urgency !== 'emergency' ? (
        <Link
          to={`/assistant?urgency=${result.urgency}${
            primarySpecialty ? `&specialty=${encodeURIComponent(primarySpecialty)}` : ''
          }`}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-brand-line bg-white px-3.5 py-2 text-xs font-semibold text-brand-blue shadow-sm transition-colors hover:bg-brand-surface"
        >
          <Sparkles className="size-3.5" aria-hidden="true" />
          Ask the health assistant about this result
        </Link>
      ) : null}

      {result.urgency === 'emergency' ? (
        <EmergencyAlert
          className="mt-4"
          title="Call emergency services now"
          description="You reported an emergency warning sign. Call 112 or 108 and follow the dispatcher's instructions. Do not rely on this demo."
        />
      ) : null}

      <section aria-labelledby="nearby-hospitals-heading" className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="nearby-hospitals-heading"
              className="text-base font-bold tracking-tight text-brand-navy sm:text-lg"
            >
              Nearby hospitals
            </h2>
            <p className="mt-0.5 text-xs text-brand-navy-soft">
              Simulated availability from {location.area}. Confirm details before travelling.
            </p>
          </div>
          <Link
            to="/hospitals"
            className="text-xs font-semibold text-brand-blue hover:underline"
          >
            View directory
          </Link>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hospitals.slice(0, 3).map((hospital) => (
            <RecommendationCard
              key={hospital.id}
              to={`/hospitals/${hospital.id}`}
              icon={Building2}
              title={hospital.name}
              subtitle={`${hospital.area} · ${hospital.distanceKm.toFixed(1)} km away`}
              badge={<AvailabilityBadge status={hospital.availability} />}
              details={[
                `${hospital.availableBeds} of ${hospital.totalBeds} beds free`,
                hospital.emergency ? '24/7 emergency dept.' : 'Emergency dept. not listed',
              ]}
              linkLabel="View hospital"
            />
          ))}
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-brand-navy-soft/75">
          Bed counts and facilities are simulated demo data, not live hospital information.
        </p>
      </section>

      <section aria-labelledby="specialists-heading" className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="specialists-heading"
              className="text-base font-bold tracking-tight text-brand-navy sm:text-lg"
            >
              Suggested specialists
            </h2>
            <p className="mt-0.5 text-xs text-brand-navy-soft">
              Matched to your symptoms and the demo specialist directory.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/specialists"
              className="text-xs font-semibold text-brand-blue hover:underline"
            >
              All specialists
            </Link>
            <Link
              to={findSpecialistsHref}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-brand-blue px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark"
            >
              <Stethoscope className="size-3.5" aria-hidden="true" />
              Find specialists
            </Link>
          </div>
        </div>

        {recommendedSpecialists.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {recommendedSpecialists.map((entry) => {
              const specialist = entry.specialist

              return (
                <RecommendationCard
                  key={specialist.id}
                  to={`/specialists/${specialist.id}`}
                  icon={Stethoscope}
                  title={specialist.name}
                  subtitle={`${getSpecialtyLabel(specialist.specialty)} · ${specialist.experienceYears} yrs experience`}
                  badge={
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold',
                        entry.availableToday
                          ? 'bg-brand-teal-soft text-brand-teal-dark'
                          : 'bg-brand-surface text-brand-navy-soft',
                      )}
                    >
                      {entry.availableToday
                        ? 'Available today'
                        : entry.nextSlot
                          ? formatNextSlotLabel(entry.nextSlot)
                          : 'No demo slots'}
                    </span>
                  }
                  details={[
                    entry.nearestHospital?.name ?? specialist.hospital,
                    `${entry.distanceKm.toFixed(1)} km away`,
                  ]}
                  linkLabel="View doctor profile"
                />
              )
            })}
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-brand-line bg-white px-4 py-3 text-xs text-brand-navy-soft">
            No demo specialists match this result. Browse the full directory to find a
            simulated appointment.
          </p>
        )}

        <p className="mt-2 text-[10px] leading-relaxed text-brand-navy-soft/75">
          Specialist names, availability, and appointment slots are simulated. This is
          informational only and not a referral.
        </p>
      </section>

      <EmergencyWarningList className="mt-6" />

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={startAgain}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-blue-dark"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Start Again
        </button>
        <button
          type="button"
          onClick={editAnswers}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand-line bg-white px-5 py-3 text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-surface"
        >
          <PencilLine className="size-4" aria-hidden="true" />
          Edit answers
        </button>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-brand-navy-soft/80">
        This result is generated from a transparent demo ruleset. It is not a medical
        diagnosis, is not clinically validated, and does not replace professional advice. If
        you are worried about your symptoms, contact a qualified clinician.
      </p>
    </div>
  )
}
