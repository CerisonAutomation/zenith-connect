# ADR-001: AI Provider — OpenRouter over Emergent / Proprietary APIs

**Status**: Accepted  
**Date**: 2026-03-20  
**Authors**: CerisonAutomation

## Context

The app requires AI features: icebreaker generation, profile bio suggestions, and message moderation. The original spec referenced Emergent LLM. We evaluated 3 options:

1. **Emergent LLM** — proprietary, vendor lock-in, paid-only, limited model choice
2. **Self-hosted Ollama** — zero API cost, but requires GPU server infra, not edge-compatible
3. **OpenRouter** — unified API over 100+ models including free OSS tiers (Llama 3.3 70B, Mistral 7B, Gemma 3 27B)

## Decision

Use **OpenRouter** as the AI provider.

## Rationale

- **Free OSS models available** — `meta-llama/llama-3.3-70b-instruct:free` is state-of-art quality at zero cost
- **No vendor lock-in** — swap model via single env var change; API is OpenAI-compatible
- **Edge-compatible** — single HTTPS fetch, works in Next.js edge runtime and Supabase Edge Functions
- **Privacy** — no training on user data (unlike some proprietary providers)
- **Fallback** — if free tier is exhausted, paid models are available on same API key

## Consequences

- Requires `OPENROUTER_API_KEY` env var (free to obtain at openrouter.ai/keys)
- Rate limited at 20 AI requests/60s per user (configurable)
- For fully offline/self-hosted: replace `src/lib/ai/openrouter.ts` with Ollama client pointing to self-hosted instance
