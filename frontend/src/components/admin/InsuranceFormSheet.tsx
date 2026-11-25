import { useState, type FormEvent } from 'react'
import type { InsuranceProviderInput } from '../../context/catalogStore'
import type { Hospital } from '../../types/domain'
import type {
  CoverageCategory,
  CoverageRule,
  CoverageRules,
  InsuranceProvider,
} from '../../types/insurance'
import { coverageCategoryMeta, coverageCategoryOptions } from '../../utils/adminData'
import { BottomSheet } from '../ui/BottomSheet'
import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from './fieldStyles'

interface InsuranceFormSheetProps {
  provider?: InsuranceProvider
  hospitals: Hospital[]
  onSave: (input: InsuranceProviderInput) => void
  onClose: () => void
}

export function InsuranceFormSheet({
  provider,
  hospitals,
  onSave,
  onClose,
}: InsuranceFormSheetProps) {
  const [name, setName] = useState(provider?.name ?? '')
  const [planName, setPlanName] = useState(provider?.planName ?? '')
  const [coverage, setCoverage] = useState<CoverageCategory[]>(provider?.coverage ?? [])
  const [rules, setRules] = useState<CoverageRules>(provider?.rules ?? {})
  const [hospitalIds, setHospitalIds] = useState<string[]>(
    provider?.hospitalIds.filter((id) => hospitals.some((hospital) => hospital.id === id)) ?? [],
  )
  const [active, setActive] = useState(provider?.active ?? true)
  const [error, setError] = useState<string | null>(null)

  const toggleCoverage = (category: CoverageCategory) => {
    const selected = coverage.includes(category)
    setCoverage((current) =>
      selected
        ? current.filter((item) => item !== category)
        : [...current, category],
    )
    if (!selected && !rules[category]) {
      setRules((current) => ({
        ...current,
        [category]: {
          coPayPercent: 0,
          deductible: 0,
          perClaimLimit: null,
          waitingPeriodDays: 0,
          excluded: false,
          notes: 'Admin-configured demo coverage rule.',
        },
      }))
    }
  }

  const updateRule = <K extends keyof CoverageRule>(
    category: CoverageCategory,
    key: K,
    value: CoverageRule[K],
  ) => {
    setRules((current) => {
      const rule = current[category]
      if (!rule) return current
      return { ...current, [category]: { ...rule, [key]: value } }
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Provider name is required.')
      return
    }
    if (!planName.trim()) {
      setError('Plan name is required for the demo insurance record.')
      return
    }
    if (coverage.length === 0) {
      setError('Select at least one simulated coverage category.')
      return
    }
    if (hospitalIds.length === 0) {
      setError('Select at least one demo hospital that accepts this provider.')
      return
    }
    const invalidRule = coverage.some((category) => {
      const rule = rules[category]
      return (
        !rule ||
        rule.coPayPercent < 0 ||
        rule.coPayPercent > 100 ||
        rule.deductible < 0 ||
        rule.waitingPeriodDays < 0 ||
        (rule.perClaimLimit !== null && rule.perClaimLimit < 0)
      )
    })
    if (invalidRule) {
      setError('Configure valid non-negative rules and co-pay between 0 and 100%.')
      return
    }

    onSave({
      name: name.trim(),
      planName: planName.trim(),
      active,
      coverage,
      rules: Object.fromEntries(
        coverage.map((category) => [category, rules[category]]),
      ) as CoverageRules,
      hospitalIds,
    })
  }

  return (
    <BottomSheet
      title={provider ? 'Edit insurance provider' : 'Add insurance provider'}
      description="Simulated insurer records for demo preparation. No policy or acceptance is verified with a real insurer."
      onClose={onClose}
      panelClassName="sm:max-w-xl"
    >
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-brand-critical/20 bg-brand-critical-soft px-3 py-2 text-xs font-medium text-brand-critical"
          >
            {error}
          </p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={adminLabelClass}>Provider name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={adminInputClass}
              placeholder="e.g. Aarogya Shield"
              maxLength={60}
            />
          </label>
          <label className="block">
            <span className={adminLabelClass}>Plan name</span>
            <input
              value={planName}
              onChange={(event) => setPlanName(event.target.value)}
              className={adminInputClass}
              placeholder="e.g. Essential Care 5L · demo plan"
              maxLength={80}
            />
          </label>
        </div>

        <fieldset>
          <legend className={adminLabelClass}>Coverage categories and demo rules</legend>
          <div className="mt-2 space-y-2">
            {coverageCategoryOptions.map((category) => {
              const rule = rules[category]
              const selected = coverage.includes(category)

              return (
                <div key={category} className="rounded-xl border border-brand-line px-3 py-2.5">
                  <label className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleCoverage(category)}
                      className="mt-0.5 size-4 accent-brand-blue"
                    />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-brand-navy">
                        {coverageCategoryMeta[category].label}
                      </span>
                      <span className="block text-[11px] text-brand-navy-soft">
                        {coverageCategoryMeta[category].description}
                      </span>
                    </span>
                  </label>

                  {selected && rule ? (
                    <div className="mt-3 border-t border-brand-line pt-3">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <label>
                          <span className="text-[10px] font-semibold text-brand-navy-soft">Co-pay %</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={rule.coPayPercent}
                            onChange={(event) => updateRule(category, 'coPayPercent', Number(event.target.value))}
                            className={adminInputClass}
                          />
                        </label>
                        <label>
                          <span className="text-[10px] font-semibold text-brand-navy-soft">Deductible ₹</span>
                          <input
                            type="number"
                            min="0"
                            value={rule.deductible}
                            onChange={(event) => updateRule(category, 'deductible', Number(event.target.value))}
                            className={adminInputClass}
                          />
                        </label>
                        <label>
                          <span className="text-[10px] font-semibold text-brand-navy-soft">Claim limit ₹</span>
                          <input
                            type="number"
                            min="0"
                            value={rule.perClaimLimit ?? ''}
                            onChange={(event) => updateRule(category, 'perClaimLimit', event.target.value === '' ? null : Number(event.target.value))}
                            className={adminInputClass}
                          />
                        </label>
                        <label>
                          <span className="text-[10px] font-semibold text-brand-navy-soft">Waiting days</span>
                          <input
                            type="number"
                            min="0"
                            value={rule.waitingPeriodDays}
                            onChange={(event) => updateRule(category, 'waitingPeriodDays', Number(event.target.value))}
                            className={adminInputClass}
                          />
                        </label>
                      </div>
                      <label className="mt-2 flex items-center gap-2 text-xs font-medium text-brand-navy-soft">
                        <input
                          type="checkbox"
                          checked={rule.excluded}
                          onChange={(event) => updateRule(category, 'excluded', event.target.checked)}
                          className="size-4 accent-brand-blue"
                        />
                        Exclude this category in demo calculations
                      </label>
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className={adminLabelClass}>Accepting demo hospitals</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {hospitals.map((hospital) => (
              <label
                key={hospital.id}
                className="flex items-center gap-2.5 rounded-xl border border-brand-line px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={hospitalIds.includes(hospital.id)}
                  onChange={() =>
                    setHospitalIds((current) =>
                      current.includes(hospital.id)
                        ? current.filter((id) => id !== hospital.id)
                        : [...current, hospital.id],
                    )
                  }
                  className="size-4 accent-brand-blue"
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-brand-navy">
                    {hospital.name}
                  </span>
                  <span className="block text-[11px] text-brand-navy-soft">{hospital.area}</span>
                </span>
              </label>
            ))}
          </div>
          {hospitals.length === 0 ? (
            <p className="mt-2 text-xs text-brand-warning">
              Add a hospital before linking a simulated insurance provider.
            </p>
          ) : null}
        </fieldset>

        <label className="flex items-center gap-2.5 rounded-xl border border-brand-line px-3 py-2.5">
          <input
            type="checkbox"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="size-4 accent-brand-blue"
          />
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-brand-navy">Active provider</span>
            <span className="block text-[11px] text-brand-navy-soft">
              Inactive providers stay visible in admin but are marked unavailable.
            </span>
          </span>
        </label>

        <p className="rounded-xl bg-brand-warning-soft px-3 py-2 text-[11px] leading-relaxed text-brand-warning">
          Demo record only. Coverage, hospital acceptance, and network status are simulated and
          must not be presented as verified insurance information.
        </p>

        <div className="flex flex-col-reverse gap-2 border-t border-brand-line pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className={adminSecondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" className={adminPrimaryButtonClass}>
            {provider ? 'Save changes' : 'Add provider'}
          </button>
        </div>
      </form>
    </BottomSheet>
  )
}
