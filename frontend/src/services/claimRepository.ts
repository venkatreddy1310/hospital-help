import type {
  CashlessPreauthorization,
  CashlessPreauthorizationInput,
  ClaimData,
  ReimbursementClaim,
  ReimbursementClaimInput,
} from '../types/claims'
import { isSupabaseConfigured } from './supabaseClient'

export interface ClaimRepository {
  load(ownerId: string): Promise<ClaimData>
  savePreauthorization(
    ownerId: string,
    input: CashlessPreauthorizationInput,
    recordId?: string,
  ): Promise<CashlessPreauthorization>
  saveReimbursement(
    ownerId: string,
    input: ReimbursementClaimInput,
    recordId?: string,
  ): Promise<ReimbursementClaim>
}

export const claimRepositoryMode = isSupabaseConfigured ? 'supabase' : 'demo'

export function createClaimCode(prefix: 'PA' | 'RC'): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `MP-${prefix}-${date}-${suffix}`
}
