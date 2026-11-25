import { Pencil, Plus, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { FeedbackBanner, type AdminFeedbackState } from '../../components/admin/FeedbackBanner'
import { InsuranceFormSheet } from '../../components/admin/InsuranceFormSheet'
import {
  adminIconButtonClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
} from '../../components/admin/fieldStyles'
import { PageHeader } from '../../components/common/PageHeader'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Card } from '../../components/ui/Card'
import { FilterChip } from '../../components/ui/FilterChip'
import { SearchBar } from '../../components/ui/SearchBar'
import { useDemoCatalog } from '../../context/catalogStore'
import type { InsuranceProviderInput } from '../../context/catalogStore'
import type { InsuranceProvider } from '../../types/insurance'
import { coverageCategoryMeta } from '../../utils/adminData'

type StatusFilter = 'all' | 'active' | 'inactive'

function ProviderStatus({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? 'inline-flex rounded-full bg-brand-teal-soft px-2 py-0.5 text-[11px] font-semibold text-brand-teal-dark'
          : 'inline-flex rounded-full bg-brand-surface px-2 py-0.5 text-[11px] font-semibold text-brand-navy-soft'
      }
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export function AdminInsurancePage() {
  const {
    hospitals,
    insuranceProviders,
    addInsuranceProvider,
    updateInsuranceProvider,
    setInsuranceProviderActive,
  } = useDemoCatalog()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [formTarget, setFormTarget] = useState<'new' | string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<AdminFeedbackState | null>(null)

  const hospitalName = (id: string) =>
    hospitals.find((hospital) => hospital.id === id)?.name ?? 'Removed hospital'

  const query = search.trim().toLowerCase()
  const filtered = insuranceProviders.filter((provider) => {
    if (statusFilter === 'active' && !provider.active) return false
    if (statusFilter === 'inactive' && provider.active) return false
    if (!query) return true
    return [provider.name, provider.planName, ...provider.hospitalIds.map(hospitalName)]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  const editingProvider =
    formTarget && formTarget !== 'new'
      ? insuranceProviders.find((provider) => provider.id === formTarget) ?? null
      : null
  const detailProvider = detailId
    ? insuranceProviders.find((provider) => provider.id === detailId) ?? null
    : null

  function openNew() {
    if (hospitals.length === 0) {
      setFeedback({
        tone: 'error',
        message: 'Add at least one demo hospital before creating an insurance provider.',
      })
      return
    }
    setFormTarget('new')
    setFeedback(null)
  }

  function handleSave(input: InsuranceProviderInput) {
    if (formTarget === 'new') {
      addInsuranceProvider(input)
      setFeedback({ tone: 'success', message: `${input.name} was added to the demo insurance list.` })
    } else if (formTarget) {
      updateInsuranceProvider(formTarget, input)
      setFeedback({ tone: 'success', message: `${input.name} was updated.` })
    }
    setFormTarget(null)
  }

  function handleToggle(provider: InsuranceProvider) {
    setInsuranceProviderActive(provider.id, !provider.active)
    setFeedback({
      tone: 'success',
      message: `${provider.name} was marked ${provider.active ? 'inactive' : 'active'} for the demo.`,
    })
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin · Insurance"
        title="Insurance providers"
        description="Simulated plans used to prepare the Prompt 9 insurance experience. Acceptance is not verified with any real insurer."
        actions={
          <button type="button" onClick={openNew} className={adminPrimaryButtonClass}>
            <Plus className="size-4" aria-hidden="true" />
            Add provider
          </button>
        }
      />

      {feedback ? (
        <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} className="mb-4" />
      ) : null}

      <p className="mb-4 rounded-xl bg-brand-warning-soft px-3 py-2.5 text-[11px] leading-relaxed text-brand-warning">
        Demo data only. These providers, plans, coverage categories, and hospital networks are
        fictional. Do not present them as verified policies or real insurer relationships.
      </p>

      <Card className="bg-white">
        <SearchBar
          value={search}
          onChange={setSearch}
          label="Search insurance providers"
          placeholder="Search by provider, plan, or hospital"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>
            All statuses
          </FilterChip>
          <FilterChip active={statusFilter === 'active'} onClick={() => setStatusFilter('active')}>
            Active
          </FilterChip>
          <FilterChip active={statusFilter === 'inactive'} onClick={() => setStatusFilter('inactive')}>
            Inactive
          </FilterChip>
        </div>
      </Card>

      <p className="mt-4 text-xs text-brand-navy-soft">
        Showing <span className="font-semibold text-brand-navy">{filtered.length}</span> of{' '}
        {insuranceProviders.length} simulated providers.
      </p>

      {filtered.length === 0 ? (
        <Card className="mt-3 bg-white">
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <ShieldCheck className="size-7 text-brand-navy-soft/50" aria-hidden="true" />
            <p className="text-sm font-semibold text-brand-navy">No providers match</p>
            <p className="max-w-xs text-xs text-brand-navy-soft">
              Try another search term, or add a simulated insurance provider.
            </p>
          </div>
        </Card>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {filtered.map((provider) => (
            <li key={provider.id}>
              <Card className="flex h-full flex-col bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-teal-soft text-brand-teal-dark">
                      <ShieldCheck className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-brand-navy">{provider.name}</h3>
                      <p className="text-[11px] text-brand-navy-soft">{provider.planName}</p>
                    </div>
                  </div>
                  <ProviderStatus active={provider.active} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {provider.coverage.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-brand-blue-soft px-2 py-0.5 text-[10px] font-semibold text-brand-blue"
                    >
                      {coverageCategoryMeta[category].label}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-brand-navy-soft">
                  {provider.hospitalIds.length} accepting demo hospital
                  {provider.hospitalIds.length === 1 ? '' : 's'}
                </p>
                <div className="mt-auto flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setDetailId(provider.id)}
                    className={`${adminSecondaryButtonClass} flex-1`}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggle(provider)}
                    className={`${adminSecondaryButtonClass} flex-1`}
                  >
                    {provider.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormTarget(provider.id)}
                    className={adminIconButtonClass}
                    aria-label={`Edit ${provider.name}`}
                  >
                    <Pencil className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {detailProvider ? (
        <BottomSheet
          title={detailProvider.name}
          description={detailProvider.planName}
          onClose={() => setDetailId(null)}
        >
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-brand-navy">Demo network</p>
            <ProviderStatus active={detailProvider.active} />
          </div>
          <div className="mt-2 space-y-1.5">
            {detailProvider.hospitalIds.length === 0 ? (
              <p className="text-xs text-brand-navy-soft">No accepting hospitals linked.</p>
            ) : (
              detailProvider.hospitalIds.map((id) => (
                <p key={id} className="rounded-lg bg-brand-surface px-3 py-2 text-xs text-brand-navy">
                  {hospitalName(id)}
                </p>
              ))
            )}
          </div>
          <h3 className="mt-4 text-xs font-semibold text-brand-navy">Simulated coverage</h3>
          <ul className="mt-2 space-y-1.5">
            {detailProvider.coverage.map((category) => (
              <li key={category} className="text-xs text-brand-navy-soft">
                <span className="font-medium text-brand-navy">
                  {coverageCategoryMeta[category].label}
                </span>{' '}
                — {coverageCategoryMeta[category].description}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-brand-warning-soft px-3 py-2 text-[11px] leading-relaxed text-brand-warning">
            Not verified with a real insurer. This record exists to prepare future insurance
            features in the demo.
          </p>
          <div className="mt-4 flex flex-col gap-2 border-t border-brand-line pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setFormTarget(detailProvider.id)
                setDetailId(null)
              }}
              className={adminSecondaryButtonClass}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit provider
            </button>
            <button
              type="button"
              onClick={() => {
                handleToggle(detailProvider)
                setDetailId(null)
              }}
              className={adminSecondaryButtonClass}
            >
              {detailProvider.active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </BottomSheet>
      ) : null}

      {formTarget ? (
        <InsuranceFormSheet
          key={formTarget}
          provider={editingProvider ?? undefined}
          hospitals={hospitals}
          onSave={handleSave}
          onClose={() => setFormTarget(null)}
        />
      ) : null}
    </div>
  )
}
