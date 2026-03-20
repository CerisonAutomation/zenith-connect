import { createClient } from '@/lib/supabase/server'
import { blockUser } from '@/lib/supabase/queries'
import { z } from 'zod'

export const runtime = 'edge'

const Schema = z.object({ blocked_id: z.string().uuid() })

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })

  if (parsed.data.blocked_id === user.id)
    return new Response('Cannot block yourself', { status: 422 })

  await blockUser(supabase, user.id, parsed.data.blocked_id)
  return Response.json({ ok: true })
}
