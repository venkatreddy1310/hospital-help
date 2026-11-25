import type { GeoCoordinates, Hospital } from '../types/domain'

/** Approximate demonstration centre for the simulated Hyderabad hospital set. */
export const HYDERABAD_CENTER: GeoCoordinates = { lat: 17.4239, lng: 78.4738 }

export function distanceInKilometers(from: GeoCoordinates, to: GeoCoordinates): number {
  const radians = (degrees: number) => degrees * Math.PI / 180
  const earthRadiusKm = 6371
  const latDelta = radians(to.lat - from.lat)
  const lngDelta = radians(to.lng - from.lng)
  const fromLat = radians(from.lat)
  const toLat = radians(to.lat)
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * Replaces the simulated area distance with a straight-line distance from the
 * supplied coordinates. This is used only when the visitor grants approximate
 * browser geolocation; the value is not a driving distance.
 */
export function getHospitalsForCoordinates(
  hospitals: Hospital[],
  coordinates: GeoCoordinates | null,
): Hospital[] {
  if (!coordinates) return hospitals
  return hospitals.map((hospital) => ({
    ...hospital,
    distanceKm: hospital.coordinates
      ? distanceInKilometers(coordinates, hospital.coordinates)
      : hospital.distanceKm,
  }))
}

export function sortHospitalsByDistance(hospitals: Hospital[]): Hospital[] {
  return [...hospitals].sort((a, b) => a.distanceKm - b.distanceKm)
}

export function formatCoordinates(coordinates: GeoCoordinates): string {
  return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
}

export function getOpenStreetMapDirectionsUrl(destination: GeoCoordinates): string {
  const target = `${destination.lat.toFixed(5)}%2C${destination.lng.toFixed(5)}`
  return `https://www.openstreetmap.org/directions?from=&to=${target}`
}

export function getOpenStreetMapLink(coordinates: GeoCoordinates): string {
  return `https://www.openstreetmap.org/?mlat=${coordinates.lat.toFixed(5)}&mlon=${coordinates.lng.toFixed(5)}#map=16/${coordinates.lat.toFixed(5)}/${coordinates.lng.toFixed(5)}`
}
