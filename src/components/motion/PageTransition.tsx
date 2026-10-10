'use client'

import { LazyMotion, m, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

type W = Window & { __pyNavigated?: boolean }

// Motion's animation features load asynchronously, so the page-wipe costs ~5 KB up front.
const loadFeatures = () => import('./motion-features').then((mod) => mod.default)

/** Navy wipe that uncovers each new page (not on the very first load, not for reduced motion). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  // Decided once per mount: false on the server and on the first client load.
  const [animate] = useState(() => typeof window !== 'undefined' && Boolean((window as W).__pyNavigated))
  useEffect(() => {
    ;(window as W).__pyNavigated = true
  }, [])
  return (
    <LazyMotion features={loadFeatures} strict>
      {animate && !reduce ? (
        <m.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[90] origin-top bg-navy-900"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        >
          <span className="absolute inset-x-0 bottom-0 h-1 bg-red-600" />
        </m.div>
      ) : null}
      {children}
    </LazyMotion>
  )
}
