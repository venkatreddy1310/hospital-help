import { Calculator, CircleAlert, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { DemoNotice } from '../components/common/DemoNotice'
import { PageHeader } from '../components/common/PageHeader'
import { InsuranceStatusBadge } from '../components/insurance/InsuranceStatusBadge'
import { PatientPolicySelects } from '../components/insurance/PatientPolicySelects'
import { Card } from '../components/ui/Card'
import { useAccount } from '../context/accountStore'
import { useDemoCatalog } from '../context/catalogStore'
import { useInsuranceWorkspace } from '../context/insuranceWorkspaceStore'
import type { CoverageCategory } from '../types/insurance'
import { formatInsuranceAmount } from '../utils/account'
import { coverageCategoryMeta, coverageCategoryOptions } from '../utils/adminData'
import { calculateCoverageEstimate, evaluateHospitalInsurance, getPoliciesForPatient } from '../utils/insurance'

export function CoverageCheckerPage() {
  const { profiles, policies, activeProfile, isLoading } = useAccount()
  const { hospitals } = useDemoCatalog()
  const { providers, isCatalogLoading, error } = useInsuranceWorkspace()
  const [searchParams] = useSearchParams()
  const [patientChoice, setPatientChoice] = useState('')
  const [policyChoice, setPolicyChoice] = useState('')
  const [hospitalChoice, setHospitalChoice] = useState(searchParams.get('hospital') ?? '')
  const [category, setCategory] = useState<CoverageCategory>('general-hospitalization')
  const [costInput, setCostInput] = useState('100000')

  const patientId = profiles.some((profile) => profile.id === patientChoice)
    ? patientChoice
    : activeProfile?.id ?? profiles[0]?.id ?? ''
  const patientPolicies = getPoliciesForPatient(policies, patientId || null)
  const policy = patientPolicies.find((item) => item.id === policyChoice) ?? patientPolicies[0] ?? null
  const hospital = hospitals.find((item) => item.id === hospitalChoice) ?? hospitals[0] ?? null
  const provider = providers.find((item) => item.id === policy?.providerId) ?? null
  const treatmentCost = Number(costInput)
  const estimate = calculateCoverageEstimate({ policy, provider, category, treatmentCost })
  const evaluation = evaluateHospitalInsurance(patientId || null, policies, providers, hospital?.id ?? '')

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Insurance intelligence"
        title="Coverage checker"
        description="Explore an illustrative estimate using only your demo policy and the coverage rules configured by the demo administrator."
        actions={
          <Link to="/insurance" className="rounded-lg border border-brand-line bg-white px-3 py-2 text-xs font-semibold text-brand-blue hover:bg-brand-surface">
            Manage policies
          </Link>
        }
      />

      <DemoNotice className="mb-4">
        This is not a benefit verification, invoice, eligibility decision, or claim approval. Use fictional policy and treatment information.
      </DemoNotice>
      {error ? <p role="alert" className="mb-4 rounded-xl bg-brand-critical-soft px-3.5 py-3 text-xs font-medium text-brand-critical">{error}</p> : null}

      <div className="grid items-start gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="bg-white p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-brand-navy">
            <Calculator className="size-5 text-brand-blue" aria-hidden="true" />
            Estimate details
          </h2>
          <div className="mt-4">
            <PatientPolicySelects
              profiles={profiles}
              policies={policies}
              patientId={patientId}
              policyId={policy?.id ?? ''}
              onPatientChange={(value) => { setPatientChoice(value); setPolicyChoice('') }}
              onPolicyChange={setPolicyChoice}
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-brand-navy sm:col-span-2">
              Hospital
              <select value={hospital?.id ?? ''} onChange={(event) => setHospitalChoice(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-brand-line bg-white px-3 text-sm outline-none focus:border-brand-blue">
                {hospitals.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.area}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-brand-navy">
              Treatment category
              <select value={category} onChange={(event) => setCategory(event.target.value as CoverageCategory)} className="mt-1.5 min-h-11 w-full rounded-xl border border-brand-line bg-white px-3 text-sm outline-none focus:border-brand-blue">
                {coverageCategoryOptions.map((item) => <option key={item} value={item}>{coverageCategoryMeta[item].label}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-brand-navy">
              Illustrative treatment cost (₹)
              <input type="number" min="1" step="1000" value={costInput} onChange={(event) => setCostInput(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-brand-line bg-white px-3 text-sm outline-none focus:border-brand-blue" />
            </label>
          </div>
          {policy ? (
            <p className="mt-3 text-[11px] leading-relaxed text-brand-navy-soft">
              {policy.providerName} · valid {policy.startDate} to {policy.endDate} · illustrative sum insured {formatInsuranceAmount(policy.sumInsured)}
            </p>
          ) : (
            <p className="mt-3 text-xs text-brand-navy-soft">No policy is linked to this patient. <Link to="/insurance" className="font-semibold text-brand-blue underline">Add a demo policy</Link>.</p>
          )}
        </Card>

        <section aria-live="polite" aria-label="Illustrative coverage result">
          <Card className="bg-brand-navy p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.14em] text-white/60 uppercase">Illustrative estimate</p>
                <h2 className="mt-1 text-lg font-bold">{hospital?.name ?? 'Choose a hospital'}</h2>
              </div>
              <ShieldCheck className="size-6 text-brand-teal" aria-hidden="true" />
            </div>
            {estimate.sufficient ? (
              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/8 p-3"><dt className="text-[10px] text-white/60">Eligible after deductible</dt><dd className="mt-1 text-lg font-bold">{formatInsuranceAmount(estimate.eligibleAmount)}</dd></div>
                <div className="rounded-xl bg-white/8 p-3"><dt className="text-[10px] text-white/60">Insurer contribution</dt><dd className="mt-1 text-lg font-bold text-brand-teal-soft">{formatInsuranceAmount(estimate.insurerContribution)}</dd></div>
                <div className="rounded-xl bg-white/8 p-3"><dt className="text-[10px] text-white/60">Your out-of-pocket</dt><dd className="mt-1 text-lg font-bold">{formatInsuranceAmount(estimate.patientOutOfPocket)}</dd></div>
                <div className="rounded-xl bg-white/8 p-3"><dt className="text-[10px] text-white/60">Remaining sum insured</dt><dd className="mt-1 text-lg font-bold">{formatInsuranceAmount(estimate.remainingSumInsured)}</dd></div>
              </dl>
            ) : (
              <div className="mt-5 flex items-start gap-2 rounded-xl bg-white/10 p-4 text-sm font-medium">
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-brand-warning" aria-hidden="true" />
                {estimate.message}
              </div>
            )}
            {estimate.excluded ? <p className="mt-4 text-xs font-semibold text-brand-warning">This category is excluded by the configured demo rule.</p> : null}
            {estimate.waitingPeriodApplies ? <p className="mt-4 text-xs font-semibold text-brand-warning">The configured waiting period currently applies.</p> : null}
            {estimate.notes.length > 0 ? <ul className="mt-4 space-y-1.5 border-t border-white/15 pt-3 text-[11px] leading-relaxed text-white/70">{estimate.notes.map((note) => <li key={note}>• {note}</li>)}</ul> : null}
          </Card>
          {hospital && !isLoading && !isCatalogLoading ? (
            <Card className="mt-3 bg-white p-4">
              <InsuranceStatusBadge evaluation={evaluation} />
              <p className="mt-2 text-xs leading-relaxed text-brand-navy-soft">{evaluation.detail}</p>
            </Card>
          ) : null}
        </section>
      </div>

      <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-brand-navy-soft">
        <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-brand-warning" aria-hidden="true" />
        Estimates do not include real billing, prior claims, policy wording, or insurer decisions. Emergency care must never be delayed for this check; call 112 or 108 in India.
      </p>
    </div>
  )
}
