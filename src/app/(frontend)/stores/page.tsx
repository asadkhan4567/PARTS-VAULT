import type { Metadata } from 'next'

import { StoreCard } from '@/components/blocks/home'
import { getSettings } from '@/lib/data/settings'
import { absoluteUrl } from '@/lib/url'

export const metadata: Metadata = { title: 'Store locator', description: 'Visit a Partsyaar store — address, opening hours and directions.' }

export default async function StoresPage() {
  const { site } = await getSettings()
  const stores = site.stores ?? []
  const jsonLd = stores.map((s) => ({
    '@context': 'https://schema.org',
    '@type': 'AutoPartsStore',
    name: s.name,
    address: { '@type': 'PostalAddress', streetAddress: s.address, addressLocality: s.city ?? 'Lahore', addressCountry: 'PK' },
    telephone: s.phone ?? site.phone,
    openingHours: s.hours ?? site.businessHours ?? undefined,
    url: absoluteUrl('/stores'),
  }))
  return (
    <div className="container-py py-10">
      <h1 className="mb-2 text-4xl">Our stores</h1>
      <p className="mb-8 text-muted-foreground">{site.businessHours}</p>
      <div className="grid gap-6 lg:grid-cols-2">
        {stores.map((s) => (
          <div key={s.name} className="space-y-3">
            <StoreCard store={s} />
            {s.mapEmbedQuery ? (
              <iframe
                title={`Map: ${s.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(s.mapEmbedQuery)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-video w-full rounded-brand border"
              />
            ) : null}
          </div>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  )
}
