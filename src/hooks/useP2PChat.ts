'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createChatRoom, type ChatMessage, type Reaction, type ChatRoom } from '@/lib/trystero/room'
import { chatRoomId } from '@/lib/utils'
import { v4 as uuid } from 'uuid'

export function useP2PChat(currentUserId: string, peerId: string) {
  const roomRef = useRef<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({})
  const [typingPeers, setTypingPeers] = useState<Set<string>>(new Set())
  const [peers, setPeers] = useState<string[]>([])

  useEffect(() => {
    const roomId = chatRoomId(currentUserId, peerId)
    const chatRoom = createChatRoom(roomId)
    roomRef.current = chatRoom

    chatRoom.onMsg((msg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev
        return [...prev, msg].sort((a, b) => a.timestamp - b.timestamp)
      })
    })

    chatRoom.onReaction((reaction) => {
      setReactions((prev) => ({
        ...prev,
        [reaction.messageId]: [
          ...(prev[reaction.messageId] ?? []).filter((r) => r.senderId !== reaction.senderId),
          reaction,
        ],
      }))
    })

    chatRoom.onTyping((payload) => {
      setTypingPeers((prev) => {
        const next = new Set(prev)
        if (payload.isTyping) next.add(payload.userId)
        else next.delete(payload.userId)
        return next
      })
    })

    chatRoom.onEdit(({ messageId, content }) => {
      setMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, content, edited: true } : m))
    })

    chatRoom.onUnsend(({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    })

    chatRoom.onPeerJoin((peerId) => setPeers((p) => [...new Set([...p, peerId])]))
    chatRoom.onPeerLeave((peerId) => setPeers((p) => p.filter((id) => id !== peerId)))

    return () => chatRoom.leave()
  }, [currentUserId, peerId])

  const sendMessage = useCallback((content: string) => {
    if (!roomRef.current) return
    const msg: ChatMessage = {
      id: uuid(),
      senderId: currentUserId,
      content,
      timestamp: Date.now(),
      type: 'text',
    }
    roomRef.current.sendMsg(msg)
    setMessages((prev) => [...prev, msg])
  }, [currentUserId])

  const sendReaction = useCallback((messageId: string, emoji: string) => {
    roomRef.current?.sendReaction({ messageId, emoji, senderId: currentUserId })
  }, [currentUserId])

  const setTyping = useCallback((isTyping: boolean) => {
    roomRef.current?.sendTyping({ userId: currentUserId, isTyping })
  }, [currentUserId])

  return { messages, reactions, typingPeers, peers, sendMessage, sendReaction, setTyping }
}
