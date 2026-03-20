import { RegisterForm } from '@/components/auth/RegisterForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Create Account — Zenith Connect' }

export default function RegisterPage() {
  return (
    <main className="min-h-svh flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">⚡ Zenith Connect</h1>
          <p className="text-muted-foreground text-sm">Create your account</p>
        </div>
        <RegisterForm />
      </div>
    </main>
  )
}
