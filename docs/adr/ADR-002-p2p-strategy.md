# ADR-002: P2P Strategy — Trystero Nostr over Firebase/MQTT

**Status**: Accepted  
**Date**: 2026-03-20

## Context

Chat messages must be end-to-end without touching our servers for maximum privacy.

## Decision

Use **Trystero 0.22 with Nostr relay strategy** (`trystero/nostr`).

## Rationale

- Nostr relays are decentralised, open-source, and numerous — no single point of failure
- No Firebase billing or MQTT broker maintenance required
- `relayRedundancy: 3` ensures signalling even if one relay is down
- WebRTC data channels handle the actual message transit (no relay sees message content)
- Fallback: switch strategy to `trystero/torrent` by changing one import for BitTorrent tracker signalling

## Consequences

- Requires STUN/TURN for NAT traversal (provided by Edge Function `turn-credentials`)
- Signalling metadata (room join) visible to Nostr relays but not message content
- Mobile (Capacitor) WebRTC works natively on iOS/Android
