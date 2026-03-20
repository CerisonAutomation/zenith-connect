# Zenith Connect — Security Policy

> AI agents MUST read and comply with this file. Violations will be rejected in review.

---

## 1. Authentication

- **PKCE flow only** via `@supabase/ssr` — never `auth-helpers-nextjs`
- Cookie pattern: `getAll()` / `setAll()` exclusively (see official Supabase prompt)
- `proxy.ts` must call `supabase.auth.getUser()` and never be bypassed
- Never store auth tokens in `localStorage` or `sessionStorage`
- Auth callback at `/auth/callback` must use `exchangeCodeForSession` pattern only
- Session expiry: default Supabase (1 hour JWT, 7-day refresh)

---

## 2. Row Level Security (RLS)

- **Every table** has RLS enabled — no exceptions
- `profiles`: SELECT by `auth.uid() = id` or approved `is_visible` flag
- `messages`: SELECT/INSERT only by sender or recipient
- `subscriptions`: SELECT by owner; INSERT/UPDATE only via service role (webhook)
- `notifications`: SELECT/DELETE only by `user_id = auth.uid()`
- New tables must include RLS policies in the same migration file
- Service role key used **only** in Supabase Edge Functions and webhook routes

---

## 3. Secrets and Environment Variables

- `SUPABASE_SERVICE_ROLE_KEY` — server only, never in client bundle, never logged
- `STRIPE_SECRET_KEY` — server only
- `STRIPE_WEBHOOK_SECRET` — used exclusively to verify `stripe-signature` header
- `OPENROUTER_API_KEY` — server only, never exposed to client
- All env vars validated at startup via `lib/env.ts` (throws on missing values)
- Client-side env vars must use `NEXT_PUBLIC_` prefix and contain NO secrets

---

## 4. Input Validation

- **All** user inputs validated with Zod before any DB write or AI call
- API routes: Zod schema on request body, query params, headers
- Webhook routes: always verify provider signature before parsing payload
- File uploads: MIME type + size check before Supabase Storage write
- No raw SQL string interpolation — use parameterised queries via Supabase client

---

## 5. XSS / CSRF

- All user-generated content rendered via React (auto-escaped) — no `dangerouslySetInnerHTML`
- CSP headers configured in `next.config.ts` (script-src, object-src, base-uri)
- CSRF: Next.js Server Actions use built-in CSRF protection; API routes verify `Origin` header
- `SameSite=Lax` cookies via Supabase SSR defaults

---

## 6. Privacy and Geolocation

- User coordinates stored as PostGIS `geography(Point)` with geohash fuzzing (±1km ring)
- `NearbyMap` component: never renders exact peer coordinates — only geohash-ring pins
- Travel Mode / Incognito Mode: when enabled, user excluded from ALL `profiles` query results
- Distance shown only if both users have `show_distance = true`
- Location data never logged to any third-party service

---

## 7. AI / LLM Security

- No user PII included in AI prompts (only anonymised context)
- Prompt injection protection: system prompt always set server-side, not from user input
- OpenRouter API key never in client bundle
- AI responses streamed from server — client never touches API key
- Auto-reply rate-limited: 10 req/60s per user via `lib/rate-limit.ts`
- Premium gate: free users receive HTTP 402, never a partial AI response

---

## 8. MCP (Model Context Protocol)

- All MCP servers operate on least-privilege principle
- Read operations: no confirmation needed
- Write/mutate operations: require user confirmation (Action→Confirm→Execute)
- Destructive operations (delete, charge): require explicit human-in-the-loop step
- MCP server auth tokens stored in `mcp/config/` (server-only, git-ignored secrets)
- Reference: https://www.philschmid.de/mcp-best-practices
- Reference: https://www.akto.io/blog/mcp-security-best-practices

---

## 9. Stripe / Payments

- Always verify `stripe-signature` before processing webhook body
- Never log raw Stripe event payloads (may contain PII)
- Checkout sessions: always set `customer_email` from authenticated Supabase user
- Subscription grants: only via verified webhook (`checkout.session.completed`)
- Refunds and cancellations: admin-only server actions, never client-triggered

---

## 10. Logging

- Use `lib/logger.ts` only — never raw `console.log` in production
- Log levels: `error` (exceptions), `warn` (degraded), `info` (lifecycle), `debug` (dev only)
- Never log: auth tokens, API keys, user passwords, raw AI prompts, full request bodies
- Future: LiteLLM + Supabase logging for AI observability (see `infra/litellm/`)
