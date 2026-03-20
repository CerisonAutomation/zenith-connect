# ADR-002: Use Trystero (Nostr) for P2P Messaging

**Date:** 2026-03-01  
**Status:** Accepted

## Context

Zenith's core value proposition is private, server-independent messaging.

## Decision

Use Trystero with Nostr relay transport for P2P chat. Server stores only metadata (conversation IDs, timestamps) — never message content.

## Consequences

- No message storage on our servers
- Requires relay availability (Nostr public relays as fallback)
- E2E encrypted by default via Trystero's WebRTC layer
- All P2P code in `lib/p2p/`

## Rejected Alternatives

- Server-side Supabase Realtime chat: stores message content on our servers
- Matrix protocol: too complex for MVP
