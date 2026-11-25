import { UsersRound } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '../../components/common/PageHeader'
import { Card } from '../../components/ui/Card'
import { SearchBar } from '../../components/ui/SearchBar'
import { useDemoCatalog } from '../../context/catalogStore'
import { useAppointments } from '../../context/appointmentStore'
import type { DemoPatientAccount } from '../../types/admin'
import { getPatientAppointmentSummary } from '../../utils/adminInsights'
import { formatLongDate } from '../../utils/dateTime'

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-brand-surface px-2.5 py-2 text-center">
      <p className="text-sm font-bold text-brand-navy">{value}</p>
      <p className="text-[10px] font-semibold text-brand-navy-soft uppercase">{label}</p>
    </div>
  )
}

export function AdminPatientsPage() {
  const { patientAccounts, insuranceProviders } = useDemoCatalog()
  const { appointments } = useAppointments()
  const [search, setSearch] = useState('')

  const providerName = (id: string | null) => {
    if (!id) return 'No provider linked'
    return insuranceProviders.find((provider) => provider.id === id)?.name ?? 'Provider removed'
  }

  const query = search.trim().toLowerCase()
  const filteredAccounts = patientAccounts.filter((account: DemoPatientAccount) => {
    if (!query) return true
    return [
      account.primaryName,
      account.area,
      ...account.members.map((member) => member.name),
    ]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })

  return (
    <div>
      <PageHeader
        eyebrow="Admin · Patients"
        title="Patients & families"
        description="Simulated accounts and their family profiles. No medical history or sensitive health details are shown here."
      />

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-line bg-white px-3 py-3">
          <p className="text-[11px] font-semibold text-brand-navy-soft uppercase">Demo accounts</p>
          <p className="mt-1 text-xl font-bold text-brand-navy">{patientAccounts.length}</p>
        </div>
        <div className="rounded-2xl border border-brand-line bg-white px-3 py-3">
          <p className="text-[11px] font-semibold text-brand-navy-soft uppercase">Family profiles</p>
          <p className="mt-1 text-xl font-bold text-brand-navy">
            {patientAccounts.reduce(
              (sum, account) =>
                sum + account.members.filter((member) => member.relationship !== 'Self').length,
              0,
            )}
          </p>
        </div>
        <div className="rounded-2xl border border-brand-line bg-white px-3 py-3">
          <p className="text-[11px] font-semibold text-brand-navy-soft uppercase">Linked appointments</p>
          <p className="mt-1 text-xl font-bold text-brand-navy">{appointments.length}</p>
        </div>
      </div>

      <Card className="bg-white">
        <SearchBar
          value={search}
          onChange={setSearch}
          label="Search patients"
          placeholder="Search by account holder, family member, or area"
        />
      </Card>

      <p className="mt-4 text-xs text-brand-navy-soft">
        Showing <span className="font-semibold text-brand-navy">{filteredAccounts.length}</span> of{' '}
        {patientAccounts.length} simulated accounts.
      </p>

      {filteredAccounts.length === 0 ? (
        <Card className="mt-3 bg-white">
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <UsersRound className="size-7 text-brand-navy-soft/50" aria-hidden="true" />
            <p className="text-sm font-semibold text-brand-navy">No patients match</p>
            <p className="max-w-xs text-xs text-brand-navy-soft">
              Try a different name or area.
            </p>
          </div>
        </Card>
      ) : (
        <ul className="mt-3 space-y-3">
          {filteredAccounts.map((account) => {
            const summary = getPatientAppointmentSummary(account, appointments)
            return (
              <li key={account.id}>
                <Card className="bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-brand-navy">{account.primaryName}</h2>
                      <p className="text-[11px] text-brand-navy-soft">
                        {account.area} · Demo member since {formatLongDate(account.memberSince)}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-blue-soft px-2.5 py-1 text-[11px] font-semibold text-brand-blue">
                      {account.members.length} profile{account.members.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <ul className="mt-3 divide-y divide-brand-line rounded-xl border border-brand-line">
                    {account.members.map((member) => (
                      <li
                        key={member.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-brand-navy">{member.name}</p>
                          <p className="text-[11px] text-brand-navy-soft">
                            {member.relationship} · Age band {member.ageBand}
                          </p>
                        </div>
                        <span className="text-[11px] text-brand-navy-soft">
                          {providerName(member.insuranceProviderId)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    <SummaryItem label="Total" value={summary.total} />
                    <SummaryItem label="Upcoming" value={summary.upcoming} />
                    <SummaryItem label="Completed" value={summary.completed} />
                    <SummaryItem label="Cancelled" value={summary.cancelled} />
                  </div>
                </Card>
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-4 rounded-xl bg-brand-surface px-3 py-2.5 text-[11px] leading-relaxed text-brand-navy-soft">
        These accounts are simulated for the demo. Insurance links show the provider name only,
        and no clinical notes, diagnoses, or policy numbers are stored or displayed.
      </p>
    </div>
  )
}
