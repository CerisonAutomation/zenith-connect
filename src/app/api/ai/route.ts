import { openrouterStream } from '@/lib/ai/openrouter'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

const RequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1).max(4000),
  })).min(1).max(20),
  model: z.string().optional(),
  feature: z.enum(['chat', 'icebreaker', 'bio', 'moderation']).optional(),
})

const SYSTEM_PROMPTS: Record<string, string> = {
  chat: 'You are a helpful assistant for Zenith Connect, a privacy-first dating app. Be friendly, concise, and respectful.',
  icebreaker: 'You generate creative, friendly conversation starters for a gay dating app. Return exactly 3 icebreaker messages as a JSON array of strings. Max 120 chars each. Be witty and positive.',
  bio: 'You help users write compelling dating profile bios. Max 300 chars. Positive, authentic, specific.',
  moderation: 'You are a content safety classifier. Reply ONLY with JSON: {"safe": boolean, "reason": string|null}',
}

export const runtime = 'edge'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Rate limit: 20 requests / 60s per user
  const rl = rateLimit({ key: `ai:${user.id}`, limit: 20, windowMs: 60_000 })
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  const body = await req.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })

  const { messages, model, feature = 'chat' } = parsed.data
  const systemPrompt = SYSTEM_PROMPTS[feature] ?? SYSTEM_PROMPTS['chat']!

  const stream = await openrouterStream(
    [{ role: 'system', content: systemPrompt }, ...messages],
    { model }
  )

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-RateLimit-Remaining': String(rl.remaining),
    },
  })
}
