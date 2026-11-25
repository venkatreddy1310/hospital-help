import { useCallback, useRef, useState } from 'react'
import type { GeoCoordinates } from '../types/domain'

export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'unsupported'

export interface GeolocationState {
  status: GeolocationStatus
  coordinates: GeoCoordinates | null
  message: string | null
}

export interface UseGeolocationResult extends GeolocationState {
  request: () => void
  clear: () => void
}

const INITIAL_STATE: GeolocationState = {
  status: 'idle',
  coordinates: null,
  message: null,
}

function describeFailure(error: GeolocationPositionError): GeolocationState {
  if (error.code === error.PERMISSION_DENIED) {
    return {
      status: 'denied',
      coordinates: null,
      message:
        'Location permission was denied. Choose a demo area manually to keep using accurate-looking distances.',
    }
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return {
      status: 'unavailable',
      coordinates: null,
      message:
        'Your device location is unavailable. Choose a demo area manually instead.',
    }
  }

  return {
    status: 'timeout',
    coordinates: null,
    message:
      'The location request timed out. Choose a demo area manually instead.',
  }
}

/**
 * Requests approximate device location only on demand. Nothing is stored or
 * sent to the backend; distances are recalculated in the browser.
 */
export function useGeolocation(): UseGeolocationResult {
  const [state, setState] = useState<GeolocationState>(INITIAL_STATE)
  const requestId = useRef(0)

  const request = useCallback(() => {
    const currentRequest = requestId.current + 1
    requestId.current = currentRequest

    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState({
        status: 'unsupported',
        coordinates: null,
        message:
          'This browser does not support geolocation. Choose a demo area manually instead.',
      })
      return
    }

    setState({
      status: 'requesting',
      coordinates: null,
      message: 'Requesting approximate device location…',
    })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (requestId.current !== currentRequest) return
        setState({
          status: 'granted',
          coordinates: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          message:
            'Using approximate device location for straight-line distances. Nothing is stored.',
        })
      },
      (error) => {
        if (requestId.current !== currentRequest) return
        setState(describeFailure(error))
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60_000 },
    )
  }, [])

  const clear = useCallback(() => {
    requestId.current += 1
    setState(INITIAL_STATE)
  }, [])

  return { ...state, request, clear }
}
