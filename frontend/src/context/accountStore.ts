import { createContext, useContext } from 'react'
import type {
  CareProfile,
  FamilyMember,
  FamilyMemberInput,
  InsurancePolicy,
  InsurancePolicyInput,
  InsuranceProviderOption,
  PatientDetails,
  SelfProfile,
} from '../types/account'

export type AccountMutationResult = Promise<string | null>

export interface AccountContextValue {
  selfProfile: SelfProfile | null
  familyMembers: FamilyMember[]
  policies: InsurancePolicy[]
  profiles: CareProfile[]
  activeProfile: CareProfile | null
  activeProfileId: string | null
  insuranceProviders: InsuranceProviderOption[]
  isLoading: boolean
  error: string | null
  setActiveProfile: (profileId: string) => void
  saveSelfProfile: (details: PatientDetails) => AccountMutationResult
  addFamilyMember: (input: FamilyMemberInput) => AccountMutationResult
  updateFamilyMember: (
    memberId: string,
    input: FamilyMemberInput,
  ) => AccountMutationResult
  removeFamilyMember: (memberId: string) => AccountMutationResult
  savePolicy: (
    input: InsurancePolicyInput,
    policyId?: string,
  ) => AccountMutationResult
  removePolicy: (policyId: string) => AccountMutationResult
  reload: () => void
}

export const AccountContext = createContext<AccountContextValue | null>(null)

export function useAccount(): AccountContextValue {
  const context = useContext(AccountContext)
  if (context === null) {
    throw new Error('useAccount must be used inside AccountProvider')
  }
  return context
}
