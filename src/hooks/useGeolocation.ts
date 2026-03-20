'use client'

import { useEffect, useState } from 'react'
import { parseGeo } from '@/lib/utils'

export function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setLocation(parseGeo(pos)),
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { location, error }
}
