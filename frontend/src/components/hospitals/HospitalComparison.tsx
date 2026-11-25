import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Hospital } from '../../types/domain'
import { getEmergencyFacilities } from '../../utils/facilities'
import { AvailabilityBadge } from '../ui/AvailabilityBadge'

interface HospitalComparisonProps {
  hospitals: Hospital[]
  locationLabel: string
  onRemove: (id: string) => void
}

interface ComparisonRow {
  label: string
  render: (hospital: Hospital) => ReactNode
}

export function HospitalComparison({
  hospitals,
  locationLabel,
  onRemove,
}: HospitalComparisonProps) {
  const rows: ComparisonRow[] = [
    {
      label: 'Distance',
      render: (hospital) => (
        <span>
          <span className="font-semibold text-brand-navy">
            {hospital.distanceKm.toFixed(1)} km
          </span>
          <span className="mt-0.5 block text-[10px]">from {locationLabel}</span>
        </span>
      ),
    },
    {
      label: 'Availability',
      render: (hospital) => <AvailabilityBadge status={hospital.availability} />,
    },
    {
      label: 'Available beds',
      render: (hospital) => (
        <span className="text-base font-bold text-brand-navy">{hospital.availableBeds}</span>
      ),
    },
    {
      label: 'Total beds',
      render: (hospital) => (
        <span className="font-medium text-brand-navy">{hospital.totalBeds}</span>
      ),
    },
    {
      label: 'ICU beds',
      render: (hospital) =>
        hospital.icuBeds === undefined ? (
          <span className="text-[11px] text-brand-navy-soft/70">Not listed</span>
        ) : hospital.icuBeds === 0 ? (
          <span className="text-[11px] text-brand-navy-soft/70">No ICU listed</span>
        ) : (
          <span className="text-[11px]">
            <span className="font-semibold text-brand-navy">
              {hospital.availableIcuBeds ?? 0}
            </span>{' '}
            of {hospital.icuBeds} free
          </span>
        ),
    },
    {
      label: 'Simulated rating',
      render: (hospital) =>
        hospital.rating === undefined ? (
          <span className="text-[11px] text-brand-navy-soft/70">Not listed</span>
        ) : (
          <span>
            <span className="font-semibold text-brand-navy">
              {hospital.rating.toFixed(1)} / 5
            </span>
            <span className="mt-0.5 block text-[10px]">
              {(hospital.reviewCount ?? 0).toLocaleString('en-IN')} reviews
            </span>
          </span>
        ),
    },
    {
      label: 'Emergency facilities',
      render: (hospital) => {
        const facilities = getEmergencyFacilities(hospital)

        return facilities.length > 0 ? (
          <ul className="space-y-1">
            {facilities.map((facility) => (
              <li key={facility} className="text-[11px] leading-snug">
                {facility}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-[11px] text-brand-navy-soft/70">Not listed</span>
        )
      },
    },
    {
      label: 'Services',
      render: (hospital) => (
        <ul className="flex flex-wrap gap-1">
          {hospital.specialties.map((specialty) => (
            <li
              key={specialty}
              className="rounded-md bg-brand-surface px-1.5 py-0.5 text-[10px] font-medium text-brand-navy-soft"
            >
              {specialty}
            </li>
          ))}
        </ul>
      ),
    },
  ]

  return (
    <div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-brand-line">
        <table className="w-full min-w-[560px] border-collapse text-left text-xs">
          <caption className="sr-only">
            Comparison of {hospitals.length} simulated hospitals near {locationLabel}
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 w-28 bg-brand-surface p-2.5 align-top text-[10px] font-semibold tracking-wide text-brand-navy-soft/70 uppercase"
              >
                Hospital
              </th>
              {hospitals.map((hospital) => (
                <th
                  key={hospital.id}
                  scope="col"
                  className="min-w-[150px] bg-brand-surface p-2.5 align-top"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs leading-snug font-semibold text-brand-navy">
                        {hospital.name}
                      </p>
                      <p className="mt-0.5 text-[10px] font-normal text-brand-navy-soft">
                        {hospital.area}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(hospital.id)}
                      aria-label={`Remove ${hospital.name} from comparison`}
                      className="shrink-0 rounded-full p-1 text-brand-navy-soft transition-colors hover:bg-white hover:text-brand-critical"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-brand-line">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white p-2.5 align-top text-[10px] font-semibold tracking-wide text-brand-navy-soft uppercase"
                >
                  {row.label}
                </th>
                {hospitals.map((hospital) => (
                  <td
                    key={hospital.id}
                    className="p-2.5 align-top text-brand-navy-soft"
                  >
                    {row.render(hospital)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[10px] text-brand-navy-soft sm:hidden">
        Swipe the table sideways to see every hospital.
      </p>
      <p className="mt-3 text-[10px] leading-relaxed text-brand-navy-soft/80">
        Only values from the simulated demo dataset are shown. Missing facilities appear as
        &ldquo;Not listed&rdquo; and no contact details are included.
      </p>
    </div>
  )
}
