'use client'

import Image from 'next/image'
import { BadgeCheck, Zap, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileView({ profile, isOwn }: { profile: Profile | null; isOwn: boolean }) {
  const router = useRouter()
  const supabase = createClient()

  const handleMessage = async () => {
    if (!profile) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Upsert conversation
    const participants = [user.id, profile.id].sort()
    const { data: conv, error } = await supabase
      .from('conversations')
      .upsert(
        { participant_ids: participants },
        { onConflict: 'participant_ids', ignoreDuplicates: true }
      )
      .select()
      .single()

    if (error) { toast.error('Could not open chat'); return }
    router.push(`/chat/${conv.id}`)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!profile) return <p className="text-center py-12 text-muted-foreground">Profile not found</p>

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-28 w-28 rounded-full overflow-hidden bg-muted">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={profile.display_name ?? profile.username} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">👤</div>
          )}
        </div>
        <div className="text-center">
          <div className="flex items-center gap-1.5 justify-center">
            <h1 className="text-xl font-bold">{profile.display_name ?? profile.username}</h1>
            {profile.is_verified && <BadgeCheck className="h-5 w-5 text-blue-400" />}
            {profile.is_premium && <Zap className="h-5 w-5 text-amber-400" />}
          </div>
          {profile.age && <p className="text-muted-foreground text-sm">Age {profile.age}</p>}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="rounded-xl bg-card p-4">
          <p className="text-sm leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Looking for */}
      {profile.looking_for?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.looking_for.map((tag) => (
            <span key={tag} className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {isOwn ? (
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          Sign Out
        </Button>
      ) : (
        <Button className="w-full gap-2" onClick={handleMessage}>
          <MessageCircle className="h-4 w-4" />
          Message
        </Button>
      )}
    </div>
  )
}
