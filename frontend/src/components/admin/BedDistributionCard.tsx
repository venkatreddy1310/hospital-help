import { BedDouble } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Hospital } from '../../types/domain'
import { getAvailabilityCounts } from '../../utils/dashboard'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

const statusRows = [
  { key: 'available', label: 'Available', dotClass: 'bg-brand-teal' },
  { key: 'limited', label: 'Limited', dotClass: 'bg-brand-warning' },
  { key: 'full', label: 'Full', dotClass: 'bg-brand-critical' },
] as const

export function BedDistributionCard({ hospitals }: { hospitals: Hospital[] }) {
  const counts = getAvailabilityCounts(hospitals)
  const totalBeds = hospitals.reduce((sum, hospital) => sum + hospital.totalBeds, 0)
  const availableBeds = hospitals.reduce(
    (sum, hospital) => sum + hospital.availableBeds,
    0,
  )
  const occupiedBeds = Math.max(0, totalBeds - availableBeds)
  const freePercent = totalBeds > 0 ? Math.round((availableBeds / totalBeds) * 100) : 0

  return (
    <Card className="bg-white">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-navy">
            <BedDouble className="size-4 text-brand-teal-dark" aria-hidden="true" />
            Bed availability distribution
          </h2>
          <p className="mt-1 text-[11px] text-brand-navy-soft">
            Simulated capacity across {hospitals.length} demo hospital
            {hospitals.length === 1 ? '' : 's'}.
          </p>
        </div>
        <Badge tone="neutral">Simulated</Badge>
      </div>

      {hospitals.length > 0 ? (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {statusRows.map((row) => (
              <div key={row.key} className="rounded-xl bg-brand-surface/75 px-2.5 py-2">
                <p className="flex items-center gap-1.5 text-[9px] font-semibold tracking-wide text-brand-navy-soft/75 uppercase">
                  <span
                    className={`size-1.5 rounded-full ${row.dotClass}`}
                    aria-hidden="true"
                  />
                  {row.label}
                </p>
                <p className="mt-1 text-lg leading-none font-bold text-brand-navy">
                  {counts[row.key]}
                </p>
                <p className="mt-0.5 text-[9px] text-brand-navy-soft">hospitals</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-medium text-brand-navy-soft">
              <span>Beds free across the demo</span>
              <span>{freePercent}% free</span>
            </div>
            <div
              className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-brand-surface"
              role="img"
              aria-label={`${availableBeds} beds free and ${occupiedBeds} occupied out of ${totalBeds} total simulated beds.`}
            >
              <div
                className="h-full bg-brand-teal"
                style={{ width: `${freePercent}%` }}
              />
              <div
                className="h-full bg-brand-navy/20"
                style={{ width: `${100 - freePercent}%` }}
              />
            </div>
            <dl className="mt-2.5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-brand-teal-soft/60 px-2 py-1.5">
                <dt className="text-[9px] font-semibold text-brand-teal-dark uppercase">
                  Free
                </dt>
                <dd className="text-sm font-bold text-brand-teal-dark">{availableBeds}</dd>
              </div>
              <div className="rounded-lg bg-brand-surface px-2 py-1.5">
                <dt className="text-[9px] font-semibold text-brand-navy-soft uppercase">
                  Occupied
                </dt>
                <dd className="text-sm font-bold text-brand-navy">{occupiedBeds}</dd>
              </div>
              <div className="rounded-lg bg-brand-surface px-2 py-1.5">
                <dt className="text-[9px] font-semibold text-brand-navy-soft uppercase">
                  Total
                </dt>
                <dd className="text-sm font-bold text-brand-navy">{totalBeds}</dd>
              </div>
            </dl>
          </div>
        </>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-brand-line bg-brand-surface/60 px-4 py-3 text-xs text-brand-navy-soft">
          No demo hospitals are registered. Add a hospital to restore the simulated
          capacity view.
        </p>
      )}

      <Link
        to="/admin/hospitals"
        className="mt-3 inline-flex text-[11px] font-semibold text-brand-blue hover:underline"
      >
        Manage hospitals
      </Link>
    </Card>
  )
}
