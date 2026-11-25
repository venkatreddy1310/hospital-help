import type { PatientKind } from './account'

export type ClaimStatus =
  | 'not-started'
  | 'documents-pending'
  | 'submitted-demo'
  | 'under-review-demo'
  | 'approved-simulated'
  | 'rejected-simulated'

export const claimStatusOptions: Array<{ value: ClaimStatus; label: string }> = [
  { value: 'not-started', label: 'Not started' },
  { value: 'documents-pending', label: 'Documents pending' },
  { value: 'submitted-demo', label: 'Submitted (demo)' },
  { value: 'under-review-demo', label: 'Under review (demo)' },
  { value: 'approved-simulated', label: 'Approved (simulated)' },
  { value: 'rejected-simulated', label: 'Rejected (simulated)' },
]

export interface CashlessPreauthorization {
  id: string
  code: string
  ownerId: string
  patientId: string
  patientKind: PatientKind
  policyId: string
  hospitalId: string
  preparedDocuments: string[]
  status: ClaimStatus
  createdAt: string
  updatedAt: string
}

export type CashlessPreauthorizationInput = Omit<
  CashlessPreauthorization,
  'id' | 'code' | 'ownerId' | 'createdAt' | 'updatedAt'
>

export const reimbursementDocumentOptions = [
  { id: 'hospital-bills', label: 'Hospital bills' },
  { id: 'payment-receipts', label: 'Payment receipts' },
  { id: 'discharge-summary', label: 'Discharge summary' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'diagnostic-reports', label: 'Diagnostic reports' },
  { id: 'hospital-records', label: 'Hospital records' },
  { id: 'claim-form', label: 'Claim form' },
  { id: 'policy-member-info', label: 'Policy and member information' },
] as const

export type ReimbursementDocumentId =
  (typeof reimbursementDocumentOptions)[number]['id']

export type ReimbursementChecklist = Record<ReimbursementDocumentId, boolean>

export interface ReimbursementClaim {
  id: string
  code: string
  ownerId: string
  patientId: string
  patientKind: PatientKind
  policyId: string
  hospitalId: string
  checklist: ReimbursementChecklist
  status: ClaimStatus
  createdAt: string
  updatedAt: string
}

export type ReimbursementClaimInput = Omit<
  ReimbursementClaim,
  'id' | 'code' | 'ownerId' | 'createdAt' | 'updatedAt'
>

export interface ClaimData {
  preauthorizations: CashlessPreauthorization[]
  reimbursements: ReimbursementClaim[]
}

export function createEmptyChecklist(): ReimbursementChecklist {
  return Object.fromEntries(
    reimbursementDocumentOptions.map((document) => [document.id, false]),
  ) as ReimbursementChecklist
}
