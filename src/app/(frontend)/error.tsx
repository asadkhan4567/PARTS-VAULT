'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div className="bg-hero text-white">
      <div className="container-py flex min-h-[50vh] flex-col items-start justify-center gap-4 py-16">
        <p className="font-mono text-sm text-red-600">SOMETHING WENT WRONG</p>
        <h1 className="text-4xl md:text-6xl">We hit a bump in the road.</h1>
        <p className="max-w-lg text-steel-400">Please try again. If it keeps happening, message us on WhatsApp — we’ll take your order directly.</p>
        <div className="flex gap-3">
          <button type="button" onClick={reset} className="h-12 rounded-lg bg-red-600 px-6 font-semibold">
            Try again
          </button>
          <Link href="/" className="glass inline-flex h-12 items-center rounded-lg px-6 font-semibold">
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
