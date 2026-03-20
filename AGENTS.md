# Zenith Connect — AI Coding Agent Instructions

> Read this file **entirely** before writing a single line of code.

---

<!-- BEGIN:nextjs-agent-rules -->
# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in
`node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.
<!-- END:nextjs-agent-rules -->

---

## 🏗️ Project Identity

**Zenith Connect** — a privacy-first, AI-powered social platform for the LGBTQ+ community.

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router (targeting v16 patterns) |
| Auth + DB | Supabase (Auth PKCE, Postgres, PostGIS, pgvector, RLS, Edge Functions) |
| P2P Messaging | Trystero (Nostr relay transport) |
| AI | OpenRouter (Mistral 7B free tier, streaming) |
| Payments | Stripe (Checkout, Webhooks, Subscriptions) |
| i18n | next-intl (14 locales) |
| Maps | Leaflet + OpenStreetMap (NO MapTiler, NO Google Maps, NO MapLibre) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | React Query v5 (server-first, minimal client state) |
| Forms | react-hook-form + zod |
| Deploy | Vercel + Supabase Cloud |

---

## 📚 Official Docs You MUST Use

Never guess APIs. Always read from these sources:

### Next.js
- AI Agents guide: https://nextjs.org/docs/app/guides/ai-agents
- Next.js MCP Server: https://nextjs.org/docs/app/guides/mcp
- App Router full docs: `node_modules/next/dist/docs/01-app/`
- Agentic future blog: https://nextjs.org/blog/agentic-future

### Supabase
- Bootstrap Next.js v16 + Supabase Auth (CRITICAL — read before any auth code): https://supabase.com/docs/guides/getting-started/ai-prompts/nextjs-supabase-auth
- All AI prompts index: https://supabase.com/docs/guides/getting-started/ai-prompts
- Supabase Realtime AI: https://supabase.com/docs/guides/getting-started/ai-prompts/use-realtime
- Edge Functions: https://supabase.com/docs/guides/getting-started/ai-prompts/edge-functions
- Declarative Schema: https://supabase.com/docs/guides/getting-started/ai-prompts/declarative-database-schema
- RLS policies: https://supabase.com/docs/guides/getting-started/ai-prompts/database-rls-policies
- DB functions: https://supabase.com/docs/guides/getting-started/ai-prompts/database-functions
- Migrations: https://supabase.com/docs/guides/getting-started/ai-prompts/database-create-migration
- SQL style guide: https://supabase.com/docs/guides/getting-started/ai-prompts/code-format-sql
- Supabase MCP: https://supabase.com/docs/guides/getting-started/mcp
- Deploy MCP servers: https://supabase.com/docs/guides/getting-started/byo-mcp
- AI & Vectors: https://supabase.com/docs/guides/ai
- AI Models in Edge Functions: https://supabase.com/docs/guides/functions/ai-models
- LangChain integration: https://supabase.com/docs/guides/ai/langchain

### Vercel AI SDK
- Introduction: https://ai-sdk.dev/docs/introduction
- Human-in-the-loop (tools): https://ai-sdk.dev/cookbook/next/human-in-the-loop

### MCP (Model Context Protocol)
- Spec 2025-11-25: https://modelcontextprotocol.io/specification/2025-11-25
- Security best practices: https://www.akto.io/blog/mcp-security-best-practices
- Server best practices: https://www.philschmid.de/mcp-best-practices

### LLM Frameworks (for RAG/agent features)
- LangChain: https://python.langchain.com/
- LlamaIndex: https://developers.llamaindex.ai/python/framework/understanding/
- Haystack: https://haystack.deepset.ai/
- vLLM: https://github.com/vllm-project/vllm
- p2pllm (libp2p distributed): https://github.com/FaizChishtie/p2pllm
- LiteLLM + Supabase logging: https://docs.litellm.ai/docs/observability/supabase_integration
- Distributed LLM guide: https://www.wordraptor.com/blog/distributed-local-llm-guide
- Best frameworks 2026: https://pecollective.com/tools/best-llm-frameworks/

### Docs-for-LLMs Writing
- How to build docs for LLMs: https://pinata.cloud/blog/how-to-build-docs-for-llms/
- Optimising technical docs for LLMs: https://dev.to/joshtom/optimizing-technical-documentations-for-llms-4bcd

---

## 🚨 CRITICAL: Supabase Auth Rules (from official prompt)

You MUST NOT generate deprecated patterns:

```typescript
// ❌ NEVER — BREAKS THE APPLICATION
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// ❌ Individual cookie methods
cookies: { get(name), set(name, value), remove(name) }
```

You MUST ALWAYS use:

```typescript
// ✅ ONLY THIS — @supabase/ssr with getAll/setAll
import { createBrowserClient, createServerClient } from '@supabase/ssr'
cookies: { getAll() { return cookieStore.getAll() }, setAll(cookiesToSet) { ... } }
```

See `lib/supabase/server.ts`, `lib/supabase/client.ts`, and `proxy.ts` for the canonical implementations.

---

## 🗂️ Where to Put New Code

Read `ARCHITECTURE.md` for layer boundaries. Summary:

- New routes → `app/(feature)/`
- Shared UI → `components/ui/` (shadcn) or `components/(feature)/`
- AI logic → `lib/ai/` (client, tools, prompts, agents)
- Supabase queries → `lib/supabase/queries.ts` (NEVER ad-hoc `.from()` in components)
- DB changes → `supabase/migrations/` (declarative, numbered)
- MCP tools → `mcp/servers/` and `mcp/config/`
- Translations → `messages/(locale).json`

---

## ✅ Behaviour Rules

1. Read `AGENTS.md` → `PROJECT_RULES.md` → `ARCHITECTURE.md` → `SECURITY.md` at session start.
2. Server-first: prefer RSC, Server Actions, and `lib/supabase/queries.ts` over client fetches.
3. Never introduce new npm packages without checking `lib/` for an existing utility first.
4. For any action that mutates data or charges money: implement **Action → Confirm → Execute** pattern.
5. Design every new feature for multi-tenant auth-scoped access with strict RLS.
6. For AI/LLM features: define tool JSON schema first, then wire prompts around it.
7. Explain briefly which files you create/modify and why — then keep code as the primary output.
8. Never log user PII, auth tokens, or AI prompts to third-party services.
9. Run mental E2E test (auth → feature → edge case → error) before marking done.
10. Do not rename identifiers or refactor structure unless explicitly asked.
