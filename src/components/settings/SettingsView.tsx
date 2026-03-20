'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useState } from 'react'

export function SettingsView() {
  const router = useRouter()
  const supabase = createClient()
  const [travelMode, setTravelMode] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleTravelMode = async (checked: boolean) => {
    setTravelMode(checked)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ travel_mode: checked })
      .eq('id', user.id)
    if (error) toast.error('Failed to update travel mode')
    else toast.success(checked ? 'Travel mode enabled' : 'Travel mode disabled')
  }

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <div className="rounded-xl bg-card p-4 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Privacy</h2>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="travel-mode">Travel Mode</Label>
            <p className="text-xs text-muted-foreground">Show as exploring a different city</p>
          </div>
          <Switch
            id="travel-mode"
            checked={travelMode}
            onCheckedChange={handleTravelMode}
          />
        </div>
      </div>

      <div className="rounded-xl bg-card p-4 space-y-3">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">AI Features</h2>
        <p className="text-xs text-muted-foreground">
          Powered by open-source models via OpenRouter (Llama 3.3, Mistral, Gemma).
          Your messages are never stored on AI servers.
        </p>
      </div>

      <Button variant="destructive" className="w-full" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  )
}
