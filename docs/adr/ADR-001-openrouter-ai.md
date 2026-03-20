# ADR-001: Use OpenRouter for AI Inference

**Date:** 2026-03-01  
**Status:** Accepted

## Context

Zenith needs AI capabilities (auto-reply, match suggestions, content moderation) without vendor lock-in to a single model provider.

## Decision

Use OpenRouter as the unified AI gateway. Default model: `mistralai/mistral-7b-instruct:free`.

## Consequences

- No per-model API key management
- Free tier sufficient for MVP auto-reply volume
- Model can be swapped via config without code changes
- All AI calls through `lib/ai/client.ts` — never direct provider SDKs

## Rejected Alternatives

- Emergent AI: proprietary, limited free tier
- Direct OpenAI: cost, no free tier for core features
- Anthropic direct: same concern
