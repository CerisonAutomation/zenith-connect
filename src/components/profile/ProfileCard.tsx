'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDistance } from '@/lib/utils'
import { BadgeCheck, Zap } from 'lucide-react'
import type { NearbyProfile } from '@/hooks/useNearbyUsers'

export function ProfileCard({ profile }: { profile: NearbyProfile }) {
  return (
    <Link href={`/profile/${profile.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.display_name ?? profile.username}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            👤
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {profile.is_verified && (
            <span className="rounded-full bg-blue-500/90 p-0.5">
              <BadgeCheck className="h-3.5 w-3.5 text-white" />
            </span>
          )}
          {profile.is_premium && (
            <span className="rounded-full bg-amber-500/90 p-0.5">
              <Zap className="h-3.5 w-3.5 text-white" />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <p className="font-semibold text-white text-sm leading-tight truncate">
            {profile.display_name ?? profile.username}
            {profile.age ? `, ${profile.age}` : ''}
          </p>
          <p className="text-white/70 text-xs">{formatDistance(profile.distance_m)}</p>
        </div>
      </div>
    </Link>
  )
}
