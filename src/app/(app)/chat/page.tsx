import { createClient } from '@/lib/supabase/server'
import { getConversationsWithProfiles } from '@/lib/supabase/queries'
import { ConversationList } from '@/components/chat/ConversationList'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Messages — Zenith Connect' }

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Single batched query — no N+1
  const conversations = await getConversationsWithProfiles(supabase, user!.id)

  return <ConversationList conversations={conversations} currentUserId={user!.id} />
}
