import { createClient } from '@/lib/supabase/server'
import { ConversationList } from '@/components/chat/ConversationList'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Messages — Zenith Connect' }

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .contains('participant_ids', [user!.id])
    .order('last_message_at', { ascending: false })

  return <ConversationList conversations={conversations ?? []} currentUserId={user!.id} />
}
