'use client'

import { useCallback, useEffect, useState } from 'react'

const KEY = 'py_wishlist'
const EVENT = 'py:wishlist'

function read(): number[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as number[]
  } catch {
    return []
  }
}

/** Guest wishlist in localStorage (synced to the account in Phase 6 when logged in). */
export function useWishlist() {
  const [ids, setIds] = useState<number[]>([])
  useEffect(() => {
    setIds(read())
    const sync = () => setIds(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  const toggle = useCallback((id: number) => {
    const cur = read()
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur].slice(0, 100)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])
  return { ids, has: (id: number) => ids.includes(id), toggle }
}

const RECENT = 'py_recently_viewed'
export function pushRecentlyViewed(id: number) {
  try {
    const cur = JSON.parse(localStorage.getItem(RECENT) ?? '[]') as number[]
    localStorage.setItem(RECENT, JSON.stringify([id, ...cur.filter((x) => x !== id)].slice(0, 12)))
  } catch {
    // ignore
  }
}
export function readRecentlyViewed(): number[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT) ?? '[]') as number[]
  } catch {
    return []
  }
}
