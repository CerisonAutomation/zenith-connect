# Zenith Connect — Architecture

> One paragraph per layer. LLMs: put new code in the correct layer.

---

## Repo Root

Meta files: `AGENTS.md`, `CLAUDE.md`, `PROJECT_RULES.md`, `ARCHITECTURE.md`, `SECURITY.md`, `LEARNING.md`. These are read by AI agents at session start. `package.json` pins all dependencies. `next.config.ts` configures App Router, i18n, image domains, and CSP headers.

---

## `app/` — Next.js App Router

Route groups: `(auth)` for login/register/callback, `(app)` for authenticated experience, `(public)` for landing/marketing. Each segment has `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`. API routes live at `app/api/` (route handlers, edge runtime for AI/Stripe). Locale routing managed by next-intl middleware in `proxy.ts`.

---

## `components/` — UI Layer

Two sub-layers: `components/ui/` (shadcn primitives — never edited directly) and `components/(feature)/` (composed feature components: chat, profile, discover, settings, map, subscription). Components are RSC by default; interactive ones add `'use client'`. All strings via `useTranslations()`.

---

## `lib/` — Business Logic

All non-UI logic lives here. Sub-folders:
- `lib/supabase/` — `server.ts` (SSR client), `client.ts` (browser client), `queries.ts` (all DB queries, no ad-hoc `.from()` elsewhere)
- `lib/ai/` — `client.ts` (OpenRouter stream wrapper), `prompts/` (system prompt strings), `tools/` (MCP-aligned tool definitions with JSON schema), `agents/` (planner/executor patterns)
- `lib/stripe/` — `checkout.ts`, `webhook.ts`, price helpers
- `lib/p2p/` — Trystero room management, message encoding
- `lib/rate-limit.ts` — sliding-window rate limiter (used by all AI + payment routes)
- `lib/logger.ts` — structured logging (never logs PII)
- `lib/env.ts` — server-only env guard (throws if accessed in client bundle)
- `lib/geo/` — geohash fuzzing helpers for privacy-safe location

---

## `supabase/` — Database Layer

`supabase/migrations/` holds numbered SQL files (`001_init.sql` → `007_subscriptions.sql`). `supabase/functions/` holds Edge Functions (Deno, deployed to Supabase). `supabase/seed.sql` for local dev. All tables must have RLS enabled. New columns = new migration file, never manual dashboard edits.

---

## `messages/` — i18n

14 locale JSON files (`en.json`, `es.json`, `fr.json`, …). Keys are namespaced by feature (`chat.send`, `profile.edit`). All UI strings must exist here — no hardcoded English in components.

---

## `mcp/` — MCP Tool Layer (current + future)

`mcp/servers/` holds MCP server definitions (Supabase MCP, external API wrappers). `mcp/config/` holds server manifests, auth scopes, tool permissions. All MCP tools follow least-privilege: read-only by default, write/delete require explicit human confirmation (Action→Confirm→Execute). Reference: https://supabase.com/docs/guides/getting-started/mcp

---

## `infra/` — Infrastructure (future)

`infra/p2p/` — p2pllm / libp2p daemon configs for distributed inference. `infra/llm/` — vLLM Docker/K8s deployment configs. `infra/litellm/` — LiteLLM proxy config with Supabase observability logging. Activated when self-hosted LLM is needed.

---

## `docs/` — Project Documentation

`docs/adr/` — Architecture Decision Records (ADR-001: OpenRouter over hosted models; ADR-002: Trystero Nostr P2P; ADR-003: Leaflet+OSM over MapTiler; ADR-004: Stripe over Paddle). `docs/openapi.yaml` — API spec for all route handlers. New architectural choices require an ADR before implementation.

---

## Data Flow

```
Browser → Next.js RSC (app/) → lib/supabase/queries.ts → Supabase (Postgres + RLS)
                             → lib/ai/client.ts → OpenRouter → Mistral 7B
                             → lib/stripe/* → Stripe API
                             → lib/p2p/* → Trystero (Nostr relay) → Peer
Edge Middleware (proxy.ts) → @supabase/ssr (getAll/setAll) → Auth session refresh
Stripe Webhook → /api/stripe/webhook → lib/stripe/webhook.ts → supabase service role
```
