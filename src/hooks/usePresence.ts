'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface PresenceState {
  userId: string
  lat?: number
  lng?: number
  online_at: string
}

export function usePresence(userId: string | null, lat: number | null, lng: number | null) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const channel = supabase.channel('presence:global', {
      config: { presence: { key: userId } },
    })

    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {})
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            lat: lat ?? undefined,
            lng: lng ?? undefined,
            online_at: new Date().toISOString(),
          } satisfies PresenceState)
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [userId, lat, lng, supabase])

  return channelRef
}
