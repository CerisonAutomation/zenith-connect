import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format distance in metres to human-readable string */
export function formatDistance(metres: number): string {
  if (metres < 1000) return `${Math.round(metres)}m`
  return `${(metres / 1000).toFixed(1)}km`
}

/** Generate a deterministic room ID from two user IDs (order-independent) */
export function chatRoomId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('-')
}

/** Truncate text with ellipsis */
export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.slice(0, length)}...` : str
}

/** Parse geolocation to {lat, lng} */
export function parseGeo(pos: GeolocationPosition) {
  return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }
}
