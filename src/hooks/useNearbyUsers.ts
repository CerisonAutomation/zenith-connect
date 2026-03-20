'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface NearbyProfile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  distance_m: number
  age: number | null
  looking_for: string[]
  is_verified: boolean
  is_premium: boolean
  last_seen: string
}

export function useNearbyUsers(
  lat: number | null,
  lng: number | null,
  radiusMetres = 10000
) {
  const supabase = createClient()

  return useQuery<NearbyProfile[]>({
    queryKey: ['nearby', lat, lng, radiusMetres],
    queryFn: async () => {
      if (!lat || !lng) return []
      const { data, error } = await supabase.rpc('nearby_profiles', {
        user_lat: lat,
        user_lng: lng,
        radius_m: radiusMetres,
      })
      if (error) throw error
      return (data as NearbyProfile[]) ?? []
    },
    enabled: !!lat && !!lng,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}
