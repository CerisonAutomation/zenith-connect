'use client'

import { joinRoom } from 'trystero/nostr'
import type { Room } from 'trystero'

export interface ChatMessage {
  id: string
  senderId: string
  content: string
  timestamp: number
  type: 'text' | 'media' | 'system'
  edited?: boolean
  replyTo?: string
}

export interface Reaction {
  messageId: string
  emoji: string
  senderId: string
}

export interface TypingPayload {
  userId: string
  isTyping: boolean
}

export interface ReadReceipt {
  messageId: string
  readBy: string
  timestamp: number
}

const APP_ID = process.env.NEXT_PUBLIC_TRYSTERO_APP_ID ?? 'zenith-connect-v1'

/**
 * Creates or joins a Trystero 0.22 P2P room for a given chat ID.
 * Uses Nostr relay strategy (no central server, privacy-first).
 */
export function createChatRoom(roomId: string, config?: { relayRedundancy?: number }) {
  const room: Room = joinRoom(
    { appId: APP_ID, relayRedundancy: config?.relayRedundancy ?? 3 },
    roomId
  )

  const [sendMsg, onMsg] = room.makeAction<ChatMessage>('msg')
  const [sendReaction, onReaction] = room.makeAction<Reaction>('reaction')
  const [sendTyping, onTyping] = room.makeAction<TypingPayload>('typing')
  const [sendReceipt, onReceipt] = room.makeAction<ReadReceipt>('receipt')
  const [sendEdit, onEdit] = room.makeAction<{ messageId: string; content: string }>('edit')
  const [sendUnsend, onUnsend] = room.makeAction<{ messageId: string }>('unsend')

  return {
    room,
    // Message
    sendMsg, onMsg,
    // Reactions
    sendReaction, onReaction,
    // Typing indicators
    sendTyping, onTyping,
    // Read receipts
    sendReceipt, onReceipt,
    // Edit / unsend
    sendEdit, onEdit,
    sendUnsend, onUnsend,
    // Media streams (voice/video calls)
    addStream: room.addStream,
    onPeerStream: room.onPeerStream,
    // Peer lifecycle
    onPeerJoin: room.onPeerJoin,
    onPeerLeave: room.onPeerLeave,
    leave: room.leave,
    getPeers: room.getPeers,
  }
}

export type ChatRoom = ReturnType<typeof createChatRoom>
