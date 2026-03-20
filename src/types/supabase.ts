/**
 * Auto-generated types placeholder.
 * Run: bun run supabase:types
 * to regenerate from your linked Supabase project.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          gallery_urls: string[]
          looking_for: string[]
          age: number | null
          height_cm: number | null
          is_verified: boolean
          is_premium: boolean
          travel_mode: boolean
          last_seen: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'is_verified' | 'is_premium'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          participant_ids: string[]
          last_message: string | null
          last_message_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      blocks: {
        Row: {
          id: string
          blocker_id: string
          blocked_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['blocks']['Row'], 'id' | 'created_at'>
        Update: never
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_id: string
          reason: string
          details: string | null
          status: 'pending' | 'reviewed' | 'actioned'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'created_at' | 'status'>
        Update: Partial<Pick<Database['public']['Tables']['reports']['Row'], 'status'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
