import { gsap, ScrollTrigger } from '@/lib/gsap'

/** Magnetic CTAs, card tilt and pinned horizontal scroll. Returns a cleanup function. */
export function setupDesktopEffects(): () => void {
  const ctx = gsap.context(() => {})
  const cleanups: Array<() => void> = []

  const pointerEffect = (el: HTMLElement, onMove: (e: PointerEvent, r: DOMRect) => void, onLeave: () => void) => {
    const move = (e: PointerEvent) => onMove(e, el.getBoundingClientRect())
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', onLeave)
    cleanups.push(() => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', onLeave)
    })
  }

  ctx.add(() => {
    document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
      const x = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' })
      const y = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' })
      pointerEffect(
        el,
        (e, r) => {
          x((e.clientX - (r.left + r.width / 2)) * 0.25)
          y((e.clientY - (r.top + r.height / 2)) * 0.35)
        },
        () => {
          x(0)
          y(0)
        },
      )
    })
    document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
      gsap.set(el, { transformPerspective: 800 })
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power2' })
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power2' })
      pointerEffect(
        el,
        (e, r) => {
          ry(((e.clientX - r.left) / r.width - 0.5) * 10)
          rx(-((e.clientY - r.top) / r.height - 0.5) * 10)
        },
        () => {
          rx(0)
          ry(0)
        },
      )
    })
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
  })
  ScrollTrigger.refresh()
  return () => {
    cleanups.forEach((c) => c())
    ctx.revert()
  }
}
