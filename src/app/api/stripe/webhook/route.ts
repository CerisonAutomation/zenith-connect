import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2025-01-27.acacia' })
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? ''

// Service role client — bypasses RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs' // Stripe webhook requires raw body — can't use edge

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return new Response('Webhook Error', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (userId) {
        await supabaseAdmin.from('profiles').update({ is_premium: true }).eq('id', userId)
        await supabaseAdmin.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          plan: session.line_items ? 'premium' : 'premium',
        }, { onConflict: 'user_id' })
      }
      break
    }
    case 'customer.subscription.deleted':
    case 'customer.subscription.paused': {
      const sub = event.data.object as Stripe.Subscription
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: event.type === 'customer.subscription.deleted' ? 'cancelled' : 'paused' })
        .eq('stripe_subscription_id', sub.id)
      // Revoke premium
      const { data: record } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', sub.id)
        .single()
      if (record?.user_id) {
        await supabaseAdmin.from('profiles').update({ is_premium: false }).eq('id', record.user_id)
      }
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.warn('[Stripe] Payment failed for subscription:', invoice.subscription)
      break
    }
  }

  return Response.json({ received: true })
}
