import { SettingsView } from '@/components/settings/SettingsView'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings — Zenith Connect' }

export default function SettingsPage() {
  return <SettingsView />
}
