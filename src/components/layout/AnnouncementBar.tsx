'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Msg = { text: string; link?: string | null }

export function AnnouncementBar({ messages, background, color, interval = 4 }: { messages: Msg[]; background?: string | null; color?: string | null; interval?: number | null }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (messages.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), Math.max(2, interval ?? 4) * 1000)
    return () => clearInterval(t)
  }, [messages.length, interval])
  if (!messages.length) return null
  const m = messages[i]
  const body = (
    <span key={i} className="block animate-[py-fade_.4s_ease-out] truncate">
      {m.text}
    </span>
  )
  return (
    <div className="text-center text-xs font-semibold sm:text-sm" style={{ background: background || '#E10600', color: color || '#fff' }} role="region" aria-label="Announcements" aria-live="polite">
      <div className="container-py py-2">{m.link ? <Link href={m.link} className="hover:underline">{body}</Link> : body}</div>
    </div>
  )
}
