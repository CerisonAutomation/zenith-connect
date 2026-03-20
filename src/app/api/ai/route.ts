import { openrouterStream } from '@/lib/ai/openrouter'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const RequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(4000),
  })).min(1).max(20),
  model: z.string().optional(),
})

export const runtime = 'edge'

export async function POST(req: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })

  const stream = await openrouterStream(
    [
      { role: 'system', content: 'You are a helpful assistant for Zenith Connect, a privacy-first dating app. Be friendly, concise, and respectful.' },
      ...parsed.data.messages,
    ],
    { model: parsed.data.model }
  )

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
