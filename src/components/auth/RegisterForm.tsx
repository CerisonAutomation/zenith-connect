'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { RegisterSchema, type RegisterInput } from '@/lib/validations/schemas'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export function RegisterForm() {
  const router = useRouter()
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    const { error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { username: data.username, age: data.age },
      },
    })
    if (signUpError) {
      toast.error(signUpError.message)
      return
    }
    toast.success('Check your email to confirm your account!')
    router.push('/login')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" autoComplete="username" {...register('username')} />
        {errors.username && <p className="text-destructive text-xs" role="alert">{errors.username.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="text-destructive text-xs" role="alert">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input id="age" type="number" min={18} max={99} {...register('age', { valueAsNumber: true })} />
        {errors.age && <p className="text-destructive text-xs" role="alert">{errors.age.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
        {errors.password && <p className="text-destructive text-xs" role="alert">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have one?{' '}
        <Link href="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </form>
  )
}
