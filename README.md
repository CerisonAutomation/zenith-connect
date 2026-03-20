# ⚡ Zenith Connect

> Privacy-first P2P gay dating app — Next.js 15 · Supabase · Trystero 0.22 · MapLibre · OpenRouter AI · Capacitor 6

## Architecture

- **Auth**: Supabase Auth PKCE + SSR cookies (no Lovable, no Replit auth)
- **Database**: Supabase Postgres + PostGIS (nearby queries) + RLS on all tables
- **P2P Chat**: Trystero 0.22 Nostr strategy — messages never touch a server
- **Realtime**: Supabase Presence for online status + location
- **Maps**: MapLibre GL JS + Supabase Realtime location sharing
- **AI**: OpenRouter (free OSS models: Llama 3.3, Mistral 7B, Gemma 3 27B)
- **Mobile**: Capacitor 6 (iOS + Android)
- **Edge Functions**: TURN credentials, message moderation, location updates

## Quick Start

```bash
# 1. Clone
git clone https://github.com/CerisonAutomation/zenith-connect
cd zenith-connect

# 2. Install (bun only — no npm/yarn)
bun install

# 3. Environment
cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, OPENROUTER_API_KEY

# 4. Supabase migrations
bunx supabase login
bunx supabase link --project-ref YOUR_PROJECT_REF
bunx supabase db push

# 5. Run dev
bun dev
```

## AI Layer

Uses **OpenRouter** — a unified API over 100+ open-source models, many free:

| Model | Use case |
|---|---|
| `meta-llama/llama-3.3-70b-instruct:free` | General assistant, icebreakers |
| `mistralai/mistral-7b-instruct:free` | Fast moderation |
| `google/gemma-3-27b-it:free` | Profile bio suggestions |
| `nousresearch/hermes-3-llama-3.1-405b:free` | Complex reasoning |

Change model via `OPENROUTER_MODEL` env var. No vendor lock-in.

## Edge Functions

```bash
# Deploy all
bunx supabase functions deploy turn-credentials
bunx supabase functions deploy moderate-message
bunx supabase functions deploy update-location

# Secrets
bunx supabase secrets set OPENROUTER_API_KEY=sk-or-...
bunx supabase secrets set TURN_SECRET=your-secret
```

## Database Setup

Migrations in `supabase/migrations/`:
- `001_profiles.sql` — profiles table + PostGIS + auto-create trigger
- `002_conversations.sql` — conversation metadata, blocks, reports
- `003_rls.sql` — Row Level Security on all tables
- `004_nearby_rpc.sql` — `nearby_profiles()` PostGIS RPC function

## Mobile (Capacitor)

```bash
bun run build  # Static export
bunx cap sync
bunx cap open ios     # Opens Xcode
bunx cap open android # Opens Android Studio
```

## Tests

```bash
bun test          # Unit tests (Vitest)
bun test:e2e      # E2E (Playwright)
```

## Security Checklist

- [x] RLS enabled on all tables
- [x] PKCE auth flow (no implicit tokens)
- [x] `.env` never committed (`.gitignore`)
- [x] Zod validation on all inputs
- [x] Service role key server/edge only
- [x] TURN credentials time-limited (HMAC-SHA1)
- [x] Block list enforced at DB level (RLS + RPC)
