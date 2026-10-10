import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { getCategoryTree } from '@/lib/data/catalog'
import { iconFor } from '@/lib/icons'
import { mediaUrl } from '@/lib/media'

export const metadata: Metadata = { title: 'All categories' }

export default async function CategoriesPage() {
  const tree = await getCategoryTree()
  return (
    <div className="container-py py-10">
      <h1 className="mb-8 text-4xl">All categories</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tree.map((c) => {
          const Icon = iconFor(c.icon)
          return (
            <section key={c.id} className="rounded-brand border bg-white p-5">
              <Link href={`/category/${c.slug}`} className="mb-3 flex items-center gap-3 font-heading text-xl font-bold hover:text-red-600">
                {mediaUrl(c.image, 'thumb') ? <Image src={mediaUrl(c.image, 'thumb')!} alt="" width={48} height={48} className="rounded-lg" /> : <Icon className="size-6 text-red-600" />}
                {c.name}
              </Link>
              <ul className="grid grid-cols-2 gap-1">
                {c.children.map((s) => (
                  <li key={s.id}>
                    <Link href={`/category/${s.slug}`} className="text-sm text-muted-foreground hover:text-navy-900 hover:underline">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
