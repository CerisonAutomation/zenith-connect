import { createClient } from '@/lib/supabase/server'
import { DiscoverView } from '@/components/discover/DiscoverView'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Discover — Zenith Connect' }

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch nearby profiles server-side (PostGIS query happens in component via RPC)
  return <DiscoverView userId={user!.id} />
}
