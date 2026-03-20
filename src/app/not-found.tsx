import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-6xl font-black text-muted-foreground/20">404</div>
      <div className="text-center">
        <h1 className="text-xl font-bold">Page not found</h1>
        <p className="text-muted-foreground text-sm mt-1">The page you're looking for doesn't exist.</p>
      </div>
      <Button asChild>
        <Link href="/discover">Go to Discover</Link>
      </Button>
    </div>
  )
}
