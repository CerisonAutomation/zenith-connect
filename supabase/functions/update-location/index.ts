import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
  )

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return new Response('Unauthorized', { status: 401 })

  const { lat, lng } = await req.json() as { lat: number; lng: number }
  if (typeof lat !== 'number' || typeof lng !== 'number')
    return new Response('Bad Request', { status: 400 })

  // Validate bounds
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
    return new Response('Invalid coordinates', { status: 422 })

  const { error } = await supabase
    .from('profiles')
    .update({ location: `POINT(${lng} ${lat})`, last_seen: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return new Response(error.message, { status: 500 })
  return Response.json({ ok: true })
})
