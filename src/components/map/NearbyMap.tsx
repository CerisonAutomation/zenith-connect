'use client'

import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { NearbyProfile } from '@/hooks/useNearbyUsers'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY

export function NearbyMap({
  userLocation,
  nearbyUsers,
}: {
  userLocation: { lat: number; lng: number }
  nearbyUsers: NearbyProfile[]
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAPTILER_KEY
        ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}`
        : 'https://demotiles.maplibre.org/style.json',
      center: [userLocation.lng, userLocation.lat],
      zoom: 13,
    })

    mapRef.current = map

    // User marker (blue)
    new maplibregl.Marker({ color: '#ec4899' })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map)

    return () => map.remove()
  }, [userLocation.lat, userLocation.lng])

  // Update nearby user markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Note: NearbyProfile doesn't expose exact coords for privacy — markers use geohash centroid
    // For full implementation, lat/lng would come from a fuzzed/geohash-centred coord
  }, [nearbyUsers])

  return (
    <div
      ref={mapContainerRef}
      className="flex-1 w-full"
      style={{ minHeight: 'calc(100svh - 8rem)' }}
      role="img"
      aria-label="Nearby users map"
    />
  )
}
