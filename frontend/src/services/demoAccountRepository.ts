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
import type { AccountRepository } from './accountRepository'
import {
  createLocalId,
  loadDemoAccount,
  saveDemoAccount,
} from './demoAccountStorage'

function nowISO(): string {
  return new Date().toISOString()
}

function upsertById<T extends { id: string }>(items: T[], next: T): T[] {
  return items.some((item) => item.id === next.id)
    ? items.map((item) => (item.id === next.id ? next : item))
    : [next, ...items]
}

export const demoAccountRepository: AccountRepository = {
  async load(ownerId: string): Promise<AccountData> {
    return loadDemoAccount(ownerId)
  },

  async saveSelfProfile(
    ownerId: string,
    details: PatientDetails,
  ): Promise<SelfProfile> {
    const account = loadDemoAccount(ownerId)
    const timestamp = nowISO()
    const profile: SelfProfile = {
      ...details,
      id: account.selfProfile?.id ?? createLocalId('patient'),
      ownerId,
      kind: 'self',
      createdAt: account.selfProfile?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    saveDemoAccount(ownerId, { ...account, selfProfile: profile })
    return profile
  },

  async addFamilyMember(
    ownerId: string,
    input: FamilyMemberInput,
  ): Promise<FamilyMember> {
    const account = loadDemoAccount(ownerId)
    const timestamp = nowISO()
    const member: FamilyMember = {
      ...input,
      id: createLocalId('family'),
      ownerId,
      kind: 'family',
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    saveDemoAccount(ownerId, {
      ...account,
      familyMembers: [member, ...account.familyMembers],
    })
    return member
  },

  async updateFamilyMember(
    ownerId: string,
    memberId: string,
    input: FamilyMemberInput,
  ): Promise<FamilyMember> {
    const account = loadDemoAccount(ownerId)
    const existing = account.familyMembers.find((member) => member.id === memberId)
    if (!existing) throw new Error('That family profile could not be found.')

    const member: FamilyMember = {
      ...existing,
      ...input,
      updatedAt: nowISO(),
    }

    saveDemoAccount(ownerId, {
      ...account,
      familyMembers: upsertById(account.familyMembers, member),
    })
    return member
  },

  async removeFamilyMember(ownerId: string, memberId: string): Promise<void> {
    const account = loadDemoAccount(ownerId)
    saveDemoAccount(ownerId, {
      selfProfile: account.selfProfile,
      familyMembers: account.familyMembers.filter(
        (member) => member.id !== memberId,
      ),
      policies: account.policies
        .filter((policy) => policy.patientId !== memberId)
        .map((policy) => ({
          ...policy,
          coveredMemberIds: policy.coveredMemberIds.filter(
            (id) => id !== memberId,
          ),
        })),
    })
  },

  async savePolicy(
    ownerId: string,
    input: InsurancePolicyInput,
    policyId?: string,
  ): Promise<InsurancePolicy> {
    const account = loadDemoAccount(ownerId)
    const patientExists =
      (input.patientKind === 'self' && account.selfProfile?.id === input.patientId) ||
      (input.patientKind === 'family' &&
        account.familyMembers.some((member) => member.id === input.patientId))

    if (!patientExists) {
      throw new Error('Choose a patient profile owned by this account.')
    }

    const existing = policyId
      ? account.policies.find((policy) => policy.id === policyId)
      : undefined
    if (policyId && !existing) {
      throw new Error('That insurance policy could not be found.')
    }

    const timestamp = nowISO()
    const policy: InsurancePolicy = {
      ...input,
      id: existing?.id ?? createLocalId('policy'),
      ownerId,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    }

    saveDemoAccount(ownerId, {
      ...account,
      policies: upsertById(account.policies, policy),
    })
    return policy
  },

  async removePolicy(ownerId: string, policyId: string): Promise<void> {
    const account = loadDemoAccount(ownerId)
    saveDemoAccount(ownerId, {
      ...account,
      policies: account.policies.filter((policy) => policy.id !== policyId),
    })
  },

  async listProviders(): Promise<InsuranceProviderOption[]> {
    return []
  },
}
