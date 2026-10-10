'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  productId: number
  slug: string
  title: string
  sku: string
  price: number
  image: string | null
  quantity: number
  maxQuantity: number
}

type CartCtx = {
  items: CartItem[]
  count: number
  subtotal: number
  ready: boolean
  open: boolean
  setOpen: (open: boolean) => void
  /** Bumps on every add, so the header badge can animate. */
  addedTick: number
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number, opts?: { openDrawer?: boolean }) => void
  setQuantity: (productId: number, quantity: number) => void
  remove: (productId: number) => void
  clear: () => void
  coupon: string | null
  setCoupon: (code: string | null) => void
}

const CART_KEY = 'py_cart_v1'
const Ctx = createContext<CartCtx | null>(null)

/**
 * Client-side cart in localStorage. Prices here are for display only — the checkout server
 * action re-reads every product's live price and stock before creating the order.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [coupon, setCoupon] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [addedTick, setAddedTick] = useState(0)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as { items?: CartItem[]; coupon?: string | null }
        setItems(saved.items ?? [])
        setCoupon(saved.coupon ?? null)
      }
    } catch {
      // ignore corrupt storage
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(CART_KEY, JSON.stringify({ items, coupon }))
    } catch {
      // storage unavailable
    }
  }, [items, coupon, ready])

  const add = useCallback<CartCtx['add']>((item, quantity = 1, opts) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, item.maxQuantity || 99) } : i,
        )
      }
      return [...prev, { ...item, quantity: Math.min(quantity, item.maxQuantity || 99) }]
    })
    setAddedTick((t) => t + 1)
    if (opts?.openDrawer !== false) setOpen(true)
  }, [])

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(quantity, i.maxQuantity || 99) } : i)),
    )
  }, [])

  const remove = useCallback((productId: number) => setItems((prev) => prev.filter((i) => i.productId !== productId)), [])
  const clear = useCallback(() => {
    setItems([])
    setCoupon(null)
  }, [])

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0)
    const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0)
    return { items, count, subtotal, ready, open, setOpen, addedTick, add, setQuantity, remove, clear, coupon, setCoupon }
  }, [items, ready, open, addedTick, add, setQuantity, remove, clear, coupon])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
