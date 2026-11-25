import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  accountRepositoryMode,
  type AccountRepository,
} from '../services/accountRepository'
import { useDemoCatalog } from './catalogStore'
import { demoAccountRepository } from '../services/demoAccountRepository'
import { supabaseAccountRepository } from '../services/supabaseAccountRepository'
import type {
  AccountData,
  CareProfile,
  FamilyMember,
  FamilyMemberInput,
  InsurancePolicy,
  InsurancePolicyInput,
  InsuranceProviderOption,
  PatientDetails,
  SelfProfile,
} from '../types/account'
import { AccountContext, type AccountContextValue } from './accountStore'
import { useAuth } from './authStore'

const repository: AccountRepository =
  accountRepositoryMode === 'supabase'
    ? supabaseAccountRepository
    : demoAccountRepository

const ACTIVE_PROFILE_PREFIX = 'medipulse.active-patient.'

const EMPTY_ACCOUNT: AccountData = {
  selfProfile: null,
  familyMembers: [],
  policies: [],
}

interface LoadedAccount {
  ownerId: string
  data: AccountData
  activeProfileId: string | null
  error: string | null
}

function getStoredActiveProfile(ownerId: string): string | null {
  try {
    return window.localStorage.getItem(`${ACTIVE_PROFILE_PREFIX}${ownerId}`)
  } catch {
    return null
  }
}

