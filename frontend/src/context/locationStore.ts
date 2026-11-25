import { createContext, useContext } from 'react'
import type { DemoLocation } from '../types/domain'

export interface ServiceLocationContextValue {
  location: DemoLocation
  locations: DemoLocation[]
  setLocation: (locationId: string) => void
}

export const ServiceLocationContext = createContext<ServiceLocationContextValue | null>(null)

export function useServiceLocation(): ServiceLocationContextValue {
  const context = useContext(ServiceLocationContext)
  if (context === null) {
    throw new Error('useServiceLocation must be used inside ServiceLocationProvider')
  }
  return context
}
