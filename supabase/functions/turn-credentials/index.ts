import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as hmac from 'https://deno.land/std@0.208.0/crypto/mod.ts'

const TURN_SECRET = Deno.env.get('TURN_SECRET') ?? ''
const TURN_URL = Deno.env.get('NEXT_PUBLIC_TURN_URL') ?? 'turn:global.relay.metered.ca:80'

serve(async (req) => {
  // Auth check
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
  )
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return new Response('Unauthorized', { status: 401 })

  // HMAC-SHA1 time-limited credentials (RFC 5389)
  const ttl = 86400 // 24h
  const timestamp = Math.floor(Date.now() / 1000) + ttl
  const username = `${timestamp}:${user.id}`
  const key = new TextEncoder().encode(TURN_SECRET)
  const data = new TextEncoder().encode(username)
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, data)
  const credential = btoa(String.fromCharCode(...new Uint8Array(sig)))

  return Response.json({
    urls: [TURN_URL],
    username,
    credential,
    ttl,
  })
})
