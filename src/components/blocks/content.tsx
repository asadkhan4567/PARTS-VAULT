import { ChevronDown, Mail, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat'
import { ProductGrid as Grid } from '@/components/product/ProductCard'
import { RichText } from '@/components/RichText'
import { Button } from '@/components/ui/button'
import { listProducts } from '@/lib/data/products'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'
import { whatsappLink } from '@/lib/whatsapp'
import type { BannerBlock as BannerBlockT, ContactBlock, CtaBlock, FaqBlock, ImageBlock, ProductGridBlock, RichTextBlock, VideoBlock } from '@/payload-types'

import { BannerCard, StoreCard } from './home'
import { PartRequestForm } from './PartRequestForm'
import { Section, SectionHeading } from './Section'
import type { BlockContext } from './types'

export function RichTextSection({ block }: { block: RichTextBlock }) {
  return (
    <Section className="py-6 md:py-8">
      <RichText data={block.content} className="max-w-3xl" />
    </Section>
  )
}

export function ImageSection({ block }: { block: ImageBlock }) {
  const src = mediaUrl(block.image, 'large')
  if (!src) return null
  const width = block.width === 'full' ? '' : block.width === 'wide' ? 'max-w-5xl' : 'max-w-3xl'
  return (
    <figure className={cn('py-6', block.width === 'full' ? '' : 'container-py')}>
      <div className={cn('relative aspect-[16/9] overflow-hidden', width, block.width !== 'full' && 'rounded-brand')}>
        <Image src={src} alt={mediaAlt(block.image)} fill sizes="(min-width:1024px) 960px, 100vw" className="object-cover" />
      </div>
      {block.caption ? <figcaption className="mt-2 text-sm text-muted-foreground">{block.caption}</figcaption> : null}
    </figure>
  )
}

export function FaqSection({ block }: { block: FaqBlock }) {
  const items = block.items ?? []
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({ '@type': 'Question', name: i.question, acceptedAnswer: { '@type': 'Answer', text: i.answer } })),
  }
  return (
    <Section className="py-8">
      <SectionHeading title={block.heading} />
      <div className="max-w-3xl divide-y rounded-brand border bg-white">
        {items.map((i) => (
          <details key={i.question} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg font-bold">
              {i.question}
              <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{i.answer}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </Section>
  )
}

export function BannerSection({ block, ctx }: { block: BannerBlockT; ctx: BlockContext }) {
  const saved = typeof block.banner === 'object' ? block.banner : null
  if (saved) {
    return (
      <Section className="py-6">
        <BannerCard banner={saved} ctx={ctx} large />
      </Section>
    )
  }
  const tone = block.style ?? 'navy'
  return (
    <Section className="py-6">
      <div className={cn('rounded-brand p-8 md:p-12', tone === 'red' ? 'bg-red-600 text-white' : tone === 'light' ? 'bg-navy-100' : 'bg-hero text-white')}>
        {block.headline ? <h2 className="text-3xl md:text-4xl">{block.headline}</h2> : null}
        {block.text ? <p className="mt-2 max-w-2xl opacity-90">{block.text}</p> : null}
        {block.cta?.label && block.cta.url ? (
          <Button asChild className="mt-5" variant={tone === 'red' ? 'navy' : 'default'}>
            <Link href={block.cta.url}>{block.cta.label}</Link>
          </Button>
        ) : null}
      </div>
    </Section>
  )
}

export async function ProductGridSection({ block, ctx }: { block: ProductGridBlock; ctx: BlockContext }) {
  const limit = block.limit ?? 8
  let products
  if (block.source === 'manual') {
    const ids = (block.products ?? []).map((p) => (typeof p === 'object' ? p.id : p))
    products = (await listProducts({ ids, limit })).docs
  } else if (block.source === 'category') {
    const id = typeof block.category === 'object' ? block.category?.id : block.category
    products = id ? (await listProducts({ categoryIds: [id], limit })).docs : []
  } else if (block.source === 'onSale') products = (await listProducts({ onSale: true, limit })).docs
  else products = (await listProducts({ sort: 'popular', limit })).docs
  if (!products.length) return null
  return (
    <Section>
      <SectionHeading title={block.heading} />
      <Grid products={products} vehicle={ctx.vehicle} customer={ctx.customer} />
    </Section>
  )
}

function youtubeId(url: string): string | null {
  const m = /(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/.exec(url)
  return m?.[1] ?? null
}

export function VideoSection({ block }: { block: VideoBlock }) {
  const id = block.url ? youtubeId(block.url) : null
  const file = mediaUrl(block.file)
  if (!id && !file) return null
  return (
    <Section className="py-6">
      <div className="relative aspect-video max-w-4xl overflow-hidden rounded-brand bg-navy-950">
        {id ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}`}
            title={block.caption ?? 'Video'}
            loading="lazy"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 size-full"
          />
        ) : (
          <video src={file!} controls preload="metadata" className="absolute inset-0 size-full" />
        )}
      </div>
      {block.caption ? <p className="mt-2 text-sm text-muted-foreground">{block.caption}</p> : null}
    </Section>
  )
}

export function CtaSection({ block, ctx }: { block: CtaBlock; ctx: BlockContext }) {
  return (
    <Section className="py-8">
      <div className="bg-hero flex flex-col items-start gap-5 rounded-2xl p-8 text-white md:flex-row md:items-center md:justify-between md:p-10">
        <div>
          {block.heading ? <h2 className="text-3xl">{block.heading}</h2> : null}
          {block.text ? <p className="mt-1 text-steel-400">{block.text}</p> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          {block.primary?.label && block.primary.url ? (
            <Button asChild>
              <Link href={block.primary.url}>{block.primary.label}</Link>
            </Button>
          ) : null}
          {block.secondary?.label && block.secondary.url ? (
            <Button asChild variant="glass">
              <Link href={block.secondary.url}>{block.secondary.label}</Link>
            </Button>
          ) : null}
          {block.whatsapp ? (
            <Button asChild className="bg-[#25D366] text-navy-950 hover:bg-[#1fb757]">
              <a href={whatsappLink(ctx.settings.site.whatsapp)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-5" /> WhatsApp us
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

export function ContactSection({ block, ctx }: { block: ContactBlock; ctx: BlockContext }) {
  const { site } = ctx.settings
  const store = site.stores?.[0]
  return (
    <Section>
      <SectionHeading title={block.heading} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`} className="flex flex-col gap-1 rounded-brand border bg-white p-4 hover:border-red-600">
              <Phone className="size-5 text-red-600" />
              <span className="text-xs text-muted-foreground">Call</span>
              <strong data-testid="contact-phone">{site.phone}</strong>
            </a>
            <a href={whatsappLink(site.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1 rounded-brand border bg-white p-4 hover:border-red-600">
              <WhatsAppIcon className="size-5 text-[#25D366]" />
              <span className="text-xs text-muted-foreground">WhatsApp</span>
              <strong data-testid="contact-whatsapp">+{site.whatsapp}</strong>
            </a>
            {site.emails?.[0] ? (
              <a href={`mailto:${site.emails[0].email}`} className="flex flex-col gap-1 rounded-brand border bg-white p-4 hover:border-red-600">
                <Mail className="size-5 text-red-600" />
                <span className="text-xs text-muted-foreground">Email</span>
                <strong className="truncate">{site.emails[0].email}</strong>
              </a>
            ) : null}
          </div>
          {site.stores?.map((s) => <StoreCard key={s.name} store={s} />)}
          {store?.mapEmbedQuery ? (
            <iframe
              title={`Map: ${store.name}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(store.mapEmbedQuery)}&output=embed`}
              loading="lazy"
              className="aspect-video w-full rounded-brand border"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : null}
        </div>
        {block.showForm ? (
          <div className="rounded-2xl bg-navy-950 p-6 text-white">
            <p className="mb-4 font-heading text-2xl font-bold">Send us a message</p>
            <PartRequestForm />
          </div>
        ) : null}
      </div>
    </Section>
  )
}
