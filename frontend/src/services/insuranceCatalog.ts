import type {
  CoverageCategory,
  CoverageRule,
  InsuranceProvider,
} from '../types/insurance'
import { supabase } from './supabaseClient'

interface ProviderRow {
  id: string
  name: string
  plan_name: string
  active: boolean
  coverage: CoverageCategory[]
  updated_at: string
}

interface NetworkRow {
  provider_id: string
  hospitals: { code: string } | { code: string }[] | null
}

interface CoverageRuleRow {
  provider_id: string
  category: CoverageCategory
  co_pay_percent: number
  deductible: number
  per_claim_limit: number | null
  waiting_period_days: number
  excluded: boolean
  notes: string
}

function networkCode(row: NetworkRow): string | null {
  if (Array.isArray(row.hospitals)) return row.hospitals[0]?.code ?? null
  return row.hospitals?.code ?? null
}

export async function loadSupabaseInsuranceProviders(): Promise<InsuranceProvider[]> {
  if (!supabase) return []

  const [providerResult, networkResult, ruleResult] = await Promise.all([
    supabase.from('insurance_providers').select('*'),
    supabase.from('insurance_hospital_network').select('provider_id, hospitals(code)'),
    supabase.from('insurance_coverage_rules').select('*'),
  ])

  if (providerResult.error) {
    throw new Error('Demo insurance providers could not be loaded.')
  }

  // Hospital networks and coverage rules live in separate tables that may not be
  // applied yet. A missing table degrades to "unknown" instead of blocking the
  // whole catalog, so policies still load and the UI can say why it is unsure.
  const networkLoaded = !networkResult.error

  const providers = (providerResult.data ?? []) as ProviderRow[]
  const networks = (networkResult.error ? [] : (networkResult.data ?? [])) as NetworkRow[]
  const rules = (ruleResult.error ? [] : (ruleResult.data ?? [])) as CoverageRuleRow[]

  return providers.map((provider) => {
    const providerRules = rules.filter((rule) => rule.provider_id === provider.id)

    return {
      id: provider.id,
      name: provider.name,
      planName: provider.plan_name,
      active: provider.active,
      coverage: provider.coverage ?? [],
      hospitalIds: networks
        .filter((network) => network.provider_id === provider.id)
        .map(networkCode)
        .filter((code): code is string => Boolean(code)),
      networkLoaded,
      rules: Object.fromEntries(
        providerRules.map((rule) => [
          rule.category,
          {
            coPayPercent: Number(rule.co_pay_percent),
            deductible: Number(rule.deductible),
            perClaimLimit:
              rule.per_claim_limit === null ? null : Number(rule.per_claim_limit),
            waitingPeriodDays: rule.waiting_period_days,
            excluded: rule.excluded,
            notes: rule.notes,
          } satisfies CoverageRule,
        ]),
      ),
      updatedAt: provider.updated_at,
    }
  })
}
