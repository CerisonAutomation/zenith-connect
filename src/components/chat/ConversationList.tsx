'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, BadgeCheck } from 'lucide-react'

interface ConversationWithPeer {
  id: string
  participant_ids: string[]
  last_message: string | null
  last_message_at: string | null
  peer: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    is_verified: boolean
    is_premium: boolean
  } | null
}

export function ConversationList({
  conversations,
  currentUserId,
}: {
  conversations: ConversationWithPeer[]
  currentUserId: string
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <MessageCircle className="h-10 w-10" />
        <p className="font-medium">No conversations yet</p>
        <p className="text-sm">Find someone nearby to start chatting</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      <h1 className="px-4 py-3 text-lg font-semibold">Messages</h1>
      {conversations.map((conv) => (
        <Link
          key={conv.id}
          href={`/chat/${conv.id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          {/* Avatar */}
          <div className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden bg-muted">
            {conv.peer?.avatar_url ? (
              <Image
                src={conv.peer.avatar_url}
                alt={conv.peer.display_name ?? conv.peer.username}
                fill
                className="object-cover"
                sizes="44px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-lg">👤</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="font-medium text-sm truncate">
                {conv.peer?.display_name ?? conv.peer?.username ?? 'Unknown'}
              </p>
              {conv.peer?.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
            </div>
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
      ))}
    </div>
  )
}
