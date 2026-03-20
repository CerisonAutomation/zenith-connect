import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

/**
 * Admin client with service role — SERVER / EDGE FUNCTIONS ONLY.
 * Never import this in client components.
 */
export const createAdminClient = () =>
  createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
