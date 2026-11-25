import type {
  AccountData,
  FamilyMember,
  FamilyMemberInput,
  InsurancePolicy,
  InsurancePolicyInput,
  InsuranceProviderOption,
  PatientDetails,
  SelfProfile,
} from '../types/account'
import { isSupabaseConfigured } from './supabaseClient'

export interface AccountRepository {
  load(ownerId: string): Promise<AccountData>
  saveSelfProfile(ownerId: string, details: PatientDetails): Promise<SelfProfile>
  addFamilyMember(ownerId: string, input: FamilyMemberInput): Promise<FamilyMember>
  updateFamilyMember(
    ownerId: string,
    memberId: string,
    input: FamilyMemberInput,
  ): Promise<FamilyMember>
  removeFamilyMember(ownerId: string, memberId: string): Promise<void>
  savePolicy(
    ownerId: string,
    input: InsurancePolicyInput,
    policyId?: string,
  ): Promise<InsurancePolicy>
  removePolicy(ownerId: string, policyId: string): Promise<void>
  listProviders(): Promise<InsuranceProviderOption[]>
}

export const accountRepositoryMode = isSupabaseConfigured ? 'supabase' : 'demo'
