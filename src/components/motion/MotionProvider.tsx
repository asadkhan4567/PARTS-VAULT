'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const desktop = () => window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches
const whenIdle = (fn: () => void) => {
  const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
  if (ric) ric(fn, { timeout: 1500 })
  else setTimeout(fn, 200)
}

/**
 * Site-wide motion (transform/opacity only). Declarative hooks in markup:
 *   data-reveal           fade-up when scrolled into view (IntersectionObserver + CSS, all devices)
 *   data-magnetic         CTA pulls toward the pointer + ripple (desktop)
 *   data-tilt             3D tilt toward the pointer (desktop)
 *   data-pin-horizontal   (with [data-pin-track]) pinned horizontal scroll (desktop)
 * Headline word reveals are pure CSS (components/motion/SplitWords) so they never delay LCP.
 * GSAP + Lenis load lazily after the page is idle, and only on desktop.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Scroll reveals: cheap on phones.
  useEffect(() => {
    if (reduced()) return
    const els = [...document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    for (const el of els) {
      // Only hide what's below the fold, so nothing visible on load flickers.
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('py-reveal')
        io.observe(el)
      }
    }
    return () => io.disconnect()
  }, [pathname])

  // CTA ripple (event delegation).
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-magnetic], .btn-ripple')
      if (!btn || reduced()) return
      const r = btn.getBoundingClientRect()
      const dot = document.createElement('span')
      dot.className = 'py-ripple'
      dot.style.left = `${e.clientX - r.left}px`
      dot.style.top = `${e.clientY - r.top}px`
      btn.append(dot)
      dot.addEventListener('animationend', () => dot.remove())
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])

  // Lenis smooth scroll — desktop only, after idle.
  useEffect(() => {
    if (reduced() || !desktop()) {
      if (reduced()) document.querySelectorAll<SVGSVGElement>('svg').forEach((s) => s.pauseAnimations?.())
      return
    }
    let stop: (() => void) | undefined
    let cancelled = false
    whenIdle(() => {
      void import('@/lib/lenis').then(({ startLenis }) => {
        if (!cancelled) stop = startLenis()
      })
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [])

  // Desktop pointer effects + pinning (GSAP, lazy).
  useEffect(() => {
    if (reduced() || !desktop()) return
    let revert: (() => void) | undefined
    let cancelled = false
    whenIdle(() => {
      void import('./desktop-effects').then(({ setupDesktopEffects }) => {
        if (!cancelled) revert = setupDesktopEffects()
      })
    })
    return () => {
      cancelled = true
      revert?.()
    }
  }, [pathname])

  return <>{children}</>
}
