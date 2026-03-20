'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Zap, Bell, Globe, Moon, Trash2, LogOut, Shield, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const SUPPORTED_LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'pl', label: 'Polski' },
  { value: 'ru', label: 'Русский' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'ar', label: 'العربية' },
  { value: 'tr', label: 'Türkçe' },
]

export function SettingsView() {
  const router = useRouter()
  const supabase = createClient()
  const qc = useQueryClient()
  const { theme, setTheme } = useTheme()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notifPush, setNotifPush] = useState(false)

  // Fetch own profile
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      return data
    },
  })

  // Push notification permission state
  useEffect(() => {
    if ('Notification' in window) {
      setNotifPush(Notification.permission === 'granted')
    }
  }, [])

  const requestNotifications = async () => {
    if (!('Notification' in window)) { toast.error('Notifications not supported'); return }
    const result = await Notification.requestPermission()
    setNotifPush(result === 'granted')
    toast.success(result === 'granted' ? 'Notifications enabled' : 'Notifications blocked')
  }

  const updateMutation = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-profile'] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Update failed'),
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleDeleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    // Soft delete: anonymise profile, then sign out
    await supabase.from('profiles').update({
      display_name: 'Deleted User',
      bio: null,
      avatar_url: null,
      location: null,
    }).eq('id', user.id)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleLocaleChange = (locale: string) => {
    router.push(`/${locale}/settings`)
  }

  return (
    <div className="max-w-lg mx-auto divide-y divide-border">
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Subscription */}
      <section className="px-4 py-4 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subscription</h2>
        {profile?.is_premium ? (
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/30 px-4 py-3">
            <Zap className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Zenith Premium</p>
              <p className="text-xs text-muted-foreground">Active — thank you! ✨</p>
            </div>
            <Link href="/premium/manage" className="text-xs text-primary hover:underline">Manage</Link>
          </div>
        ) : (
          <Link
            href="/premium"
            className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-pink-500/10 border border-amber-500/20 px-4 py-3 hover:border-amber-500/50 transition-colors group"
          >
            <Zap className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Upgrade to Premium</p>
              <p className="text-xs text-muted-foreground">Unlimited likes · See who viewed you · AI features</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        )}
      </section>

      {/* Privacy */}
      <section className="px-4 py-4 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Privacy</h2>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="travel-mode" className="font-medium">Travel Mode</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Appear in a different city</p>
          </div>
          <Switch
            id="travel-mode"
            checked={profile?.travel_mode ?? false}
            onCheckedChange={(v) => updateMutation.mutate({ travel_mode: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-distance" className="font-medium">Show Distance</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Others can see how far you are</p>
          </div>
          <Switch
            id="show-distance"
            checked={profile?.show_distance ?? true}
            onCheckedChange={(v) => updateMutation.mutate({ show_distance: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="incognito" className="font-medium">Incognito Mode</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Browse without appearing in grids <span className="text-amber-400">(Premium)</span></p>
          </div>
          <Switch
            id="incognito"
            checked={profile?.incognito_mode ?? false}
            disabled={!profile?.is_premium}
            onCheckedChange={(v) => updateMutation.mutate({ incognito_mode: v })}
          />
        </div>
      </section>

      {/* Notifications */}
      <section className="px-4 py-4 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notifications</h2>
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-medium">Push Notifications</Label>
            <p className="text-xs text-muted-foreground mt-0.5">{notifPush ? 'Enabled' : 'Tap to enable'}</p>
          </div>
          <Switch checked={notifPush} onCheckedChange={requestNotifications} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notif-messages" className="font-medium">New Messages</Label>
          </div>
          <Switch
            id="notif-messages"
            checked={profile?.notif_messages ?? true}
            onCheckedChange={(v) => updateMutation.mutate({ notif_messages: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="notif-views" className="font-medium">Profile Views <span className="text-amber-400 text-xs">(Premium)</span></Label>
          </div>
          <Switch
            id="notif-views"
            checked={profile?.notif_views ?? false}
            disabled={!profile?.is_premium}
            onCheckedChange={(v) => updateMutation.mutate({ notif_views: v })}
          />
        </div>
      </section>

      {/* Appearance */}
      <section className="px-4 py-4 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Appearance</h2>
        <div className="flex items-center justify-between">
          <Label className="font-medium">Theme</Label>
          <Select value={theme ?? 'dark'} onValueChange={setTheme}>
            <SelectTrigger className="w-32" aria-label="Theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <Label className="font-medium">Language</Label>
          <Select onValueChange={handleLocaleChange}>
            <SelectTrigger className="w-40" aria-label="Language">
              <SelectValue placeholder="English" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LOCALES.map((l) => (
                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* AI */}
      <section className="px-4 py-4 space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Features</h2>
        <p className="text-xs text-muted-foreground">
          Powered by open-source models via OpenRouter (Llama 3.3 70B, Mistral 7B, Gemma 3 27B).
          Your messages are never stored on AI servers.
        </p>
        <Link href="/settings/ai" className="text-xs text-primary hover:underline flex items-center gap-1">
          Configure AI model <ChevronRight className="h-3 w-3" />
        </Link>
      </section>

      {/* Safety */}
      <section className="px-4 py-4">
        <Link href="/settings/blocked" className="flex items-center gap-3 py-2 hover:text-primary transition-colors">
          <Shield className="h-4 w-4" />
          <span className="text-sm font-medium">Blocked Users</span>
          <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
        </Link>
      </section>

      {/* Account */}
      <section className="px-4 py-4 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
        <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
        <Button
          variant="ghost"
          className="w-full gap-2 text-destructive hover:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-4 w-4" /> Delete Account
        </Button>
      </section>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete account?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. All your data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive" onClick={handleDeleteAccount}>
              Delete forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
