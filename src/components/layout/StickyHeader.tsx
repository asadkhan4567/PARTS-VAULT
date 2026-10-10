'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

/** Sticky navy header that shrinks once the page scrolls. */
export function StickyHeader({ children }: { children: React.ReactNode }) {
  const [shrunk, setShrunk] = useState(false)
  useEffect(() => {
    const onScroll = () => setShrunk(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <header data-shrunk={shrunk || undefined} className={cn('group/header sticky top-0 z-40 bg-navy-900 text-white transition-shadow duration-300', shrunk && 'shadow-[0_8px_30px_-12px_rgb(0_0_0/0.6)]')}>
      {children}
    </header>
  )
}
