'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProfileUpdateSchema, type ProfileUpdateInput } from '@/lib/validations/schemas'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileEditForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } =
    useForm<ProfileUpdateInput>({
      resolver: zodResolver(ProfileUpdateSchema),
      defaultValues: {
        display_name: profile.display_name ?? '',
        bio: profile.bio ?? '',
        height_cm: profile.height_cm ?? undefined,
      },
    })

  const onSubmit = async (data: ProfileUpdateInput) => {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', profile.id)

    if (error) { toast.error(error.message); return }
    toast.success('Profile updated')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display_name">Display Name</Label>
        <Input id="display_name" maxLength={50} {...register('display_name')} />
        {errors.display_name && <p className="text-destructive text-xs" role="alert">{errors.display_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" rows={4} maxLength={500} placeholder="Tell people about yourself…" {...register('bio')} />
        {errors.bio && <p className="text-destructive text-xs" role="alert">{errors.bio.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="height_cm">Height (cm)</Label>
        <Input id="height_cm" type="number" min={100} max={250} {...register('height_cm', { valueAsNumber: true })} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || !isDirty}>
        {isSubmitting ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
