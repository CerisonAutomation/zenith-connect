# Zenith Connect — Project Rules

> Enforced by all AI agents (see AGENTS.md) and human reviewers.

---

## 1. Stack (pinned)

| Dependency | Version | Notes |
|---|---|---|
| next | 15.x (16 patterns) | App Router only |
| react | 19.x | Server Components first |
| typescript | 5.x strict | No `any`, no `@ts-ignore` without comment |
| @supabase/supabase-js | latest | via lib/supabase/* only |
| @supabase/ssr | latest | ONLY cookie client — never auth-helpers |
| tailwindcss | 4.x | No inline styles |
| shadcn/ui | latest | Component source in components/ui/ |
| react-hook-form | 7.x | Always paired with zod resolver |
| zod | 3.x | Validate ALL external inputs |
| @tanstack/react-query | 5.x | Server-first; no unnecessary client state |
| next-intl | 3.x | 14 locales; all UI strings in messages/ |
| stripe | latest | Checkout + Webhooks only |
| leaflet | 1.9.x | OSM tiles; NearbyMap component |
| trystero | latest | Nostr transport; P2P only in lib/p2p/ |

---

## 2. Coding Style

- **Server-first**: every route/page starts as RSC; add `'use client'` only when unavoidable
- **Typed routes**: use `next/navigation` typed routes; no raw string paths
- **Imports**: use `@/` alias; no relative `../../` beyond one level
- **File naming**: `kebab-case` for files, `PascalCase` for components, `camelCase` for utilities
- **Folder structure**: features are self-contained in `app/(feature)/` and `components/(feature)/`
- **No barrel files** (`index.ts` re-exports) unless inside `lib/`
- **Error boundaries**: every async RSC tree gets `error.tsx` + `loading.tsx`
- **JSDoc**: exported functions and types require JSDoc `@param` / `@returns`

---

## 3. Never Do

- ❌ `import from '@supabase/auth-helpers-nextjs'`
- ❌ Direct `.from()` queries in components or route handlers — use `lib/supabase/queries.ts`
- ❌ New LLM provider without an ADR in `docs/adr/`
- ❌ MapTiler, Google Maps, MapLibre — use Leaflet + OSM
- ❌ `console.log` in production code — use `lib/logger.ts`
- ❌ Secrets in client bundles — check with `lib/env.ts` (server-only guard)
- ❌ Skip Zod validation for any form, API route, or webhook payload
- ❌ New Stripe charge without Action→Confirm→Execute
- ❌ Remove or bypass rate limiting from AI / payment endpoints
- ❌ `any` TypeScript type without explicit `// reason:` comment
- ❌ Hardcoded locale strings — all text goes in `messages/(locale).json`
- ❌ Premium features accessible to free users — always check `profile.is_premium`

---

## 4. Always Do

- ✅ Use `@supabase/ssr` with `getAll`/`setAll` cookie pattern only
- ✅ Put new DB columns in a numbered migration (`supabase/migrations/NNN_*.sql`)
- ✅ Add RLS policies for every new table
- ✅ Gate premium features with `isPremium` check + upsell `PremiumBadge`
- ✅ i18n all new UI strings via `useTranslations()` / `getTranslations()`
- ✅ Add `loading.tsx` + `error.tsx` to every new route segment
- ✅ Rate-limit AI endpoints: `lib/rate-limit.ts` (10 req/60s default)
- ✅ Run `pnpm typecheck && pnpm lint` before declaring a task done
- ✅ Write at minimum one Vitest unit test for new `lib/` utilities
- ✅ Mental E2E sim: auth → happy path → premium gate → error state → loading state

---

## 5. AI / LLM Rules

- All AI calls go through `lib/ai/client.ts` (OpenRouter)
- Default model: `mistralai/mistral-7b-instruct:free`
- System prompts live in `lib/ai/prompts/`
- Tools live in `lib/ai/tools/` with typed JSON schema
- No prompt content logged to third parties
- Auto-reply is premium-only (HTTP 402 for free tier)
- Edge runtime for all AI routes (`export const runtime = 'edge'`)
- Max output tokens: 150 for auto-reply, 1000 for other features

---

## 6. Security Rules

See `SECURITY.md` for full policy. Minimum:

- Stripe webhook: always verify `stripe-signature` header
- Supabase service role key: NEVER in client bundle, NEVER logged
- Geolocation: fuzzy coords only (geohash ring ±1km)
- Incognito mode: users must not appear in any query results when enabled
- P2P: Trystero Nostr relay only; no raw WebRTC without relay fallback
