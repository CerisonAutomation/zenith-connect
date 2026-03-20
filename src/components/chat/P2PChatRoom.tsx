'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useP2PChat } from '@/hooks/useP2PChat'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export function P2PChatRoom({
  conversationId,
  currentUser,
}: {
  conversationId: string
  currentUser: User
}) {
  const router = useRouter()
  // Extract peer ID from conversationId (format: userId1-userId2 sorted)
  const peerId = conversationId
    .split('-')
    .filter((p) => p !== currentUser.id)[0] ?? ''

  const { messages, reactions, typingPeers, peers, sendMessage, sendReaction, setTyping } =
    useP2PChat(currentUser.id, peerId)

  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(() => {
    const text = draft.trim()
    if (!text) return
    sendMessage(text)
    setDraft('')
    setTyping(false)
  }, [draft, sendMessage, setTyping])

  const handleTyping = (value: string) => {
    setDraft(value)
    setTyping(true)
    clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => setTyping(false), 1500)
  }

  const isOnline = peers.length > 0

  return (
    <div className="flex flex-col h-svh">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Button size="icon" variant="ghost" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <p className="font-medium text-sm">Chat</p>
          <p className={`text-xs ${isOnline ? 'text-green-400' : 'text-muted-foreground'}`}>
            {isOnline ? 'Connected (P2P)' : 'Connecting…'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUser.id}
            reactions={reactions[msg.id] ?? []}
            onReact={(emoji) => sendReaction(msg.id, emoji)}
          />
        ))}
        {typingPeers.size > 0 && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t border-border">
        <Input
          value={draft}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Message…"
          className="flex-1"
          aria-label="Message input"
        />
        <Button size="icon" onClick={handleSend} disabled={!draft.trim()} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
