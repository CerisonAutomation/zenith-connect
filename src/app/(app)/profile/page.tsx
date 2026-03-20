import { createClient } from '@/lib/supabase/server'
import { ProfileView } from '@/components/profile/ProfileView'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Profile — Zenith Connect' }

export default async function MyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return <ProfileView profile={profile} isOwn />
}
