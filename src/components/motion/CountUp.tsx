'use client'

import { useEffect, useRef, useState } from 'react'

/** Counts up to `value` when scrolled into view (instant with reduced motion). */
export function CountUp({ value, prefix = '', suffix = '', duration = 1600 }: { value: number; prefix?: string | null; suffix?: string | null; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const decimals = Number.isInteger(value) ? 0 : 1
  const [shown, setShown] = useState(value)
  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setShown(0)
    let raf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 3)
          setShown(value * eased)
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration])
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {shown.toLocaleString('en-PK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}
