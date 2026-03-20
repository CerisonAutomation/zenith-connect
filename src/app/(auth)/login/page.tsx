import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign In — Zenith Connect' }

export default function LoginPage() {
  return (
    <main className="min-h-svh flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">⚡ Zenith Connect</h1>
          <p className="text-muted-foreground text-sm">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
