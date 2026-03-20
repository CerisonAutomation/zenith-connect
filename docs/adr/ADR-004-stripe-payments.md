# ADR-004: Use Stripe for Subscriptions

**Date:** 2026-03-10  
**Status:** Accepted

## Context

Zenith needs premium subscription management (monthly €9.99 / annual €4.99/mo).

## Decision

Use Stripe Checkout + Webhooks. No PCI-scope server-side card handling. Subscription status tracked in `subscriptions` table (written only by verified webhook).

## Consequences

- Simple integration via Checkout hosted page
- Webhook verification mandatory (`stripe-signature`)
- Subscription grants: only via `checkout.session.completed` event
- Annual plan offers ~50% saving to drive upgrades

## Rejected Alternatives

- Paddle: less developer control, lower brand recognition
- LemonSqueezy: smaller ecosystem, no enterprise tier
