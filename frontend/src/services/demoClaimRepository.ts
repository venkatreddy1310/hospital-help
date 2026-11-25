import type {
  CashlessPreauthorization,
  CashlessPreauthorizationInput,
  ClaimData,
  ReimbursementClaim,
  ReimbursementClaimInput,
} from '../types/claims'
import type { ClaimRepository } from './claimRepository'
import { createClaimCode } from './claimRepository'
import { createLocalId } from './demoAccountStorage'
import { loadDemoClaims, saveDemoClaims } from './demoClaimStorage'

function upsert<T extends { id: string }>(records: T[], record: T): T[] {
  return records.some((item) => item.id === record.id)
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records]
}

export const demoClaimRepository: ClaimRepository = {
  async load(ownerId: string): Promise<ClaimData> {
    return loadDemoClaims(ownerId)
  },

  async savePreauthorization(
    ownerId: string,
    input: CashlessPreauthorizationInput,
    recordId?: string,
  ): Promise<CashlessPreauthorization> {
    const data = loadDemoClaims(ownerId)
    const existing = recordId
      ? data.preauthorizations.find((record) => record.id === recordId)
      : undefined
    if (recordId && !existing) throw new Error('Demo pre-authorization not found.')

    const timestamp = new Date().toISOString()
    const record: CashlessPreauthorization = {
      ...input,
      id: existing?.id ?? createLocalId('preauthorization'),
      code: existing?.code ?? createClaimCode('PA'),
      ownerId,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }
    saveDemoClaims(ownerId, {
      ...data,
      preauthorizations: upsert(data.preauthorizations, record),
    })
    return record
  },

  async saveReimbursement(
    ownerId: string,
    input: ReimbursementClaimInput,
    recordId?: string,
  ): Promise<ReimbursementClaim> {
    const data = loadDemoClaims(ownerId)
    const existing = recordId
      ? data.reimbursements.find((record) => record.id === recordId)
      : undefined
    if (recordId && !existing) throw new Error('Demo reimbursement claim not found.')

    const timestamp = new Date().toISOString()
    const record: ReimbursementClaim = {
      ...input,
      id: existing?.id ?? createLocalId('reimbursement'),
      code: existing?.code ?? createClaimCode('RC'),
      ownerId,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }
    saveDemoClaims(ownerId, {
      ...data,
      reimbursements: upsert(data.reimbursements, record),
    })
    return record
  },
}
