import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { openrouterStream } from '@/lib/ai/openrouter'
import { z } from 'zod'

const Schema = z.object({
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(2000),
  })).max(10),
  myProfile: z.object({
    username: z.string(),
    bio: z.string().optional(),
  }).optional(),
})

export const runtime = 'edge'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Premium-only feature gate
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, username, bio')
    .eq('id', user.id)
    .single()

  if (!profile?.is_premium)
    return new Response('Premium required', { status: 402 })

  const rl = rateLimit({ key: `autoreply:${user.id}`, limit: 10, windowMs: 60_000 })
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })

  const { conversationHistory } = parsed.data
  const username = profile.username
  const bio = profile.bio ?? ''

  const systemPrompt = `You are helping ${username} on a gay dating app called Zenith Connect.
${bio ? `Their profile says: "${bio}"` : ''}
Write ONE short, natural, authentic reply (max 2 sentences) to continue this conversation.
Do not sound like an AI. Be warm, playful, and genuine. Do not include quotation marks.`

  const stream = await openrouterStream(
    [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
    ],
    { model: 'mistralai/mistral-7b-instruct:free', maxTokens: 120 }
  )

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Premium-Feature': '1',
    },
  })
}
