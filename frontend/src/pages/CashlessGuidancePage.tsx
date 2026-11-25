import { CircleCheck, ClipboardCheck, FileCheck2, Hospital, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { DemoNotice } from '../components/common/DemoNotice'
import { PageHeader } from '../components/common/PageHeader'
import { ClaimStatusBadge } from '../components/insurance/ClaimStatusBadge'
import { InsuranceStatusBadge } from '../components/insurance/InsuranceStatusBadge'
import { PatientPolicySelects } from '../components/insurance/PatientPolicySelects'
import { Card } from '../components/ui/Card'
import { useAccount } from '../context/accountStore'
import { useDemoCatalog } from '../context/catalogStore'
import { useInsuranceWorkspace } from '../context/insuranceWorkspaceStore'
import { claimStatusOptions, type CashlessPreauthorization, type ClaimStatus } from '../types/claims'
import { evaluateHospitalInsurance, getPoliciesForPatient } from '../utils/insurance'

const cashlessDocuments = [
  'Photo identification',
  'Policy or health card',
  'Doctor admission recommendation',
  'Relevant investigation reports',
  'Hospital treatment estimate',
]

export function CashlessGuidancePage() {
  const { profiles, policies, activeProfile } = useAccount()
  const { hospitals } = useDemoCatalog()
  const { providers, preauthorizations, isClaimsLoading, error, savePreauthorization } = useInsuranceWorkspace()
  const [patientChoice, setPatientChoice] = useState('')
  const [policyChoice, setPolicyChoice] = useState('')
  const [hospitalChoice, setHospitalChoice] = useState('')
  const [preparedDocuments, setPreparedDocuments] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const patientId = profiles.some((profile) => profile.id === patientChoice) ? patientChoice : activeProfile?.id ?? profiles[0]?.id ?? ''
  const patient = profiles.find((profile) => profile.id === patientId) ?? null
  const patientPolicies = getPoliciesForPatient(policies, patientId || null)
  const policy = patientPolicies.find((item) => item.id === policyChoice) ?? patientPolicies[0] ?? null
  const hospital = hospitals.find((item) => item.id === hospitalChoice) ?? hospitals[0] ?? null
  const evaluation = evaluateHospitalInsurance(patientId || null, policies, providers, hospital?.id ?? '')

  const toggleDocument = (document: string) => {
    setPreparedDocuments((current) => current.includes(document) ? current.filter((item) => item !== document) : [...current, document])
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!patient || !policy || !hospital) {
      setActionError('Choose a patient, linked policy, and hospital.')
      return
    }
    setIsSaving(true)
    setActionError(null)
    const result = await savePreauthorization({
      patientId: patient.id,
      patientKind: patient.kind,
      policyId: policy.id,
      hospitalId: hospital.id,
      preparedDocuments,
      status: 'documents-pending',
    })
    setIsSaving(false)
    if (result.error || !result.data) {
      setActionError(result.error ?? 'The demo pre-authorization could not be saved.')
      return
    }
    setMessage(`${result.data.code} saved. This is a simulated tracking record only.`)
    setPreparedDocuments([])
  }

  const updateStatus = async (record: CashlessPreauthorization, status: ClaimStatus) => {
    setActionError(null)
    const result = await savePreauthorization({
      patientId: record.patientId,
      patientKind: record.patientKind,
      policyId: record.policyId,
      hospitalId: record.hospitalId,
      preparedDocuments: record.preparedDocuments,
      status,
    }, record.id)
    if (result.error) setActionError(result.error)
    else setMessage(`${record.code} updated to a simulated status.`)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Cashless guidance"
        title="Prepare for the insurance desk"
        description="Check a simulated network match, organize documents, and track a demo pre-authorization. The hospital and insurer/TPA make every real decision."
        actions={<Link to="/coverage-checker" className="rounded-lg border border-brand-line bg-white px-3 py-2 text-xs font-semibold text-brand-blue hover:bg-brand-surface">Check coverage</Link>}
      />
      <DemoNotice className="mb-4">No request is sent to a hospital, insurer, or TPA. Statuses and reference IDs are simulated.</DemoNotice>
      {error || actionError ? <p role="alert" className="mb-4 rounded-xl bg-brand-critical-soft px-3.5 py-3 text-xs font-medium text-brand-critical">{actionError ?? error}</p> : null}
      {message ? <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-brand-teal-soft px-3.5 py-3 text-xs font-medium text-brand-teal-dark"><CircleCheck className="size-4" aria-hidden="true" />{message}</p> : null}

      <div className="grid items-start gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-white p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-brand-navy"><FileCheck2 className="size-5 text-brand-blue" aria-hidden="true" />New demo pre-authorization</h2>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <PatientPolicySelects profiles={profiles} policies={policies} patientId={patientId} policyId={policy?.id ?? ''} onPatientChange={(value) => { setPatientChoice(value); setPolicyChoice('') }} onPolicyChange={setPolicyChoice} />
            <label className="block text-xs font-semibold text-brand-navy">Hospital
              <select value={hospital?.id ?? ''} onChange={(event) => setHospitalChoice(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-brand-line bg-white px-3 text-sm outline-none focus:border-brand-blue">
                {hospitals.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.area}</option>)}
              </select>
            </label>
            <div className="rounded-xl bg-brand-surface p-3.5">
              <InsuranceStatusBadge evaluation={evaluation} />
              <p className="mt-2 text-xs leading-relaxed text-brand-navy-soft">{evaluation.detail}</p>
            </div>
            <fieldset>
              <legend className="text-xs font-semibold text-brand-navy">Documents prepared</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {cashlessDocuments.map((document) => (
                  <label key={document} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-brand-line px-3 py-2 text-xs text-brand-navy">
                    <input type="checkbox" checked={preparedDocuments.includes(document)} onChange={() => toggleDocument(document)} className="size-4 accent-brand-blue" />
                    {document}
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="submit" disabled={isSaving || !patient || !policy || !hospital} className="min-h-11 w-full rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50">
              {isSaving ? 'Saving demo record…' : 'Save demo pre-authorization'}
            </button>
          </form>
        </Card>

        <Card className="bg-brand-surface p-4 sm:p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-brand-navy"><ClipboardCheck className="size-5 text-brand-teal-dark" aria-hidden="true" />At the hospital</h2>
          <ol className="mt-4 space-y-4">
            {[
              ['Contact the insurance/TPA desk', 'Ask the hospital to confirm network status and the current cashless process before planned admission.'],
              ['Share the prepared documents', 'The desk may request additional forms, clinical notes, identity checks, or an updated estimate.'],
              ['Hospital seeks pre-authorization', 'Only the insurer/TPA can accept, query, or decline a real request. Keep any reference they provide.'],
              ['Confirm approval and exclusions', 'Ask about non-covered expenses and deposits. Never delay emergency treatment for insurance processing.'],
            ].map(([title, detail], index) => (
              <li key={title} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-brand-blue">{index + 1}</span><div><h3 className="text-xs font-semibold text-brand-navy">{title}</h3><p className="mt-1 text-[11px] leading-relaxed text-brand-navy-soft">{detail}</p></div></li>
            ))}
          </ol>
          <p className="mt-4 border-t border-brand-line pt-3 text-[10px] leading-relaxed text-brand-navy-soft">For an emergency in India, call 112 or 108. Insurance checks must not delay care.</p>
        </Card>
      </div>

      <section className="mt-7" aria-labelledby="cashless-records">
        <div className="flex items-center justify-between gap-3"><h2 id="cashless-records" className="text-lg font-bold text-brand-navy">Your demo tracking records</h2><span className="text-xs text-brand-navy-soft">{preauthorizations.length} saved</span></div>
        {isClaimsLoading ? <Card className="mt-3 bg-white text-xs text-brand-navy-soft">Loading demo records…</Card> : preauthorizations.length === 0 ? (
          <Card className="mt-3 border-dashed bg-white py-8 text-center"><Hospital className="mx-auto size-7 text-brand-navy-soft/40" aria-hidden="true" /><p className="mt-2 text-sm font-semibold text-brand-navy">No pre-authorization records yet</p><p className="mt-1 text-xs text-brand-navy-soft">Save the checklist above to create a simulated reference ID.</p></Card>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {preauthorizations.map((record) => {
              const recordPatient = profiles.find((item) => item.id === record.patientId)
              const recordHospital = hospitals.find((item) => item.id === record.hospitalId)
              const recordPolicy = policies.find((item) => item.id === record.policyId)
              return <article key={record.id} className="rounded-2xl border border-brand-line bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2"><div><p className="font-mono text-[10px] font-semibold text-brand-blue">{record.code}</p><h3 className="mt-1 text-sm font-semibold text-brand-navy">{recordHospital?.name ?? 'Demo hospital'}</h3><p className="mt-0.5 text-[11px] text-brand-navy-soft">{recordPatient?.fullName ?? 'Patient'} · {recordPolicy?.providerName ?? 'Policy'}</p></div><ClaimStatusBadge status={record.status} /></div>
                <p className="mt-3 text-xs text-brand-navy-soft"><ShieldCheck className="mr-1 inline size-3.5" aria-hidden="true" />{record.preparedDocuments.length} of {cashlessDocuments.length} document groups prepared</p>
                <label className="mt-3 block text-[10px] font-semibold text-brand-navy-soft uppercase">Simulated status
                  <select value={record.status} onChange={(event) => void updateStatus(record, event.target.value as ClaimStatus)} className="mt-1 min-h-10 w-full rounded-lg border border-brand-line bg-white px-2 text-xs font-normal normal-case text-brand-navy">
                    {claimStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </article>
            })}
          </div>
        )}
      </section>
    </div>
  )
}
