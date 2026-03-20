import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { LocationSchema } from '@/lib/validations/schemas'

export const runtime = 'edge'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // Rate limit: location updates max 1/10s per user
  const rl = rateLimit({ key: `loc:${user.id}`, limit: 6, windowMs: 60_000 })
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  const body = await req.json().catch(() => null)
  const parsed = LocationSchema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })

  const { lat, lng } = parsed.data

  const { error } = await supabase
    .from('profiles')
    .update({ location: `POINT(${lng} ${lat})`, last_seen: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return new Response(error.message, { status: 500 })
  return Response.json({ ok: true })
}
