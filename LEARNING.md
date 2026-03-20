# Zenith Connect — Learning & Philosophy Roadmap

> Include this in AGENTS.md context when building new AI/agent features so the LLM follows the right architectural philosophy.

---

## AI Agent Philosophy (2026)

A well-designed AI agent has five layers:

1. **Tools** — typed JSON schema, single responsibility, MCP-aligned
2. **Memory** — short-term (conversation), long-term (pgvector in Supabase), episodic (Supabase logs)
3. **Planning** — decompose task → validate steps → execute sequentially
4. **Execution** — Action→Confirm→Execute for any mutation; stream results to user
5. **Evaluation** — verify output against expected schema before returning

This maps to Zenith's layers:
- Tools → `lib/ai/tools/`
- Memory → `supabase/` pgvector tables
- Planning → `lib/ai/agents/planner.ts`
- Execution → `/api/ai/*` edge routes
- Evaluation → Zod schema validation on AI output before DB write

---

## Multi-Agent Pattern (Research → Plan → Execute → Verify)

For complex features (e.g., AI match recommendations, content moderation):

```
Researcher agent → reads user context from Supabase
Planner agent   → decomposes into tool calls
Executor agent  → runs tools, collects results
Verifier agent  → checks output quality, flags anomalies
```

Reference: https://gozade.com/blog/how-to-build-an-ai-agent-a-2026-step-by-step-guide

---

## RAG (Retrieval-Augmented Generation)

When adding knowledge-base or semantic search features:
- Use `pgvector` extension (already in Supabase schema)
- Embed with Supabase Edge Function + AI model: https://supabase.com/docs/guides/functions/ai-models
- LangChain Supabase integration: https://supabase.com/docs/guides/ai/langchain
- LlamaIndex for document pipelines: https://developers.llamaindex.ai/python/framework/understanding/

---

## P2P / Distributed LLM (Future)

For on-device or distributed inference:
- p2pllm (libp2p): https://github.com/FaizChishtie/p2pllm
- vLLM for self-hosted: https://github.com/vllm-project/vllm
- Full distributed guide: https://www.wordraptor.com/blog/distributed-local-llm-guide
- Place configs in `infra/p2p/` and `infra/llm/`

---

## Observability

- LiteLLM + Supabase logging: https://docs.litellm.ai/docs/observability/supabase_integration
- OpenTelemetry in Next.js: https://nextjs.org/docs/app/guides/open-telemetry
- Place LiteLLM config in `infra/litellm/` when activated

---

## Key Principles

- Privacy by default (incognito, fuzzy geo, no PII in prompts)
- Server-side intelligence (never expose model keys or raw prompts to client)
- Progressive enhancement (app works without AI features; AI layers on top)
- Human-in-the-loop for any irreversible action (MCP, payments, account deletion)
