import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { claimRepositoryMode, type ClaimRepository } from '../services/claimRepository'
import { demoClaimRepository } from '../services/demoClaimRepository'
import { loadSupabaseInsuranceProviders } from '../services/insuranceCatalog'
import { supabaseClaimRepository } from '../services/supabaseClaimRepository'
import type {
  CashlessPreauthorization,
  CashlessPreauthorizationInput,
  ClaimData,
  ReimbursementClaim,
  ReimbursementClaimInput,
} from '../types/claims'
import type { InsuranceProvider } from '../types/insurance'
import { useAuth } from './authStore'
import { useDemoCatalog } from './catalogStore'
import {
  InsuranceWorkspaceContext,
  type ClaimMutationResult,
  type InsuranceWorkspaceContextValue,
} from './insuranceWorkspaceStore'

const claimRepository: ClaimRepository =
  claimRepositoryMode === 'supabase' ? supabaseClaimRepository : demoClaimRepository

const EMPTY_CLAIMS: ClaimData = { preauthorizations: [], reimbursements: [] }

interface LoadedClaims extends ClaimData {
  ownerId: string
  error: string | null
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The demo claim change could not be saved.'
}

function upsert<T extends { id: string }>(records: T[], record: T): T[] {
  return records.some((item) => item.id === record.id)
    ? records.map((item) => (item.id === record.id ? record : item))
    : [record, ...records]
}

export function InsuranceWorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, isDemoMode } = useAuth()
  const { insuranceProviders: demoProviders } = useDemoCatalog()
  const [remoteProviders, setRemoteProviders] = useState<InsuranceProvider[] | null>(null)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [loadedClaims, setLoadedClaims] = useState<LoadedClaims | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (isDemoMode) return
    let active = true

    void loadSupabaseInsuranceProviders()
      .then((providers) => {
        if (!active) return
        setRemoteProviders(providers)
        setCatalogError(null)
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setRemoteProviders([])
        setCatalogError(getErrorMessage(loadError))
      })

    return () => {
      active = false
    }
  }, [isDemoMode])

  useEffect(() => {
    if (!user) return
    let active = true
    const ownerId = user.id

    void claimRepository
      .load(ownerId)
      .then((data) => {
        if (!active) return
        setLoadedClaims({ ownerId, ...data, error: null })
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setLoadedClaims({
          ownerId,
          ...EMPTY_CLAIMS,
          error: getErrorMessage(loadError),
        })
      })

    return () => {
      active = false
    }
  }, [user])

  const currentClaims = user && loadedClaims?.ownerId === user.id ? loadedClaims : null
  const preauthorizations = currentClaims?.preauthorizations ?? EMPTY_CLAIMS.preauthorizations
  const reimbursements = currentClaims?.reimbursements ?? EMPTY_CLAIMS.reimbursements

  const savePreauthorization = useCallback(
    async (
      input: CashlessPreauthorizationInput,
      recordId?: string,
    ): Promise<ClaimMutationResult<CashlessPreauthorization>> => {
      if (!user) return { data: null, error: 'Sign in to track demo pre-authorization.' }
      const ownerId = user.id

      try {
        const record = await claimRepository.savePreauthorization(ownerId, input, recordId)
        setLoadedClaims((state) =>
          state?.ownerId === ownerId
            ? {
                ...state,
                preauthorizations: upsert(state.preauthorizations, record),
                error: null,
              }
            : state,
        )
        setActionError(null)
        return { data: record, error: null }
      } catch (saveError) {
        const message = getErrorMessage(saveError)
        setActionError(message)
        return { data: null, error: message }
      }
    },
    [user],
  )

  const saveReimbursement = useCallback(
    async (
      input: ReimbursementClaimInput,
      recordId?: string,
    ): Promise<ClaimMutationResult<ReimbursementClaim>> => {
      if (!user) return { data: null, error: 'Sign in to track demo reimbursement.' }
      const ownerId = user.id

      try {
        const record = await claimRepository.saveReimbursement(ownerId, input, recordId)
        setLoadedClaims((state) =>
          state?.ownerId === ownerId
            ? {
                ...state,
                reimbursements: upsert(state.reimbursements, record),
                error: null,
              }
            : state,
        )
        setActionError(null)
        return { data: record, error: null }
      } catch (saveError) {
        const message = getErrorMessage(saveError)
        setActionError(message)
        return { data: null, error: message }
      }
    },
    [user],
  )

  const value = useMemo<InsuranceWorkspaceContextValue>(
    () => ({
      providers: isDemoMode ? demoProviders : remoteProviders ?? [],
      preauthorizations,
      reimbursements,
      isCatalogLoading: !isDemoMode && remoteProviders === null,
      isClaimsLoading: Boolean(user) && currentClaims === null,
      error: actionError ?? catalogError ?? currentClaims?.error ?? null,
      savePreauthorization,
      saveReimbursement,
    }),
    [
      isDemoMode,
      demoProviders,
      remoteProviders,
      preauthorizations,
      reimbursements,
      user,
      currentClaims,
      actionError,
      catalogError,
      savePreauthorization,
      saveReimbursement,
    ],
  )

  return (
    <InsuranceWorkspaceContext.Provider value={value}>
      {children}
    </InsuranceWorkspaceContext.Provider>
  )
}
