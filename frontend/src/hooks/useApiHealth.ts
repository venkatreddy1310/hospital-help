import { useCallback, useEffect, useState } from 'react'
import { getHealth } from '../services/api'
import type { HealthStatus } from '../types/api'

export type ApiHealthState =
  | { status: 'loading'; data: null; error: null }
  | { status: 'online'; data: HealthStatus; error: null }
  | { status: 'offline'; data: null; error: string }

export type UseApiHealthResult = ApiHealthState & {
  refresh: () => void
}

export function useApiHealth(): UseApiHealthResult {
  const [state, setState] = useState<ApiHealthState>({
    status: 'loading',
    data: null,
    error: null,
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getHealth(controller.signal)
      .then((data) => setState({ status: 'online', data, error: null }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const message =
          error instanceof Error ? error.message : 'The API could not be reached.'
        setState({ status: 'offline', data: null, error: message })
      })

    return () => controller.abort()
  }, [attempt])

  const refresh = useCallback(() => {
    setState({ status: 'loading', data: null, error: null })
    setAttempt((current) => current + 1)
  }, [])

  return { ...state, refresh }
}
