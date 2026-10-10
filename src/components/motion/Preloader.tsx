'use client'

import { useEffect, useRef } from 'react'

import { gsap } from '@/lib/gsap'

const KEY = 'py_seen_preloader'

/**
 * Runs before first paint: shows the vault door only on the first visit of the session and
 * never for reduced motion. Kept inline so there's no flash of unstyled overlay.
 */
export const preloaderScript = `try{if(!sessionStorage.getItem('${KEY}')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('py-preload')}}catch(e){}`

/** Vault door: the lock wheel spins, the door swings open, the page appears. ≤1.2s, skippable. */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const html = document.documentElement
    if (!html.classList.contains('py-preload') || !root.current) return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      // ignore
    }
    const el = root.current
    const done = () => {
      html.classList.remove('py-preload')
      tl.kill()
    }
    const tl = gsap.timeline({ onComplete: done })
    tl.to(el.querySelector('[data-wheel]'), { rotation: 270, transformOrigin: '50% 50%', duration: 0.5, ease: 'power2.inOut' })
      .to(el.querySelector('[data-door]'), { rotationY: -105, transformOrigin: '0% 50%', duration: 0.45, ease: 'power3.in' }, '-=0.05')
      .to(el, { opacity: 0, duration: 0.25 }, '-=0.15')
    const skip = () => tl.progress(1)
    el.addEventListener('click', skip)
    window.addEventListener('keydown', skip, { once: true })
    const safety = setTimeout(done, 1600)
    return () => {
      clearTimeout(safety)
      el.removeEventListener('click', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [])

  return (
    <div ref={root} className="py-preloader fixed inset-0 z-[100] hidden place-items-center bg-navy-950 [perspective:1200px]" aria-hidden role="presentation">
      <div data-door className="relative grid size-56 place-items-center rounded-[28px] border-4 border-navy-700 bg-gradient-to-br from-navy-900 to-navy-950 shadow-[0_0_80px_var(--color-red-glow)]">
        <svg data-wheel viewBox="0 0 100 100" className="size-32">
          <circle cx="50" cy="50" r="38" fill="none" stroke="#E10600" strokeWidth="6" />
          <circle cx="50" cy="50" r="9" fill="#E10600" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <line key={a} x1="50" y1="50" x2="50" y2="14" stroke="#E8EEF7" strokeWidth="5" strokeLinecap="round" transform={`rotate(${a} 50 50)`} />
          ))}
        </svg>
        <span className="absolute -bottom-10 font-heading text-lg font-bold tracking-wide text-white">
          Parts<span className="text-red-600">Yaar</span>
        </span>
      </div>
      <span className="absolute bottom-6 text-xs text-steel-400">Tap to skip</span>
    </div>
  )
}
