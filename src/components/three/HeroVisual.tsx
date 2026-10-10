'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const HeroCar = dynamic(() => import('./HeroCar'), { ssr: false, loading: () => <HeroFallback /> })

function HeroFallback() {
  return (
    <svg viewBox="0 0 600 340" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="py-car" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1E4A8A" />
          <stop offset="1" stopColor="#0A1A33" />
        </linearGradient>
      </defs>
      <ellipse cx="300" cy="290" rx="240" ry="18" fill="#000" opacity=".3" />
      <path d="M70 250 Q80 190 160 180 L250 170 Q300 110 380 108 Q470 108 520 175 L560 190 Q590 200 590 250 Z" fill="url(#py-car)" />
      <path d="M270 172 Q310 128 370 126 L375 172Z M392 172 L394 127 Q450 130 492 172Z" fill="#8A97AB" opacity=".45" />
      <circle cx="170" cy="255" r="40" fill="#05080f" stroke="#B8C2D1" strokeWidth="8" />
      <circle cx="480" cy="255" r="40" fill="#05080f" stroke="#B8C2D1" strokeWidth="8" />
      <rect x="64" y="215" width="6" height="20" fill="#E10600" />
    </svg>
  )
}

/**
 * Picks the hero visual for the device: the 3D car on capable desktops, the owner's looping
 * video (if uploaded) on phones / low-end devices, else a light SVG. Reduced motion → SVG.
 */
export function HeroVisual({ videoUrl }: { videoUrl?: string | null }) {
  const [mode, setMode] = useState<'pending' | '3d' | 'video' | 'static'>('pending')
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
    const capable = (navigator.hardwareConcurrency ?? 4) >= 4 && (nav.deviceMemory ?? 8) >= 4 && !nav.connection?.saveData
    let webgl = false
    try {
      webgl = Boolean(document.createElement('canvas').getContext('webgl2'))
    } catch {
      webgl = false
    }
    if (reduce) setMode('static')
    else if (desktop && capable && webgl) setMode('3d')
    else setMode(videoUrl ? 'video' : 'static')
  }, [videoUrl])

  if (mode === '3d') return <HeroCar />
  if (mode === 'video' && videoUrl)
    return <video src={videoUrl} autoPlay muted loop playsInline preload="metadata" className="h-full w-full rounded-2xl object-cover" aria-hidden />
  return <HeroFallback />
}