function storeActiveProfile(ownerId: string, profileId: string | null): void {
  try {
    if (profileId) {
      window.localStorage.setItem(`${ACTIVE_PROFILE_PREFIX}${ownerId}`, profileId)
    } else {
      window.localStorage.removeItem(`${ACTIVE_PROFILE_PREFIX}${ownerId}`)
    }
  } catch {
    // Selection still works in memory when storage is unavailable.
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'The account change could not be saved.'
}

function resolveActiveProfileId(
  ownerId: string,
  account: AccountData,
): string | null {
  const ids = [
    account.selfProfile?.id,
    ...account.familyMembers.map((member) => member.id),
  ].filter((id): id is string => Boolean(id))

  const stored = getStoredActiveProfile(ownerId)
  if (stored && ids.includes(stored)) return stored
  return account.selfProfile?.id ?? account.familyMembers[0]?.id ?? null
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user, status: authStatus, isDemoMode } = useAuth()
  const { insuranceProviders: catalogProviders } = useDemoCatalog()
  const [loaded, setLoaded] = useState<LoadedAccount | null>(null)
  const [remoteProviders, setRemoteProviders] = useState<
    InsuranceProviderOption[]
  >([])
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    if (!user) return

    let active = true
    const ownerId = user.id

    void Promise.all([
      repository.load(ownerId),
      accountRepositoryMode === 'supabase'
        ? repository.listProviders()
        : Promise.resolve([]),
    ])
      .then(([data, providers]) => {
        if (!active) return
        setRemoteProviders(providers)
        setLoaded({
          ownerId,
          data,
          activeProfileId: resolveActiveProfileId(ownerId, data),
          error: null,
        })
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setLoaded({
          ownerId,
          data: EMPTY_ACCOUNT,
          activeProfileId: null,
          error: getErrorMessage(loadError),
        })
      })

    return () => {
      active = false
    }
  }, [user, reloadToken])

  const current = user && loaded?.ownerId === user.id ? loaded : null
  const accountData = current?.data ?? EMPTY_ACCOUNT
  const activeProfileId = current?.activeProfileId ?? null

  const profiles = useMemo<CareProfile[]>(
    () => [
      ...(accountData.selfProfile ? [accountData.selfProfile] : []),
      ...accountData.familyMembers,
    ],
    [accountData],
  )

  const activeProfile =
    profiles.find((profile) => profile.id === activeProfileId) ?? null

  const insuranceProviders = useMemo<InsuranceProviderOption[]>(() => {
    if (isDemoMode) {
      return catalogProviders
        .filter((provider) => provider.active)
        .map((provider) => ({
          id: provider.id,
          name: provider.name,
          planName: provider.planName,
        }))
    }

    return remoteProviders
  }, [catalogProviders, isDemoMode, remoteProviders])

  const setActiveProfile = useCallback(
    (profileId: string) => {
      if (!user || !profiles.some((profile) => profile.id === profileId)) return
      storeActiveProfile(user.id, profileId)
      setLoaded((state) =>
        state?.ownerId === user.id
          ? { ...state, activeProfileId: profileId }
          : state,
      )
    },
    [profiles, user],
  )

  const saveSelfProfile = useCallback(
    async (details: PatientDetails): Promise<string | null> => {
      if (!user) return 'Sign in to save your profile.'

      try {
        const profile = await repository.saveSelfProfile(user.id, details)
        const nextActiveId = activeProfileId ?? profile.id
        if (!activeProfileId) storeActiveProfile(user.id, profile.id)

        setLoaded((state) =>
          state?.ownerId === user.id
            ? {
                ...state,
                data: { ...state.data, selfProfile: profile },
                activeProfileId: nextActiveId,
              }
            : state,
        )
        return null
      } catch (saveError) {
        return getErrorMessage(saveError)
      }
    },
    [activeProfileId, user],
  )

  const addFamilyMember = useCallback(
    async (input: FamilyMemberInput): Promise<string | null> => {
      if (!user) return 'Sign in to add family profiles.'

      try {
        const member = await repository.addFamilyMember(user.id, input)
        setLoaded((state) =>
          state?.ownerId === user.id
            ? {
                ...state,
                data: {
                  ...state.data,
                  familyMembers: [...state.data.familyMembers, member],
                },
              }
            : state,
        )
        return null
      } catch (saveError) {
        return getErrorMessage(saveError)
      }
    },
    [user],
  )

  const updateFamilyMember = useCallback(
    async (
      memberId: string,
      input: FamilyMemberInput,
    ): Promise<string | null> => {
      if (!user) return 'Sign in to update family profiles.'

      try {
        const member = await repository.updateFamilyMember(user.id, memberId, input)
        setLoaded((state) =>
          state?.ownerId === user.id
            ? {
                ...state,
                data: {
                  ...state.data,
                  familyMembers: state.data.familyMembers.map((item) =>
                    item.id === member.id ? member : item,
                  ),
                },
              }
            : state,
        )
        return null
      } catch (saveError) {
        return getErrorMessage(saveError)
      }
    },
    [user],
  )

  const removeFamilyMember = useCallback(
    async (memberId: string): Promise<string | null> => {
      if (!user) return 'Sign in to remove family profiles.'

      try {
        await repository.removeFamilyMember(user.id, memberId)

        const fallback =
          activeProfileId === memberId
            ? accountData.selfProfile?.id ??
              accountData.familyMembers.find((member) => member.id !== memberId)
                ?.id ??
              null
            : activeProfileId

        if (activeProfileId === memberId) {
          storeActiveProfile(user.id, fallback)
        }

        setLoaded((state) =>
          state?.ownerId === user.id
            ? {
                ...state,
                activeProfileId: fallback,
                data: {
                  ...state.data,
                  familyMembers: state.data.familyMembers.filter(
                    (member) => member.id !== memberId,
                  ),
                  policies: state.data.policies
                    .filter((policy) => policy.patientId !== memberId)
                    .map((policy) => ({
                      ...policy,
                      coveredMemberIds: policy.coveredMemberIds.filter(
                        (id) => id !== memberId,
                      ),
                    })),
                },
              }
            : state,
        )
        return null
      } catch (removeError) {
        return getErrorMessage(removeError)
      }
    },
    [accountData.familyMembers, accountData.selfProfile, activeProfileId, user],
  )

  const savePolicy = useCallback(
    async (
      input: InsurancePolicyInput,
      policyId?: string,
    ): Promise<string | null> => {
      if (!user) return 'Sign in to save insurance policies.'

      try {
        const policy = await repository.savePolicy(user.id, input, policyId)
        setLoaded((state) =>
          state?.ownerId === user.id
            ? {
                ...state,
                data: {
                  ...state.data,
                  policies: state.data.policies.some(
                    (item) => item.id === policy.id,
                  )
                    ? state.data.policies.map((item) =>
                        item.id === policy.id ? policy : item,
                      )
                    : [policy, ...state.data.policies],
                },
              }
            : state,
        )
        return null
      } catch (saveError) {
        return getErrorMessage(saveError)
      }
    },
    [user],
  )

  const removePolicy = useCallback(
    async (policyId: string): Promise<string | null> => {
      if (!user) return 'Sign in to remove insurance policies.'

      try {
        await repository.removePolicy(user.id, policyId)
        setLoaded((state) =>
          state?.ownerId === user.id
            ? {
                ...state,
                data: {
                  ...state.data,
                  policies: state.data.policies.filter(
                    (policy) => policy.id !== policyId,
                  ),
                },
              }
            : state,
        )
        return null
      } catch (removeError) {
        return getErrorMessage(removeError)
      }
    },
    [user],
  )

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  const value = useMemo<AccountContextValue>(
    () => ({
      selfProfile: accountData.selfProfile as SelfProfile | null,
      familyMembers: accountData.familyMembers as FamilyMember[],
      policies: accountData.policies as InsurancePolicy[],
      profiles,
      activeProfile,
      activeProfileId,
      insuranceProviders,
      isLoading:
        authStatus === 'initializing' || (Boolean(user) && current === null),
      error: current?.error ?? null,
      setActiveProfile,
      saveSelfProfile,
      addFamilyMember,
      updateFamilyMember,
      removeFamilyMember,
      savePolicy,
      removePolicy,
      reload,
    }),
    [
      accountData,
      profiles,
      activeProfile,
      activeProfileId,
      insuranceProviders,
      authStatus,
      current,
      user,
      setActiveProfile,
      saveSelfProfile,
      addFamilyMember,
      updateFamilyMember,
      removeFamilyMember,
      savePolicy,
      removePolicy,
      reload,
    ],
  )

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  )
}
