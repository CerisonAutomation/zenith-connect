/**
 * Edge-compatible in-memory rate limiter using sliding window.
 * For production scale, replace backing store with Upstash Redis.
 */

const store = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitConfig {
  key: string
  limit: number
  windowMs: number
}

export function rateLimit({ key, limit, windowMs }: RateLimitConfig): {
  success: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

/** Rate limit response helper */
export function rateLimitResponse(resetAt: number): Response {
  return new Response('Too Many Requests', {
    status: 429,
    headers: {
      'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
      'X-RateLimit-Reset': String(resetAt),
    },
  })
}
