import { describe, it, expect, beforeEach } from 'vitest'
import { rateLimit } from '@/lib/rate-limit'

describe('rateLimit', () => {
  it('allows requests under limit', () => {
    const result = rateLimit({ key: `test-${Date.now()}`, limit: 5, windowMs: 60_000 })
    expect(result.success).toBe(true)
    expect(result.remaining).toBe(4)
  })

  it('blocks after limit exceeded', () => {
    const key = `flood-${Date.now()}`
    for (let i = 0; i < 3; i++) rateLimit({ key, limit: 3, windowMs: 60_000 })
    const blocked = rateLimit({ key, limit: 3, windowMs: 60_000 })
    expect(blocked.success).toBe(false)
    expect(blocked.remaining).toBe(0)
  })
})
