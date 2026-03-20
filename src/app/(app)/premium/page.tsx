import type { Metadata } from 'next'
import { PremiumPlans } from '@/components/subscription/PremiumPlans'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Go Premium — Zenith Connect' }

export default async function PremiumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  if (profile?.is_premium) redirect('/settings')

  return <PremiumPlans userId={user.id} />
}
