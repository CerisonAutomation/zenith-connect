'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, MessageCircle, User, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/chat', icon: MessageCircle, label: 'Messages' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 backdrop-blur-md"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-xs transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={cn('h-5 w-5 transition-transform', active && 'scale-110')}
                aria-hidden
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
