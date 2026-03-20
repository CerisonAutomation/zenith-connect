import { createClient } from '@/lib/supabase/server'
import { ProfileView } from '@/components/profile/ProfileView'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profile — Zenith Connect' }

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  return <ProfileView profile={profile} isOwn={false} />
}
