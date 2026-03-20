import { createClient } from '@/lib/supabase/server'
import { reportUser } from '@/lib/supabase/queries'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { z } from 'zod'

export const runtime = 'edge'

const Schema = z.object({
  reported_id: z.string().uuid(),
  reason: z.string().min(1).max(100),
  details: z.string().max(1000).optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const rl = rateLimit({ key: `report:${user.id}`, limit: 5, windowMs: 3_600_000 })
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })

  if (parsed.data.reported_id === user.id)
    return new Response('Cannot report yourself', { status: 422 })

  await reportUser(supabase, user.id, parsed.data.reported_id, parsed.data.reason, parsed.data.details)
  return Response.json({ ok: true })
}
