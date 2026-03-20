'use client'

import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { ChatMessage, Reaction } from '@/lib/trystero/room'

const QUICK_REACTIONS = ['❤️', '🔥', '😂', '😢', '👏']

export function MessageBubble({
  message,
  isOwn,
  reactions,
  onReact,
}: {
  message: ChatMessage
  isOwn: boolean
  reactions: Reaction[]
  onReact: (emoji: string) => void
}) {
  const grouped = reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted rounded-bl-sm'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {message.edited && <span className="text-[10px] opacity-60 ml-1">(edited)</span>}
      </div>

      {/* Reactions */}
      <div className="flex flex-wrap gap-1">
        {Object.entries(grouped).map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className="flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs hover:bg-muted/80"
          >
            {emoji} <span>{count}</span>
          </button>
        ))}
      </div>

      {/* Quick react (long press sim — hover) */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {QUICK_REACTIONS.map((e) => (
          <button
            key={e}
            onClick={() => onReact(e)}
            className="rounded-full p-1 text-sm hover:bg-muted"
            aria-label={`React ${e}`}
          >
            {e}
          </button>
        ))}
      </div>

      <time className="text-[10px] text-muted-foreground">
        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
      </time>
    </div>
  )
}
