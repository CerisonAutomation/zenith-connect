import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProfilesBatch, blockUser } from '@/lib/supabase/queries'

const mockChain = (returnValue: unknown) => ({
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  in: vi.fn().mockResolvedValue(returnValue),
  insert: vi.fn().mockResolvedValue({ error: null }),
  eq: vi.fn().mockReturnThis(),
})

describe('getProfilesBatch', () => {
  it('returns empty array for empty ids', async () => {
    const db = mockChain({ data: [], error: null })
    const result = await getProfilesBatch(db as never, [])
    expect(result).toEqual([])
  })

  it('calls .in() with all ids in single query', async () => {
    const db = mockChain({ data: [{ id: 'a' }, { id: 'b' }], error: null })
    await getProfilesBatch(db as never, ['a', 'b'])
    expect(db.in).toHaveBeenCalledWith('id', ['a', 'b'])
  })
})

describe('blockUser', () => {
  it('ignores unique constraint violations silently', async () => {
    const db = {
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { code: '23505' } }),
      }),
    }
    await expect(blockUser(db as never, 'a', 'b')).resolves.toBeUndefined()
  })
})
