import type { PatientKind } from '../types/account'
import { createEmptyChecklist } from '../types/claims'
import type {
  CashlessPreauthorization,
  ClaimData,
  ClaimStatus,
  ReimbursementChecklist,
  ReimbursementClaim,
} from '../types/claims'
import type { ClaimRepository } from './claimRepository'
import { createClaimCode } from './claimRepository'
import { supabase } from './supabaseClient'

interface ClaimRow {
  id: string
  code: string
  owner_id: string
  patient_id: string
  patient_kind: PatientKind
  policy_id: string
  hospital_id: string
  prepared_documents?: string[]
  checklist?: ReimbursementChecklist
  status: ClaimStatus
  created_at: string
  updated_at: string
  hospitals: { code: string } | { code: string }[] | null
}

function getClient() {
  if (!supabase) throw new Error('Supabase is not configured.')
  return supabase
}

function hospitalCode(row: ClaimRow): string {
  if (Array.isArray(row.hospitals)) return row.hospitals[0]?.code ?? row.hospital_id
  return row.hospitals?.code ?? row.hospital_id
}

function mapPreauthorization(row: ClaimRow): CashlessPreauthorization {
  return {
    id: row.id,
    code: row.code,
    ownerId: row.owner_id,
    patientId: row.patient_id,
    patientKind: row.patient_kind,
    policyId: row.policy_id,
    hospitalId: hospitalCode(row),
    preparedDocuments: row.prepared_documents ?? [],
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapReimbursement(row: ClaimRow): ReimbursementClaim {
  return {
    id: row.id,
    code: row.code,
    ownerId: row.owner_id,
    patientId: row.patient_id,
    patientKind: row.patient_kind,
    policyId: row.policy_id,
    hospitalId: hospitalCode(row),
    checklist: row.checklist ?? createEmptyChecklist(),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function resolveHospitalId(hospitalCode: string): Promise<string> {
  const { data, error } = await getClient()
    .from('hospitals')
    .select('id')
    .eq('code', hospitalCode)
    .single<{ id: string }>()
  if (error || !data) throw new Error('Choose a hospital from the demo directory.')
  return data.id
}

const claimSelect = '*, hospitals!inner(code)'

export const supabaseClaimRepository: ClaimRepository = {
  async load(ownerId: string): Promise<ClaimData> {
    const client = getClient()
    const [preauthorizationResult, reimbursementResult] = await Promise.all([
      client
        .from('cashless_preauthorizations')
        .select(claimSelect)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false }),
      client
        .from('reimbursement_claims')
        .select(claimSelect)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false }),
    ])

    if (preauthorizationResult.error || reimbursementResult.error) {
      throw new Error(
        'Simulated claim workflows could not be loaded. Apply the claim workflow migrations in the Supabase SQL editor to enable them.',
      )
    }

    return {
      preauthorizations: ((preauthorizationResult.data ?? []) as ClaimRow[]).map(
        mapPreauthorization,
      ),
      reimbursements: ((reimbursementResult.data ?? []) as ClaimRow[]).map(
        mapReimbursement,
      ),
    }
  },

  async savePreauthorization(ownerId, input, recordId) {
    const client = getClient()
    const hospitalId = await resolveHospitalId(input.hospitalId)
    const payload = {
      owner_id: ownerId,
      patient_id: input.patientId,
      patient_kind: input.patientKind,
      policy_id: input.policyId,
      hospital_id: hospitalId,
      prepared_documents: input.preparedDocuments,
      status: input.status,
      updated_at: new Date().toISOString(),
    }
    const query = recordId
      ? client
          .from('cashless_preauthorizations')
          .update(payload)
          .eq('id', recordId)
          .eq('owner_id', ownerId)
      : client.from('cashless_preauthorizations').insert({
          ...payload,
          code: createClaimCode('PA'),
        })
    const { data, error } = await query.select(claimSelect).single<ClaimRow>()
    if (error || !data) {
      throw new Error(
        'The simulated pre-authorization could not be saved. Check that the claim workflow migrations are applied.',
      )
    }
    return mapPreauthorization(data)
  },

  async saveReimbursement(ownerId, input, recordId) {
    const client = getClient()
    const hospitalId = await resolveHospitalId(input.hospitalId)
    const payload = {
      owner_id: ownerId,
      patient_id: input.patientId,
      patient_kind: input.patientKind,
      policy_id: input.policyId,
      hospital_id: hospitalId,
      checklist: input.checklist,
      status: input.status,
      updated_at: new Date().toISOString(),
    }
    const query = recordId
      ? client
          .from('reimbursement_claims')
          .update(payload)
          .eq('id', recordId)
          .eq('owner_id', ownerId)
      : client.from('reimbursement_claims').insert({
          ...payload,
          code: createClaimCode('RC'),
        })
    const { data, error } = await query.select(claimSelect).single<ClaimRow>()
    if (error || !data) {
      throw new Error(
        'The simulated reimbursement claim could not be saved. Check that the claim workflow migrations are applied.',
      )
    }
    return mapReimbursement(data)
  },
}
