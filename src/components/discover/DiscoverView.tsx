'use client'

import { useState } from 'react'
import { useNearbyUsers } from '@/hooks/useNearbyUsers'
import { useGeolocation } from '@/hooks/useGeolocation'
import { usePresence } from '@/hooks/usePresence'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { NearbyMap } from '@/components/map/NearbyMap'
import { Button } from '@/components/ui/button'
import { Map, Grid2X2, Loader2, MapPinOff } from 'lucide-react'

type ViewMode = 'grid' | 'map'

export function DiscoverView({ userId }: { userId: string }) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const { location, error: geoError } = useGeolocation()
  const { data: nearbyUsers = [], isLoading } = useNearbyUsers(location?.lat ?? null, location?.lng ?? null)
  usePresence(userId, location?.lat ?? null, location?.lng ?? null)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h1 className="text-lg font-semibold">Discover</h1>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={viewMode === 'map' ? 'default' : 'ghost'}
            onClick={() => setViewMode('map')}
            aria-label="Map view"
          >
            <Map className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {geoError && (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
          <MapPinOff className="h-8 w-8" />
          <p className="text-sm">Location unavailable</p>
        </div>
      )}

      {!geoError && viewMode === 'grid' && (
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : nearbyUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No one nearby yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {nearbyUsers.map((profile) => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      )}

      {!geoError && viewMode === 'map' && location && (
        <NearbyMap
          userLocation={location}
          nearbyUsers={nearbyUsers}
        />
      )}
    </div>
  )
}
