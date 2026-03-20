/**
 * OpenRouter client — free OSS models via unified API.
 * Free models: meta-llama/llama-3.3-70b-instruct:free,
 *   mistralai/mistral-7b-instruct:free, google/gemma-3-27b-it:free
 * Full list: openrouter.ai/models?q=free
 */

export const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export interface OAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export async function openrouterChat(
  messages: OAIMessage[],
  options: OpenRouterOptions = {}
): Promise<string> {
  const model = options.model ?? process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free'

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Zenith Connect',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 512,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices[0]?.message.content ?? ''
}

/** Streaming version — returns a ReadableStream for SSE */
export async function openrouterStream(
  messages: OAIMessage[],
  options: OpenRouterOptions = {}
): Promise<ReadableStream<string>> {
  const model = options.model ?? process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free'

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Zenith Connect',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: true,
    }),
  })

  if (!res.ok || !res.body) throw new Error(`OpenRouter stream error ${res.status}`)
  return res.body.pipeThrough(new TextDecoderStream()) as ReadableStream<string>
}
