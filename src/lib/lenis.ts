'use client'

import Lenis from 'lenis'

import { gsap, ScrollTrigger } from './gsap'

/** Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function startLenis(): () => void {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.2 })
  lenis.on('scroll', ScrollTrigger.update)
  const raf = (time: number) => lenis.raf(time * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)
  ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
  return () => {
    gsap.ticker.remove(raf)
    lenis.destroy()
    delete (window as unknown as { __lenis?: Lenis }).__lenis
  }
}
