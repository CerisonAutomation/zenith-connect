'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle } from 'lucide-react'
import type { Database } from '@/types/supabase'

type Conversation = Database['public']['Tables']['conversations']['Row']

export function ConversationList({
  conversations,
  currentUserId,
}: {
  conversations: Conversation[]
  currentUserId: string
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <MessageCircle className="h-10 w-10" />
        <p>No conversations yet</p>
        <p className="text-sm">Find someone nearby to start chatting</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      <h1 className="px-4 py-3 text-lg font-semibold">Messages</h1>
      {conversations.map((conv) => {
        const peerId = conv.participant_ids.find((id) => id !== currentUserId)
        return (
          <Link
            key={conv.id}
            href={`/chat/${conv.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{peerId?.slice(0, 8)}…</p>
              {conv.last_message && (
                <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
              )}
            </div>
            {conv.last_message_at && (
              <p className="text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
              </p>
            )}
          </Link>
        )
      })}
    </div>
  )
}
