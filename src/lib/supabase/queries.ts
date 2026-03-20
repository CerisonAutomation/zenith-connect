/**
 * Centralised query functions — avoids N+1 by batch-fetching related data.
 * All functions accept a Supabase client to work server-side and client-side.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

type DB = SupabaseClient<Database>

/** Fetch a profile with a single query */
export async function getProfile(db: DB, id: string) {
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

/**
 * Batch-fetch profiles by IDs — single query, no N+1.
 * Use this instead of looping getProfile().
 */
export async function getProfilesBatch(db: DB, ids: string[]) {
  if (ids.length === 0) return []
  const { data, error } = await db
    .from('profiles')
    .select('id, username, display_name, avatar_url, is_verified, is_premium')
    .in('id', ids)
  if (error) throw error
  return data ?? []
}

/**
 * Conversations with participant profiles in ONE query via PostgREST join.
 * Avoids N+1 participant name lookups.
 */
export async function getConversationsWithProfiles(db: DB, userId: string) {
  const { data: conversations, error } = await db
    .from('conversations')
    .select('*')
    .contains('participant_ids', [userId])
    .order('last_message_at', { ascending: false })
    .limit(50)
  if (error) throw error

  if (!conversations || conversations.length === 0) return []

  // Batch-fetch all peer profiles in ONE query
  const peerIds = conversations
    .map((c) => c.participant_ids.find((id: string) => id !== userId))
    .filter(Boolean) as string[]

  const profiles = await getProfilesBatch(db, [...new Set(peerIds)])
  const profileMap = Object.fromEntries(profiles.map((p) => [p.id, p]))

  return conversations.map((c) => ({
    ...c,
    peer: profileMap[c.participant_ids.find((id: string) => id !== userId) ?? ''] ?? null,
  }))
}

/** Upsert location — called from Edge Function, not client */
export async function upsertLocation(db: DB, userId: string, lat: number, lng: number) {
  const { error } = await db
    .from('profiles')
    .update({
      location: `POINT(${lng} ${lat})`,
      last_seen: new Date().toISOString(),
    })
    .eq('id', userId)
  if (error) throw error
}

/** Block a user */
export async function blockUser(db: DB, blockerId: string, blockedId: string) {
  const { error } = await db
    .from('blocks')
    .insert({ blocker_id: blockerId, blocked_id: blockedId })
  if (error && error.code !== '23505') throw error // ignore unique violation
}

/** Report a user */
export async function reportUser(
  db: DB,
  reporterId: string,
  reportedId: string,
  reason: string,
  details?: string
) {
  const { error } = await db
    .from('reports')
    .insert({ reporter_id: reporterId, reported_id: reportedId, reason, details })
  if (error) throw error
}
