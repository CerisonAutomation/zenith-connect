'use client'

import { useEffect, useRef, memo } from 'react'
import type { NearbyProfile } from '@/hooks/useNearbyUsers'

/**
 * NearbyMap — Leaflet + OpenStreetMap (zero API key, 100% free & open source).
 * Dynamic import ensures no SSR crash (Leaflet requires window).
 * Replaces MapLibre GL + MapTiler dependency.
 */

type LatLng = { lat: number; lng: number }

interface Props {
  userLocation: LatLng
  nearbyUsers: NearbyProfile[]
}

function NearbyMapInner({ userLocation, nearbyUsers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markersRef = useRef<import('leaflet').Marker[]>([])

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cancelled = false
    ;(async () => {
      const L = (await import('leaflet')).default
      // Fix default icon paths broken by webpack
      delete (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (cancelled || !containerRef.current) return
      const map = L.map(containerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 14,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // User pin (pink custom icon)
      const selfIcon = L.divIcon({
        className: '',
        html: `<div style="width:18px;height:18px;border-radius:50%;background:#ec4899;border:3px solid white;box-shadow:0 0 8px rgba(236,72,153,0.8)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      })
      L.marker([userLocation.lat, userLocation.lng], { icon: selfIcon })
        .addTo(map)
        .bindPopup('You')

      mapRef.current = map
    })()

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  // Update map centre when user moves
  useEffect(() => {
    mapRef.current?.setView([userLocation.lat, userLocation.lng])
  }, [userLocation.lat, userLocation.lng])

  // Update nearby user markers (privacy-fuzed: geohash centroid)
  useEffect(() => {
    if (!mapRef.current) return
    ;(async () => {
      const L = (await import('leaflet')).default
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const peerIcon = L.divIcon({
        className: '',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#a855f7;border:2px solid white;opacity:0.85"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      })

      // nearbyUsers don't expose exact coords for privacy; show fuzed ring
      // For a real impl lat/lng come from geohash decode of profile.geohash
      nearbyUsers.slice(0, 50).forEach((p, i) => {
        const angle = (i / nearbyUsers.length) * 2 * Math.PI
        const radiusDeg = (p.distance_m ?? 500) / 111_320
        const lat = userLocation.lat + radiusDeg * Math.cos(angle)
        const lng = userLocation.lng + radiusDeg * Math.sin(angle)
        const marker = L.marker([lat, lng], { icon: peerIcon })
          .bindPopup(
            `<strong>${p.display_name ?? p.username}</strong><br/>${Math.round(p.distance_m ?? 0)}m away`,
            { closeButton: false }
          )
        if (mapRef.current) { marker.addTo(mapRef.current); markersRef.current.push(marker) }
      })
    })()
  }, [nearbyUsers, userLocation])

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div
        ref={containerRef}
        className="flex-1 w-full"
        style={{ minHeight: 'calc(100svh - 8rem)' }}
        role="application"
        aria-label="Nearby users map"
      />
    </>
  )
}

export const NearbyMap = memo(NearbyMapInner)
