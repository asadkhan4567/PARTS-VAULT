'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Sheet } from '@/components/ui/sheet'

import { NewsletterForm } from './NewsletterForm'

type Props = { title?: string | null; text?: string | null; image?: string | null; delaySeconds?: number | null; couponCode?: string | null; collectEmail?: boolean | null; ctaText?: string | null; ctaLink?: string | null }

const KEY = 'py_popup_seen'
const SKIP = ['/checkout', '/cart', '/order', '/account']

/** Owner-controlled offer popup: once per session, after a delay, never during checkout. */
export function OfferPopup(p: Props) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (SKIP.some((s) => path.startsWith(s))) return
    try {
      if (sessionStorage.getItem(KEY)) return
    } catch {
      return
    }
    const t = setTimeout(() => {
      setOpen(true)
      try {
        sessionStorage.setItem(KEY, '1')
      } catch {
        // ignore
      }
    }, Math.max(2, p.delaySeconds ?? 8) * 1000)
    return () => clearTimeout(t)
  }, [path, p.delaySeconds])
  return (
    <Sheet open={open} onOpenChange={setOpen} title={p.title ?? 'Special offer'} side="center" className="max-w-md">
      <div className="space-y-4 p-5">
        {p.image ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            <Image src={p.image} alt="" fill sizes="420px" className="object-cover" />
          </div>
        ) : null}
        {p.text ? <p className="text-muted-foreground">{p.text}</p> : null}
        {p.couponCode ? (
          <p className="text-sm">
            Code: <span className="rounded bg-red-600 px-2 py-0.5 font-mono font-bold text-white">{p.couponCode}</span>
          </p>
        ) : null}
        {p.collectEmail ? <NewsletterForm source="popup" tone="light" /> : null}
        {p.ctaText && p.ctaLink ? (
          <Link href={p.ctaLink} onClick={() => setOpen(false)} className="inline-flex h-11 items-center rounded-lg bg-red-600 px-5 font-semibold text-white">
            {p.ctaText}
          </Link>
        ) : null}
      </div>
    </Sheet>
  )
}
