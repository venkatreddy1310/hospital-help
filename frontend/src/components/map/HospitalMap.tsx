import {
  ArrowRight,
  Crosshair,
  ExternalLink,
  Info,
  Loader2,
  LocateFixed,
  MapPin,
  Maximize,
  Minus,
  Plus,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import type { AvailabilityStatus, GeoCoordinates, Hospital } from '../../types/domain'
import type { HospitalInsuranceEvaluation } from '../../utils/insurance'
import { availabilityMeta, availabilityDotClasses } from '../../utils/availability'
import { cn } from '../../utils/cn'
import {
  HYDERABAD_CENTER,
  formatCoordinates,
  getOpenStreetMapDirectionsUrl,
  getOpenStreetMapLink,
} from '../../utils/geo'
import type { GeolocationStatus } from '../../hooks/useGeolocation'
import { InsuranceStatusBadge } from '../insurance/InsuranceStatusBadge'
import { AvailabilityBadge } from '../ui/AvailabilityBadge'

const CENTER: [number, number] = [HYDERABAD_CENTER.lat, HYDERABAD_CENTER.lng]
const legendStatuses: AvailabilityStatus[] = ['available', 'limited', 'full']

const markerColors: Record<AvailabilityStatus, string> = {
  available: '#0f9d9d',
  limited: '#b45309',
  full: '#b42318',
}

interface HospitalMapProps {
  hospitals: Hospital[]
  locationLabel: string
  initialSelectedId?: string | null
  insuranceEvaluations?: Record<string, HospitalInsuranceEvaluation>
  userCoordinates?: GeoCoordinates | null
  locationStatus?: GeolocationStatus
  locationMessage?: string | null
  onLocate?: () => void
  onClearLocation?: () => void
  className?: string
}

export function HospitalMap({
  hospitals,
  locationLabel,
  initialSelectedId = null,
  insuranceEvaluations,
  userCoordinates = null,
  locationStatus = 'idle',
  locationMessage = null,
  onLocate,
  onClearLocation,
  className,
}: HospitalMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId)

  const markers = useMemo(
    () => hospitals.filter((hospital) => Boolean(hospital.coordinates)),
    [hospitals],
  )
  const selected = markers.find((hospital) => hospital.id === selectedId) ?? null

  const fitAllMarkers = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    const points: Array<[number, number]> = markers.map((hospital) => [
      hospital.coordinates!.lat,
      hospital.coordinates!.lng,
    ])
    if (userCoordinates) points.push([userCoordinates.lat, userCoordinates.lng])

    if (points.length > 1) {
      map.fitBounds(points, { padding: [36, 36], maxZoom: 14 })
    } else if (points.length === 1) {
      map.setView(points[0], 14)
    } else {
      map.setView(CENTER, 12)
    }
  }, [markers, userCoordinates])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const timer = window.setTimeout(() => {
      map.invalidateSize()
      fitAllMarkers()
    }, 60)
    return () => window.clearTimeout(timer)
  }, [fitAllMarkers])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !selected?.coordinates) return
    map.flyTo(
      [selected.coordinates.lat, selected.coordinates.lng],
      Math.max(map.getZoom(), 14),
      { duration: 0.5 },
    )
  }, [selected])

  const isLocating = locationStatus === 'requesting'
  const locationFailed =
    locationStatus === 'denied' ||
    locationStatus === 'unavailable' ||
    locationStatus === 'timeout' ||
    locationStatus === 'unsupported'

  return (
    <div
      role="region"
      aria-label={`Simulated hospital map for ${locationLabel}`}
      className={cn(
        'relative isolate h-[clamp(340px,50vh,460px)] w-full overflow-hidden rounded-3xl border border-brand-line bg-[#e8efea] shadow-sm lg:h-[520px]',
        className,
      )}
    >
      <MapContainer
        ref={mapRef}
        center={CENTER}
        zoom={12}
        minZoom={9}
        maxZoom={18}
        scrollWheelZoom
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        {markers.map((hospital) => {
          const coordinates = hospital.coordinates!
          const isSelected = hospital.id === selectedId

          return (
            <CircleMarker
              key={hospital.id}
              center={[coordinates.lat, coordinates.lng]}
              radius={isSelected ? 12 : 9}
              pathOptions={{
                color: isSelected ? '#0b4a8f' : '#ffffff',
                weight: isSelected ? 3 : 2,
                fillColor: markerColors[hospital.availability],
                fillOpacity: 0.95,
                opacity: 1,
              }}
              eventHandlers={{
                click: () => setSelectedId(hospital.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <span className="text-[11px] font-semibold">{hospital.shortName}</span>
              </Tooltip>
            </CircleMarker>
          )
        })}

        {userCoordinates ? (
          <CircleMarker
            center={[userCoordinates.lat, userCoordinates.lng]}
            radius={7}
            pathOptions={{
              color: '#ffffff',
              weight: 3,
              fillColor: '#0b4a8f',
              fillOpacity: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              Approximate device location (not stored)
            </Tooltip>
          </CircleMarker>
        ) : null}
      </MapContainer>

      <div className="pointer-events-none absolute top-3 left-3 z-[1000] max-w-[70%] rounded-xl bg-white/95 px-3 py-2 shadow-sm ring-1 ring-black/5">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-navy">
          <Info className="size-3.5 shrink-0 text-brand-blue" aria-hidden="true" />
          Simulated hospital pins
        </p>
        <p className="mt-0.5 truncate text-[10px] text-brand-navy-soft">{locationLabel}</p>
        <p className="mt-0.5 text-[9px] leading-tight text-brand-navy-soft/70">
          Coordinates, beds, and networks are demo data. Base tiles are best-effort
          OpenStreetMap.
        </p>
      </div>

      <div className="absolute top-3 right-3 z-[1000] flex flex-col overflow-hidden rounded-xl border border-brand-line bg-white shadow-md">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          aria-label="Zoom in"
          className="flex size-9 items-center justify-center text-brand-navy-soft transition-colors hover:bg-brand-surface hover:text-brand-navy active:bg-brand-blue-soft"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
        <span className="h-px bg-brand-line" aria-hidden="true" />
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          aria-label="Zoom out"
          className="flex size-9 items-center justify-center text-brand-navy-soft transition-colors hover:bg-brand-surface hover:text-brand-navy active:bg-brand-blue-soft"
        >
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <span className="h-px bg-brand-line" aria-hidden="true" />
        <button
          type="button"
          onClick={fitAllMarkers}
          aria-label="Recenter map on simulated hospitals"
          className="flex size-9 items-center justify-center text-brand-blue transition-colors hover:bg-brand-surface active:bg-brand-blue-soft"
        >
          <Maximize className="size-4" aria-hidden="true" />
        </button>
        {onLocate ? (
          <>
            <span className="h-px bg-brand-line" aria-hidden="true" />
            <button
              type="button"
              onClick={onLocate}
              disabled={isLocating}
              aria-label="Use my approximate device location"
              className="flex size-9 items-center justify-center text-brand-blue transition-colors hover:bg-brand-surface active:bg-brand-blue-soft disabled:cursor-wait disabled:opacity-60"
            >
              {isLocating ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LocateFixed className="size-4" aria-hidden="true" />
              )}
            </button>
          </>
        ) : null}
      </div>

      {isLocating ? (
        <p
          role="status"
          className="absolute top-3 left-1/2 z-[1000] -translate-x-1/2 rounded-full bg-brand-navy px-3 py-1.5 text-[10px] font-semibold text-white shadow-md"
        >
          Requesting device location…
        </p>
      ) : null}

      {locationFailed && locationMessage ? (
        <div
          role="status"
          className="absolute top-[5.6rem] left-3 z-[1000] max-w-[min(22rem,72%)] rounded-xl border border-brand-warning/30 bg-brand-warning-soft/95 px-3 py-2 shadow-sm"
        >
          <p className="text-[10px] leading-relaxed text-brand-warning">{locationMessage}</p>
          {onClearLocation ? (
            <button
              type="button"
              onClick={onClearLocation}
              className="mt-1 text-[10px] font-semibold text-brand-blue hover:underline"
            >
              Back to the selected demo area
            </button>
          ) : null}
        </div>
      ) : null}

      <ul
        className="pointer-events-none absolute bottom-6 left-3 z-[1000] flex flex-wrap gap-x-3 gap-y-1 rounded-lg bg-white/90 px-2.5 py-1.5 shadow-sm ring-1 ring-black/5"
        aria-label="Map legend"
      >
        {legendStatuses.map((status) => (
          <li
            key={status}
            className="flex items-center gap-1 text-[10px] font-medium text-brand-navy-soft"
          >
            <span
              className={cn('size-1.5 rounded-full', availabilityDotClasses[status])}
              aria-hidden="true"
            />
            {availabilityMeta[status].shortLabel}
          </li>
        ))}
        <li className="flex items-center gap-1 text-[10px] font-medium text-brand-navy-soft">
          <span className="size-1.5 rounded-full bg-brand-blue ring-1 ring-white" aria-hidden="true" />
          You
        </li>
      </ul>

      <p aria-live="polite" className="sr-only">
        {selected
          ? `${selected.name} selected. ${selected.availableBeds} beds free, ${selected.distanceKm.toFixed(1)} kilometers away.`
          : ''}
      </p>

      {selected ? (
        <div
          role="group"
          aria-label={`${selected.name} preview`}
          className="absolute inset-x-3 bottom-3 z-[1100] rounded-2xl border border-brand-line bg-white p-3.5 shadow-lg sm:right-auto sm:w-[390px]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-brand-navy">{selected.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-brand-navy-soft">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{selected.area}</span>
                <span aria-hidden="true">·</span>
                <span className="shrink-0">{selected.distanceKm.toFixed(1)} km</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              aria-label="Close hospital preview"
              className="-mt-1 -mr-1 shrink-0 rounded-full p-1.5 text-brand-navy-soft transition-colors hover:bg-brand-surface hover:text-brand-navy"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <AvailabilityBadge status={selected.availability} />
            <span className="text-[10px] font-medium text-brand-navy-soft">
              {selected.availableBeds} of {selected.totalBeds} beds free
            </span>
          </div>

          {insuranceEvaluations?.[selected.id] ? (
            <div className="mt-2.5">
              <InsuranceStatusBadge evaluation={insuranceEvaluations[selected.id]} />
              <p className="mt-1 text-[10px] leading-relaxed text-brand-navy-soft">
                A network match is not a guarantee of cashless approval.
              </p>
            </div>
          ) : null}

          <p className="mt-2 flex items-center gap-1 text-[9px] text-brand-navy-soft/70">
            <Crosshair className="size-3" aria-hidden="true" />
            Simulated coordinates {selected.coordinates ? formatCoordinates(selected.coordinates) : 'unavailable'}
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to={`/hospitals/${selected.id}`}
              className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand-blue text-xs font-semibold text-white transition-colors hover:bg-brand-blue-dark"
            >
              View details
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            {selected.coordinates ? (
              <a
                href={getOpenStreetMapDirectionsUrl(selected.coordinates)}
                target="_blank"
                rel="noreferrer noopener"
                className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-brand-line bg-white text-xs font-semibold text-brand-navy transition-colors hover:border-brand-blue/30 hover:text-brand-blue"
              >
                Directions
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
          {selected.coordinates ? (
            <a
              href={getOpenStreetMapLink(selected.coordinates)}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-brand-blue hover:underline"
            >
              Open simulated position in OpenStreetMap
            </a>
          ) : null}
        </div>
      ) : null}

      {markers.length === 0 ? (
        <div className="absolute inset-0 z-[900] flex items-center justify-center">
          <p className="rounded-xl bg-white/95 px-4 py-3 text-xs font-medium text-brand-navy-soft shadow-sm ring-1 ring-black/5">
            No simulated hospitals match the current filters.
          </p>
        </div>
      ) : null}
    </div>
  )
}
