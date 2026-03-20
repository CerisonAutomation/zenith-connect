'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface AppNotification {
  id: string
  type: 'new_message' | 'new_match' | 'profile_view'
  fromUserId: string
  read: boolean
  createdAt: string
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Subscribe to realtime notification inserts
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as AppNotification
          setNotifications((prev) => [n, ...prev])
          setUnreadCount((c) => c + 1)
        }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [userId, supabase])

  const markAllRead = () => setUnreadCount(0)

  return { notifications, unreadCount, markAllRead }
}
