'use client'

import { Car, Home, LayoutGrid, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

import { CartButton } from './CartButton'

const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/garage', label: 'Garage', icon: Car },
  { href: '/account', label: 'Account', icon: User },
]

/** Thumb-reachable bottom navigation on phones. */
export function MobileTabBar() {
  const path = usePathname()
  const item = 'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold'
  return (
    <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy-950/95 pb-[env(safe-area-inset-bottom)] text-white backdrop-blur md:hidden">
      <div className="flex">
        {TABS.slice(0, 3).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn(item, path === href ? 'text-red-600' : 'text-white/80')} aria-current={path === href ? 'page' : undefined}>
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
        <div className={cn(item, 'text-white/80')}>
          <CartButton label className="flex-col gap-0.5 [&_svg]:size-5" />
        </div>
        {TABS.slice(3).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn(item, path.startsWith(href) ? 'text-red-600' : 'text-white/80')}>
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
