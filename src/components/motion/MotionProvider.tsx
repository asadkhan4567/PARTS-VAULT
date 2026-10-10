'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { startLenis } from '@/lib/lenis'

/** Wraps each word of a heading in spans so it can slide up word by word. */
function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.splitDone) return [...el.querySelectorAll<HTMLElement>('.py-word > span')]
  const walk = (node: Node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment()
        for (const part of (child.textContent ?? '').split(/(\s+)/)) {
          if (!part) continue
          if (/^\s+$/.test(part)) frag.append(part)
          else {
            const outer = document.createElement('span')
            outer.className = 'py-word inline-block overflow-hidden align-bottom pb-[0.08em]'
            const inner = document.createElement('span')
            inner.className = 'inline-block will-change-transform'
            inner.textContent = part
            outer.append(inner)
            frag.append(outer)
          }
        }
        child.replaceWith(frag)
      } else if (child.nodeType === Node.ELEMENT_NODE) walk(child)
    }
  }
  walk(el)
  el.dataset.splitDone = '1'
  return [...el.querySelectorAll<HTMLElement>('.py-word > span')]
}

/**
 * Site-wide motion (transform/opacity only). Declarative hooks in markup:
 *   data-split            headline words slide up
 *   data-reveal           fade-up when scrolled into view
 *   data-magnetic         button follows the pointer slightly
 *   data-tilt             3D tilt toward the pointer
 *   data-pin-horizontal   (with a [data-pin-track] child) pinned horizontal scroll on desktop
 * Reduced motion: nothing here runs; CSS keeps simple fades.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    if (prefersReducedMotion()) {
      document.querySelectorAll<SVGSVGElement>('svg').forEach((s) => s.pauseAnimations?.())
      return
    }
    return startLenis()
  }, [])

  // CTA ripple (event delegation, works for every .btn-ripple / [data-magnetic])
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-magnetic], .btn-ripple')
      if (!btn || prefersReducedMotion()) return
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

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const mm = gsap.matchMedia()

      document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        gsap.from(splitWords(el), { yPercent: 110, opacity: 0, duration: 0.8, ease: 'power4.out', stagger: 0.06, delay: 0.1 })
      })

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, { y: 28, opacity: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      })

      mm.add('(min-width: 1024px) and (pointer: fine)', () => {
        const cleanups: Array<() => void> = []
        document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
          const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' })
          const y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' })
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            x((e.clientX - (r.left + r.width / 2)) * 0.25)
            y((e.clientY - (r.top + r.height / 2)) * 0.35)
          }
          const leave = () => {
            x(0)
            y(0)
          }
          el.addEventListener('pointermove', move)
          el.addEventListener('pointerleave', leave)
          cleanups.push(() => {
            el.removeEventListener('pointermove', move)
            el.removeEventListener('pointerleave', leave)
          })
        })
        document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
          gsap.set(el, { transformPerspective: 800 })
          const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power2' })
          const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power2' })
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect()
            ry(((e.clientX - r.left) / r.width - 0.5) * 10)
            rx(-((e.clientY - r.top) / r.height - 0.5) * 10)
          }
          const leave = () => {
            rx(0)
            ry(0)
          }
          el.addEventListener('pointermove', move)
          el.addEventListener('pointerleave', leave)
          cleanups.push(() => {
            el.removeEventListener('pointermove', move)
            el.removeEventListener('pointerleave', leave)
          })
        })
        // Pinned horizontal "Shop by Make"
        document.querySelectorAll<HTMLElement>('[data-pin-horizontal]').forEach((section) => {
          const track = section.querySelector<HTMLElement>('[data-pin-track]')
          if (!track) return
          const distance = () => Math.max(0, track.scrollWidth - track.clientWidth)
          if (distance() < 80) return
          track.style.overflow = 'visible'
          gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top 15%', end: () => `+=${distance()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true },
          })
          cleanups.push(() => {
            track.style.overflow = ''
          })
        })
        return () => cleanups.forEach((c) => c())
      })

      ScrollTrigger.refresh()
      return () => mm.revert()
    },
    { dependencies: [pathname], revertOnUpdate: true },
  )

  return <>{children}</>
}
