'use client'

import { PlayCircle } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/utils'

type Img = { src: string; large: string; alt: string }

/** Main image with hover zoom (desktop) and thumbnail strip; swipeable on phones. */
export function Gallery({ images, videoUrl, badge }: { images: Img[]; videoUrl?: string | null; badge?: React.ReactNode }) {
  const [i, setI] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const current = images[i]
  return (
    <div className="space-y-3">
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border bg-white"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
        }}
        onMouseLeave={() => setZoom(null)}
      >
        {current ? (
          <Image
            src={current.large}
            alt={current.alt}
            fill
            priority
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-200"
            style={zoom ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
          />
        ) : null}
        {badge ? <div className="absolute left-3 top-3 flex flex-col gap-1">{badge}</div> : null}
      </div>
      {images.length > 1 || videoUrl ? (
        <div className="scrollbar-none flex gap-2 overflow-x-auto">
          {images.map((img, n) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Show image ${n + 1}`}
              aria-current={n === i}
              className={cn('relative size-20 shrink-0 overflow-hidden rounded-lg border-2 bg-white', n === i ? 'border-red-600' : 'border-transparent')}
            >
              <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
          {videoUrl ? (
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="grid size-20 shrink-0 place-items-center rounded-lg border bg-navy-900 text-white" aria-label="Watch product video">
              <PlayCircle className="size-8" />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
