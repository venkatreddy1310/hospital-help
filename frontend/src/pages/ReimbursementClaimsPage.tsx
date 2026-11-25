import { CircleCheck, FileText, ReceiptIndianRupee, RotateCcw, ShieldCheck } from 'lucide-react'
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
import {
  claimStatusOptions,
  createEmptyChecklist,
  reimbursementDocumentOptions,
  type ClaimStatus,
  type ReimbursementChecklist,
  type ReimbursementClaim,
  type ReimbursementDocumentId,
} from '../types/claims'
import { evaluateHospitalInsurance, getPoliciesForPatient } from '../utils/insurance'

export function ReimbursementClaimsPage() {
  const { profiles, policies, activeProfile } = useAccount()
  const { hospitals } = useDemoCatalog()
  const { providers, reimbursements, isClaimsLoading, error, saveReimbursement } = useInsuranceWorkspace()
  const [patientChoice, setPatientChoice] = useState('')
  const [policyChoice, setPolicyChoice] = useState('')
  const [hospitalChoice, setHospitalChoice] = useState('')
  const [checklist, setChecklist] = useState<ReimbursementChecklist>(createEmptyChecklist)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const patientId = profiles.some((profile) => profile.id === patientChoice) ? patientChoice : activeProfile?.id ?? profiles[0]?.id ?? ''
  const patient = profiles.find((profile) => profile.id === patientId) ?? null
  const patientPolicies = getPoliciesForPatient(policies, patientId || null)
  const policy = patientPolicies.find((item) => item.id === policyChoice) ?? patientPolicies[0] ?? null
  const hospital = hospitals.find((item) => item.id === hospitalChoice) ?? hospitals[0] ?? null
  const evaluation = evaluateHospitalInsurance(patientId || null, policies, providers, hospital?.id ?? '')
  const preparedCount = Object.values(checklist).filter(Boolean).length

  const toggleNewDocument = (id: ReimbursementDocumentId) => {
    setChecklist((current) => ({ ...current, [id]: !current[id] }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!patient || !policy || !hospital) {
      setActionError('Choose a patient, linked policy, and hospital.')
      return
    }
    setIsSaving(true)
    setActionError(null)
    const result = await saveReimbursement({
      patientId: patient.id,
      patientKind: patient.kind,
      policyId: policy.id,
      hospitalId: hospital.id,
      checklist,
      status: 'documents-pending',
    })
    setIsSaving(false)
    if (result.error || !result.data) {
      setActionError(result.error ?? 'The demo reimbursement could not be saved.')
      return
    }
    setMessage(`${result.data.code} saved. No real reimbursement request was submitted.`)
    setChecklist(createEmptyChecklist())
  }

  const updateRecord = async (record: ReimbursementClaim, changes: { status?: ClaimStatus; checklist?: ReimbursementChecklist }) => {
    setActionError(null)
    const result = await saveReimbursement({
      patientId: record.patientId,
      patientKind: record.patientKind,
      policyId: record.policyId,
      hospitalId: record.hospitalId,
      checklist: changes.checklist ?? record.checklist,
      status: changes.status ?? record.status,
    }, record.id)
    if (result.error) setActionError(result.error)
    else setMessage(`${record.code} updated in this demo workspace.`)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Reimbursement claims"
        title="Organize a demo reimbursement"
        description="Prepare the required document checklist and track an illustrative claim for yourself or a covered family member."
        actions={<Link to="/cashless-guidance" className="rounded-lg border border-brand-line bg-white px-3 py-2 text-xs font-semibold text-brand-blue hover:bg-brand-surface">Cashless guidance</Link>}
      />
      <DemoNotice className="mb-4">Nothing is uploaded or submitted to an insurer. Claim IDs, review states, approvals, and rejections are simulated.</DemoNotice>
      {error || actionError ? <p role="alert" className="mb-4 rounded-xl bg-brand-critical-soft px-3.5 py-3 text-xs font-medium text-brand-critical">{actionError ?? error}</p> : null}
      {message ? <p role="status" className="mb-4 flex items-center gap-2 rounded-xl bg-brand-teal-soft px-3.5 py-3 text-xs font-medium text-brand-teal-dark"><CircleCheck className="size-4" aria-hidden="true" />{message}</p> : null}

      <Card className="bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="flex items-center gap-2 text-base font-bold text-brand-navy"><ReceiptIndianRupee className="size-5 text-brand-blue" aria-hidden="true" />New demo reimbursement</h2><p className="mt-1 text-xs text-brand-navy-soft">Tick only documents you have prepared; no file upload is required.</p></div>
          <span className="rounded-full bg-brand-surface px-2.5 py-1 text-[10px] font-semibold text-brand-navy-soft">{preparedCount}/8 prepared</span>
        </div>
        <form onSubmit={submit} className="mt-4">
          <PatientPolicySelects profiles={profiles} policies={policies} patientId={patientId} policyId={policy?.id ?? ''} onPatientChange={(value) => { setPatientChoice(value); setPolicyChoice('') }} onPolicyChange={setPolicyChoice} />
          <label className="mt-3 block text-xs font-semibold text-brand-navy">Hospital
            <select value={hospital?.id ?? ''} onChange={(event) => setHospitalChoice(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-xl border border-brand-line bg-white px-3 text-sm outline-none focus:border-brand-blue">
              {hospitals.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.area}</option>)}
            </select>
          </label>
          <div className="mt-3 rounded-xl bg-brand-surface p-3.5"><InsuranceStatusBadge evaluation={evaluation} /><p className="mt-2 text-xs leading-relaxed text-brand-navy-soft">{evaluation.detail}</p></div>
          <fieldset className="mt-4">
            <legend className="text-xs font-semibold text-brand-navy">Eight-item reimbursement checklist</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {reimbursementDocumentOptions.map((document) => (
                <label key={document.id} className="flex min-h-14 cursor-pointer items-start gap-2 rounded-xl border border-brand-line px-3 py-2.5 text-xs leading-relaxed text-brand-navy">
                  <input type="checkbox" checked={checklist[document.id]} onChange={() => toggleNewDocument(document.id)} className="mt-0.5 size-4 shrink-0 accent-brand-blue" />
                  {document.label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => setChecklist(createEmptyChecklist())} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-brand-line px-3 text-xs font-semibold text-brand-navy-soft hover:bg-brand-surface"><RotateCcw className="size-3.5" aria-hidden="true" />Reset checklist</button>
            <button type="submit" disabled={isSaving || !patient || !policy || !hospital} className="min-h-11 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? 'Saving demo claim…' : 'Create demo claim ID'}</button>
          </div>
        </form>
      </Card>

      <section className="mt-7" aria-labelledby="reimbursement-records">
        <div className="flex items-center justify-between gap-3"><h2 id="reimbursement-records" className="text-lg font-bold text-brand-navy">Your demo claims</h2><span className="text-xs text-brand-navy-soft">{reimbursements.length} saved</span></div>
        {isClaimsLoading ? <Card className="mt-3 bg-white text-xs text-brand-navy-soft">Loading demo claims…</Card> : reimbursements.length === 0 ? (
          <Card className="mt-3 border-dashed bg-white py-8 text-center"><FileText className="mx-auto size-7 text-brand-navy-soft/40" aria-hidden="true" /><p className="mt-2 text-sm font-semibold text-brand-navy">No reimbursement claims yet</p><p className="mt-1 text-xs text-brand-navy-soft">Use the checklist above to generate a simulated claim ID.</p></Card>
        ) : (
          <div className="mt-3 space-y-3">
            {reimbursements.map((record) => {
              const recordPatient = profiles.find((item) => item.id === record.patientId)
              const recordHospital = hospitals.find((item) => item.id === record.hospitalId)
              const recordPolicy = policies.find((item) => item.id === record.policyId)
              const recordCount = Object.values(record.checklist).filter(Boolean).length
              return <article key={record.id} className="rounded-2xl border border-brand-line bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-mono text-[10px] font-semibold text-brand-blue">{record.code}</p><h3 className="mt-1 text-sm font-semibold text-brand-navy">{recordHospital?.name ?? 'Demo hospital'}</h3><p className="mt-0.5 text-[11px] text-brand-navy-soft">{recordPatient?.fullName ?? 'Patient'} · {recordPolicy?.providerName ?? 'Policy'} · {recordPolicy?.planName ?? 'Demo plan'}</p></div><ClaimStatusBadge status={record.status} /></div>
                <details className="mt-3 rounded-xl bg-brand-surface px-3 py-2">
                  <summary className="cursor-pointer text-xs font-semibold text-brand-navy">Edit checklist · {recordCount}/8 prepared</summary>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {reimbursementDocumentOptions.map((document) => <label key={document.id} className="flex items-start gap-2 text-[11px] text-brand-navy"><input type="checkbox" checked={record.checklist[document.id] ?? false} onChange={() => void updateRecord(record, { checklist: { ...record.checklist, [document.id]: !record.checklist[document.id] } })} className="mt-0.5 size-4 accent-brand-blue" />{document.label}</label>)}
                  </div>
                </details>
                <label className="mt-3 block max-w-xs text-[10px] font-semibold text-brand-navy-soft uppercase">Simulated status
                  <select value={record.status} onChange={(event) => void updateRecord(record, { status: event.target.value as ClaimStatus })} className="mt-1 min-h-10 w-full rounded-lg border border-brand-line bg-white px-2 text-xs font-normal normal-case text-brand-navy">{claimStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                </label>
              </article>
            })}
          </div>
        )}
      </section>

      <p className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-brand-navy-soft"><ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />Contact your insurer/TPA for actual deadlines, original-document requirements, exclusions, and decisions. MediPulse cannot approve or reject a real claim.</p>
    </div>
  )
}
