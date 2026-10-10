'use client'

import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { T } from '@/components/providers/LangProvider'
import { iconFor } from '@/lib/icons'
import { cn } from '@/lib/utils'

export type MenuCategory = { name: string; slug: string; icon: string | null; children: Array<{ name: string; slug: string }> }
export type MenuMake = { name: string; slug: string; logo: string | null }

function useMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [])
  const hover = {
    onMouseEnter: () => {
      clearTimeout(timer.current)
      setOpen(true)
    },
    onMouseLeave: () => {
      timer.current = setTimeout(() => setOpen(false), 120)
    },
  }
  return { open, setOpen, ref, hover }
}

const trigger = 'inline-flex h-11 items-center gap-1 rounded-md px-3 text-sm font-semibold text-white/90 hover:bg-white/8 hover:text-white'
const panel = 'absolute left-0 top-full z-50 w-[min(92vw,960px)] animate-[py-fade_.18s_ease-out] rounded-b-xl border-t-2 border-red-600 bg-white p-5 text-navy-950 shadow-2xl'

export function CategoriesMenu({ categories }: { categories: MenuCategory[] }) {
  const { open, setOpen, ref, hover } = useMenu()
  return (
    <div ref={ref} className="relative" {...hover}>
      <button type="button" className={trigger} aria-expanded={open} onClick={() => setOpen(!open)}>
        <T k="parts_categories" /> <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open ? (
        <div className={panel}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => {
              const Icon = iconFor(c.icon)
              return (
                <div key={c.slug}>
                  <Link href={`/category/${c.slug}`} onClick={() => setOpen(false)} className="mb-2 flex items-center gap-2 font-heading text-base font-bold hover:text-red-600">
                    <Icon className="size-4 text-red-600" /> {c.name}
                  </Link>
                  <ul className="space-y-1">
                    {c.children.slice(0, 6).map((s) => (
                      <li key={s.slug}>
                        <Link href={`/category/${s.slug}`} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-navy-900 hover:underline">
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function MakesMenu({ makes }: { makes: MenuMake[] }) {
  const { open, setOpen, ref, hover } = useMenu()
  return (
    <div ref={ref} className="relative" {...hover}>
      <button type="button" className={trigger} aria-expanded={open} onClick={() => setOpen(!open)}>
        <T k="shop_by_make" /> <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
      </button>
      {open ? (
        <div className={panel}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {makes.map((m) => (
              <Link key={m.slug} href={`/make/${m.slug}`} onClick={() => setOpen(false)} className="flex flex-col items-center gap-2 rounded-lg border p-3 text-center text-xs font-semibold hover:border-red-600">
                {m.logo ? <Image src={m.logo} alt="" width={44} height={44} className="rounded" /> : null}
                {m.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
