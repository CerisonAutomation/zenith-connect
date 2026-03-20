import { createClient } from '@/lib/supabase/server'
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit'
import Stripe from 'stripe'
import { z } from 'zod'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2025-01-27.acacia' })

const Schema = z.object({
  priceId: z.string().min(1),
  userId: z.string().uuid(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const rl = rateLimit({ key: `stripe:${user.id}`, limit: 5, windowMs: 60_000 })
  if (!rl.success) return rateLimitResponse(rl.resetAt)

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })

  const { priceId } = parsed.data
  const origin = req.headers.get('origin') ?? 'https://zenithconnect.app'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/premium`,
    client_reference_id: user.id,
    metadata: { userId: user.id },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  })

  return Response.json({ url: session.url })
}
