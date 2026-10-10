'use client'

import { useEffect, useRef } from 'react'

const KEY = 'py_seen_preloader'

/**
 * Runs before first paint: shows the vault door on the first visit of the session, on desktop
 * only (phones get content instantly — LCP matters more there) and never for reduced motion.
 * Kept inline so there's no flash of unstyled overlay.
 */
export const preloaderScript = `try{if(!sessionStorage.getItem('${KEY}')&&matchMedia('(min-width: 1024px) and (pointer: fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('py-preload')}}catch(e){}`

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
    const wheel = el.querySelector<SVGElement>('[data-wheel]')
    const door = el.querySelector<HTMLElement>('[data-door]')
    const anims: Animation[] = []
    const done = () => {
      html.classList.remove('py-preload')
      anims.forEach((a) => a.cancel())
    }
    // Web Animations API (no GSAP in the main bundle): spin the wheel, swing the door, fade out.
    const spin = wheel?.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(270deg)' }], { duration: 500, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' })
    const swing = door?.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-105deg)' }], { duration: 450, delay: 450, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' })
    const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, delay: 750, fill: 'forwards' })
    for (const a of [spin, swing, fade]) if (a) anims.push(a)
    fade.onfinish = done
    const skip = () => done()
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
      <div data-door style={{ transformOrigin: '0% 50%' }} className="relative grid size-56 place-items-center rounded-[28px] border-4 border-navy-700 bg-gradient-to-br from-navy-900 to-navy-950 shadow-[0_0_80px_var(--color-red-glow)]">
        <svg data-wheel viewBox="0 0 100 100" className="size-32" style={{ transformOrigin: '50% 50%' }}>
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
