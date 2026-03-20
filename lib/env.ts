/**
 * Server-only environment variable guard.
 * Import this in server-side code to validate required env vars at startup.
 * Throws clearly if any required var is missing.
 * NEVER import in client components.
 */

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `[env] Missing required environment variable: ${name}. ` +
      `Add it to .env.local (dev) or GitHub Secrets / Vercel env (prod).`
    )
  }
  return value
}

export const serverEnv = {
  // Supabase
  supabaseUrl: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabasePublishableKey: requireEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),

  // Stripe
  stripeSecretKey: requireEnv('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: requireEnv('STRIPE_WEBHOOK_SECRET'),

  // OpenRouter
  openrouterApiKey: requireEnv('OPENROUTER_API_KEY'),
} as const

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  stripePriceMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY!,
  stripePriceAnnual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL!,
} as const
