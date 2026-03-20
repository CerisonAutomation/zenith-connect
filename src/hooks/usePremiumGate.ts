'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useSupabaseUser } from './useSupabaseUser'

export function usePremiumGate() {
  const { user } = useSupabaseUser()
  const supabase = createClient()

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, is_verified')
        .eq('id', user.id)
        .single()
      return data
    },
    enabled: !!user,
    staleTime: 300_000,
  })

  return {
    isPremium: profile?.is_premium ?? false,
    isVerified: profile?.is_verified ?? false,
    /** Gate a callback — shows upgrade prompt if not premium */
    requirePremium: (cb: () => void, onDeny?: () => void) => {
      if (profile?.is_premium) cb()
      else onDeny?.()
    },
  }
}
