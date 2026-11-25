import type {
  AccountData,
  BloodGroup,
  FamilyMember,
  FamilyMemberInput,
  FamilyRelationship,
  Gender,
  InsurancePolicy,
  InsurancePolicyInput,
  InsuranceProviderOption,
  PatientDetails,
  PolicyStatus,
  SelfProfile,
} from '../types/account'
import type { AccountRepository } from './accountRepository'
import { supabase } from './supabaseClient'

interface ProfileRow {
  id: string
  full_name: string
  date_of_birth: string
  gender: string
  phone: string
  blood_group: string
  address_line: string
  city: string
  emergency_contact_name: string
  emergency_contact_phone: string
  allergies: string[] | null
  medical_conditions: string[] | null
  created_at: string
  updated_at: string
}

interface FamilyRow extends Omit<ProfileRow, 'id'> {
  id: string
  owner_id: string
  relationship: string
}

interface PolicyRow {
  id: string
  owner_id: string
  patient_kind: 'self' | 'family'
  patient_id: string
  provider_id: string
  provider_name: string
  plan_name: string
  policy_number: string
  member_id: string
  start_date: string
  end_date: string
  sum_insured: number | string
  covered_member_ids: string[] | null
  status: string
  created_at: string
  updated_at: string
}

interface ProviderRow {
  id: string
  name: string
  plan_name: string
}

function getClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }
  return supabase
}

function profileDetails(row: ProfileRow): PatientDetails {
  return {
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender as Gender,
    phone: row.phone,
    bloodGroup: row.blood_group as BloodGroup,
    addressLine: row.address_line,
    city: row.city,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    allergies: row.allergies ?? [],
    medicalConditions: row.medical_conditions ?? [],
  }
}

function mapSelf(row: ProfileRow): SelfProfile {
  return {
    ...profileDetails(row),
    id: row.id,
    ownerId: row.id,
    kind: 'self',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapFamily(row: FamilyRow): FamilyMember {
  return {
    ...profileDetails(row),
    id: row.id,
    ownerId: row.owner_id,
    kind: 'family',
    relationship: row.relationship as FamilyRelationship,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapPolicy(row: PolicyRow): InsurancePolicy {
  return {
    id: row.id,
    ownerId: row.owner_id,
    patientId: row.patient_id,
    patientKind: row.patient_kind,
    providerId: row.provider_id,
    providerName: row.provider_name,
    planName: row.plan_name,
    policyNumber: row.policy_number,
    memberId: row.member_id,
    startDate: row.start_date,
    endDate: row.end_date,
    sumInsured: Number(row.sum_insured),
    coveredMemberIds: row.covered_member_ids ?? [],
    status: row.status as PolicyStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function profilePayload(details: PatientDetails) {
  return {
    full_name: details.fullName,
    date_of_birth: details.dateOfBirth,
    gender: details.gender,
    phone: details.phone,
    blood_group: details.bloodGroup,
    address_line: details.addressLine,
    city: details.city,
    emergency_contact_name: details.emergencyContactName,
    emergency_contact_phone: details.emergencyContactPhone,
    allergies: details.allergies,
    medical_conditions: details.medicalConditions,
  }
}

function policyPayload(ownerId: string, input: InsurancePolicyInput) {
  return {
    owner_id: ownerId,
    patient_kind: input.patientKind,
    patient_id: input.patientId,
    provider_id: input.providerId,
    provider_name: input.providerName,
    plan_name: input.planName,
    policy_number: input.policyNumber,
    member_id: input.memberId,
    start_date: input.startDate,
    end_date: input.endDate,
    sum_insured: input.sumInsured,
    covered_member_ids: input.coveredMemberIds,
    status: input.status,
  }
}

export const supabaseAccountRepository: AccountRepository = {
  async load(ownerId: string): Promise<AccountData> {
    const client = getClient()

    const [profileResult, familyResult, policyResult] = await Promise.all([
      client.from('profiles').select('*').eq('id', ownerId).maybeSingle<ProfileRow>(),
      client
        .from('family_members')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: true }),
      client
        .from('insurance_policies')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: true }),
    ])

    if (profileResult.error || familyResult.error || policyResult.error) {
      throw new Error('Your profile data could not be loaded.')
    }

    return {
      selfProfile: profileResult.data ? mapSelf(profileResult.data) : null,
      familyMembers: ((familyResult.data ?? []) as FamilyRow[]).map(mapFamily),
      policies: ((policyResult.data ?? []) as PolicyRow[]).map(mapPolicy),
    }
  },

  async saveSelfProfile(
    ownerId: string,
    details: PatientDetails,
  ): Promise<SelfProfile> {
    const client = getClient()
    const { data, error } = await client
      .from('profiles')
      .upsert({ id: ownerId, ...profilePayload(details), updated_at: new Date().toISOString() })
      .select('*')
      .single<ProfileRow>()

    if (error || !data) {
      throw new Error('Your personal profile could not be saved.')
    }

    return mapSelf(data)
  },

  async addFamilyMember(
    ownerId: string,
    input: FamilyMemberInput,
  ): Promise<FamilyMember> {
    const client = getClient()
    const { data, error } = await client
      .from('family_members')
      .insert({
        owner_id: ownerId,
        relationship: input.relationship,
        ...profilePayload(input),
      })
      .select('*')
      .single<FamilyRow>()

    if (error || !data) {
      throw new Error('The family profile could not be added.')
    }

    return mapFamily(data)
  },

  async updateFamilyMember(
    ownerId: string,
    memberId: string,
    input: FamilyMemberInput,
  ): Promise<FamilyMember> {
    const client = getClient()
    const { data, error } = await client
      .from('family_members')
      .update({
        relationship: input.relationship,
        ...profilePayload(input),
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId)
      .eq('owner_id', ownerId)
      .select('*')
      .single<FamilyRow>()

    if (error || !data) {
      throw new Error('The family profile could not be updated.')
    }

    return mapFamily(data)
  },

  async removeFamilyMember(ownerId: string, memberId: string): Promise<void> {
    const client = getClient()
    const { error } = await client
      .from('family_members')
      .delete()
      .eq('id', memberId)
      .eq('owner_id', ownerId)

    if (error) throw new Error('The family profile could not be removed.')
  },

  async savePolicy(
    ownerId: string,
    input: InsurancePolicyInput,
    policyId?: string,
  ): Promise<InsurancePolicy> {
    const client = getClient()
    const payload = policyPayload(ownerId, input)
    const query = policyId
      ? client
          .from('insurance_policies')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', policyId)
          .eq('owner_id', ownerId)
      : client.from('insurance_policies').insert(payload)

    const { data, error } = await query.select('*').single<PolicyRow>()

    if (error || !data) {
      throw new Error('The demo insurance policy could not be saved.')
    }

    return mapPolicy(data)
  },

  async removePolicy(ownerId: string, policyId: string): Promise<void> {
    const client = getClient()
    const { error } = await client
      .from('insurance_policies')
      .delete()
      .eq('id', policyId)
      .eq('owner_id', ownerId)

    if (error) throw new Error('The demo insurance policy could not be removed.')
  },

  async listProviders(): Promise<InsuranceProviderOption[]> {
    const client = getClient()
    const { data, error } = await client
      .from('insurance_providers')
      .select('id, name, plan_name')
      .eq('active', true)
      .order('name', { ascending: true })

    if (error || !data) return []
    return (data as ProviderRow[]).map((provider) => ({
      id: provider.id,
      name: provider.name,
      planName: provider.plan_name,
    }))
  },
}
