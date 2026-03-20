'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Zap, Crown, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '€9.99',
    period: '/month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY ?? '',
    popular: false,
    features: [
      'Unlimited likes',
      'See who viewed your profile',
      'AI icebreakers & bio suggestions',
      'Incognito mode',
      'Travel mode unlock',
      'Priority in discover grid',
    ],
  },
  {
    id: 'yearly',
    name: 'Annual',
    price: '€4.99',
    period: '/month',
    badge: 'Save 50%',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL ?? '',
    popular: true,
    features: [
      'Everything in Monthly',
      'Verified badge',
      'Message receipts',
      'Profile boost ×2/week',
      'Exclusive premium filters',
    ],
  },
]

export function PremiumPlans({ userId }: { userId: string }) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleCheckout = async (priceId: string, planId: string) => {
    if (!priceId) { toast.error('Stripe not configured'); return }
    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId }),
      })
      const { url, error } = await res.json()
      if (error) throw new Error(error)
      window.location.href = url
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Checkout failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Hero */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <Crown className="h-10 w-10 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold">Zenith Premium</h1>
        <p className="text-muted-foreground text-sm">
          Unlock the full experience. Cancel anytime.
        </p>
      </div>

      {/* Competitor comparison */}
      <div className="rounded-xl bg-muted/50 p-4 text-xs space-y-1">
        <p className="font-semibold text-sm mb-2">Why Zenith?</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div />
          <div className="font-semibold text-primary">Zenith ⚡</div>
          <div className="text-muted-foreground">Grindr/Scruff</div>
          <div className="text-left">P2P encrypted chat</div>
          <div className="text-green-400">✓</div>
          <div className="text-destructive">✗</div>
          <div className="text-left">OSS AI (no tracking)</div>
          <div className="text-green-400">✓</div>
          <div className="text-destructive">✗</div>
          <div className="text-left">No ad profiling</div>
          <div className="text-green-400">✓</div>
          <div className="text-destructive">✗</div>
          <div className="text-left">Privacy by default</div>
          <div className="text-green-400">✓</div>
          <div className="text-muted-foreground">±</div>
        </div>
      </div>

      {/* Plans */}
      <div className="grid gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'rounded-2xl border p-5 space-y-4 transition-all',
              plan.popular
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border'
            )}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold">{plan.name}</p>
                  {plan.popular && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">BEST VALUE</span>
                  )}
                  {plan.badge && (
                    <span className="rounded-full bg-green-500/20 text-green-400 px-2 py-0.5 text-[10px] font-bold">{plan.badge}</span>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </div>
              {plan.popular && <Sparkles className="h-5 w-5 text-amber-400" />}
            </div>

            <ul className="space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              className="w-full gap-2"
              variant={plan.popular ? 'default' : 'outline'}
              onClick={() => handleCheckout(plan.priceId, plan.id)}
              disabled={loading !== null}
            >
              {loading === plan.id ? 'Redirecting…' : (
                <><Zap className="h-4 w-4" /> Get {plan.name}</>
              )}
            </Button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Billed securely via Stripe. Cancel anytime from Settings.
      </p>
    </div>
  )
}
