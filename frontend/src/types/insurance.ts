export type CoverageCategory =
  | 'general-hospitalization'
  | 'emergency'
  | 'icu'
  | 'surgery'
  | 'diagnostics'

export interface CoverageRule {
  coPayPercent: number
  deductible: number
  perClaimLimit: number | null
  waitingPeriodDays: number
  excluded: boolean
  notes: string
}

export type CoverageRules = Partial<Record<CoverageCategory, CoverageRule>>

export interface InsuranceProvider {
  id: string
  name: string
  planName: string
  active: boolean
  coverage: CoverageCategory[]
  rules: CoverageRules
  /** Demo hospitals that accept this simulated provider. */
  hospitalIds: string[]
  /** False when the provider's hospital network could not be loaded. */
  networkLoaded?: boolean
  updatedAt: string
}
