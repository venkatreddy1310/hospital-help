import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { demoLocations } from '../utils/demoData'
import { ServiceLocationContext } from './locationStore'

export function ServiceLocationProvider({ children }: { children: ReactNode }) {
  const [locationId, setLocationId] = useState(demoLocations[0].id)
  const location = demoLocations.find((item) => item.id === locationId) ?? demoLocations[0]

  const setLocation = useCallback((nextId: string) => {
    if (demoLocations.some((item) => item.id === nextId)) {
      setLocationId(nextId)
    }
  }, [])

  const value = useMemo(
    () => ({ location, locations: demoLocations, setLocation }),
    [location, setLocation],
  )

  return (
    <ServiceLocationContext.Provider value={value}>{children}</ServiceLocationContext.Provider>
  )
}
