'use client'

import { useParams } from 'next/navigation'
import { P2PChatRoom } from '@/components/chat/P2PChatRoom'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

export default function ChatRoomPage() {
  const params = useParams<{ id: string }>()
  const { user } = useSupabaseUser()

  if (!user) return null

  return <P2PChatRoom conversationId={params.id} currentUser={user} />
}
