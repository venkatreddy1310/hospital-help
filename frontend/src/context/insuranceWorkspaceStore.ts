import { createContext, useContext } from 'react'
import type {
  CashlessPreauthorization,
  CashlessPreauthorizationInput,
  ReimbursementClaim,
  ReimbursementClaimInput,
} from '../types/claims'
import type { InsuranceProvider } from '../types/insurance'

export interface ClaimMutationResult<T> {
  data: T | null
  error: string | null
}

export interface InsuranceWorkspaceContextValue {
  providers: InsuranceProvider[]
  preauthorizations: CashlessPreauthorization[]
  reimbursements: ReimbursementClaim[]
  isCatalogLoading: boolean
  isClaimsLoading: boolean
  error: string | null
  savePreauthorization: (
    input: CashlessPreauthorizationInput,
    recordId?: string,
  ) => Promise<ClaimMutationResult<CashlessPreauthorization>>
  saveReimbursement: (
    input: ReimbursementClaimInput,
    recordId?: string,
  ) => Promise<ClaimMutationResult<ReimbursementClaim>>
}

export const InsuranceWorkspaceContext =
  createContext<InsuranceWorkspaceContextValue | null>(null)

export function useInsuranceWorkspace(): InsuranceWorkspaceContextValue {
  const context = useContext(InsuranceWorkspaceContext)
  if (!context) {
    throw new Error('useInsuranceWorkspace must be used inside InsuranceWorkspaceProvider')
  }
  return context
}
