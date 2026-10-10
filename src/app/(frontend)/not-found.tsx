import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="bg-hero text-white">
      <div className="container-py flex min-h-[60vh] flex-col items-start justify-center gap-5 py-16">
        <p className="font-mono text-sm text-red-600">ERROR 404</p>
        <h1 className="text-5xl md:text-7xl">This part isn’t in the vault.</h1>
        <p className="max-w-lg text-steel-400">The page may have moved. Search by part name or OEM number, or pick your car to see everything that fits.</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/search">Search parts</Link>
          </Button>
          <Button asChild size="lg" variant="glass">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
