import type { DemoLocation, Hospital, Specialist } from '../types/domain'

export const NEARBY_RADIUS_KM = 5

export interface DashboardStats {
  nearbyHospitals: number
  nearbyHospitalsWithBeds: number
  nearbyAvailableBeds: number
  availableSpecialists: number
}

export interface AvailabilityCounts {
  available: number
  limited: number
  full: number
  total: number
}

export type InsightKind = 'most-beds' | 'nearest-open' | 'limited' | 'specialists'

export interface DashboardInsight {
  kind: InsightKind
  title: string
  detail: string
}

export type UpdateKind = 'availability' | 'specialists' | 'location'

export interface DemoUpdate {
  kind: UpdateKind
  title: string
  detail: string
}

/** Dashboard totals scoped to the simulated nearby radius around the selected area. */
export function getDashboardStats(
  hospitals: Hospital[],
  specialists: Specialist[],
): DashboardStats {
  const nearby = hospitals.filter((hospital) => hospital.distanceKm <= NEARBY_RADIUS_KM)

  return {
    nearbyHospitals: nearby.length,
    nearbyHospitalsWithBeds: nearby.filter((hospital) => hospital.availableBeds > 0).length,
    nearbyAvailableBeds: nearby.reduce((sum, hospital) => sum + hospital.availableBeds, 0),
    availableSpecialists: specialists.filter((specialist) => specialist.availableToday).length,
  }
}

export function getAvailabilityCounts(hospitals: Hospital[]): AvailabilityCounts {
  const counts: AvailabilityCounts = {
    available: 0,
    limited: 0,
    full: 0,
    total: hospitals.length,
  }

  hospitals.forEach((hospital) => {
    counts[hospital.availability] += 1
  })

  return counts
}

export function getDashboardInsights(
  hospitals: Hospital[],
  specialists: Specialist[],
): DashboardInsight[] {
  const mostBeds = hospitals.reduce<Hospital | null>(
    (best, hospital) =>
      best === null || hospital.availableBeds > best.availableBeds ? hospital : best,
    null,
  )
  const nearestOpen = hospitals
    .filter((hospital) => hospital.availableBeds > 0)
    .reduce<Hospital | null>(
      (best, hospital) =>
        best === null || hospital.distanceKm < best.distanceKm ? hospital : best,
      null,
    )
  const limitedCount = hospitals.filter(
    (hospital) => hospital.availability === 'limited',
  ).length
  const availableSpecialists = specialists.filter(
    (specialist) => specialist.availableToday,
  ).length

  return [
    {
      kind: 'most-beds',
      title: 'Most beds free',
      detail: mostBeds
        ? `${mostBeds.name} · ${mostBeds.availableBeds} beds`
        : 'No demo hospital has beds free',
    },
    {
      kind: 'nearest-open',
      title: 'Closest with beds free',
      detail: nearestOpen
        ? `${nearestOpen.name} · ${nearestOpen.distanceKm.toFixed(1)} km`
        : 'No demo hospital has beds free',
    },
    {
      kind: 'limited',
      title: 'Limited availability',
      detail: `${limitedCount} of ${hospitals.length} demo hospitals`,
    },
    {
      kind: 'specialists',
      title: 'Specialists available today',
      detail: `${availableSpecialists} of ${specialists.length} demo specialists`,
    },
  ]
}

export function getDemoUpdates(
  hospitals: Hospital[],
  specialists: Specialist[],
  location: DemoLocation,
): DemoUpdate[] {
  const hospitalsWithBeds = hospitals.filter((hospital) => hospital.availableBeds > 0)
  const availableBeds = hospitals.reduce((sum, hospital) => sum + hospital.availableBeds, 0)
  const availableSpecialists = specialists.filter(
    (specialist) => specialist.availableToday,
  ).length

  return [
    {
      kind: 'availability',
      title: 'Availability snapshot',
      detail: `${availableBeds} beds reported free across ${hospitalsWithBeds.length} of ${hospitals.length} demo hospitals.`,
    },
    {
      kind: 'specialists',
      title: 'Specialist demo slots',
      detail: `${availableSpecialists} of ${specialists.length} specialists have demo slots today.`,
    },
    {
      kind: 'location',
      title: 'Location selection',
      detail: `Nearby results now follow ${location.area}, ${location.city}.`,
    },
  ]
}
