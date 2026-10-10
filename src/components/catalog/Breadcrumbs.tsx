import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { absoluteUrl } from '@/lib/url'

export type Crumb = { label: string; href?: string }

/** Visible breadcrumbs + BreadcrumbList JSON-LD. */
export function Breadcrumbs({ items, tone = 'light' }: { items: Crumb[]; tone?: 'light' | 'dark' }) {
  const all = [{ label: 'Home', href: '/' }, ...items]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: c.href ? absoluteUrl(c.href) : undefined })),
  }
  return (
    <nav aria-label="Breadcrumb" className="text-xs">
      <ol className={`flex flex-wrap items-center gap-1 ${tone === 'dark' ? 'text-steel-400' : 'text-muted-foreground'}`}>
        {all.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <ChevronRight className="size-3" aria-hidden /> : null}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="hover:underline">
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === all.length - 1 ? 'page' : undefined} className={tone === 'dark' ? 'text-white' : 'text-navy-900'}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  )
}
