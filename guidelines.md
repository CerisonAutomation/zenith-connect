<!-- JetBrains AI / Windsurf guidelines file -->
<!-- Junie/JetBrains AI Assistant reads this automatically -->

See AGENTS.md for full instructions. Quick summary:

- Stack: Next.js 15, Supabase (@supabase/ssr only), OpenRouter, Trystero, Stripe, Leaflet+OSM, Tailwind v4
- Auth: ONLY @supabase/ssr with getAll/setAll — NEVER auth-helpers-nextjs
- Queries: ONLY through lib/supabase/queries.ts
- AI: ONLY through lib/ai/client.ts (OpenRouter, Mistral 7B)
- Maps: ONLY Leaflet + OpenStreetMap — NO MapTiler, NO Google Maps
- New packages: check lib/ first, ask before adding
- All mutations: Action→Confirm→Execute pattern
- All new tables: strict RLS + declarative migration in supabase/migrations/
