import { describe, it, expect } from 'vitest'
import { formatDistance, chatRoomId, truncate } from '@/lib/utils'

describe('formatDistance', () => {
  it('formats metres under 1km', () => expect(formatDistance(500)).toBe('500m'))
  it('formats km', () => expect(formatDistance(1500)).toBe('1.5km'))
})

describe('chatRoomId', () => {
  it('is order-independent', () => {
    const a = 'user-aaa'
    const b = 'user-bbb'
    expect(chatRoomId(a, b)).toBe(chatRoomId(b, a))
  })
})

describe('truncate', () => {
  it('truncates long strings', () => expect(truncate('hello world', 5)).toBe('hello...'))
  it('passes short strings', () => expect(truncate('hi', 10)).toBe('hi'))
})
