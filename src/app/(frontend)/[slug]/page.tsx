import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { getPageBySlug } from '@/lib/data/content'
import { getBlockContext } from '@/lib/data/context'
import { mediaUrl } from '@/lib/media'
import type { Page } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }
type WithMeta = Page & { meta?: { title?: string | null; description?: string | null; image?: unknown } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = (await getPageBySlug((await params).slug)) as WithMeta | null
  if (!page) return {}
  const img = mediaUrl(page.meta?.image as never, 'large')
  return {
    title: { absolute: page.meta?.title || `${page.title} | Partsyaar.com` },
    description: page.meta?.description || page.intro || undefined,
    alternates: { canonical: `/${page.slug}` },
    openGraph: img ? { images: [{ url: img }] } : undefined,
  }
}

/** Owner-built pages: About Us, FAQ, policies, B2B… (Admin → Content → Pages). */
export default async function CmsPage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const page = await getPageBySlug(slug, draft)
  if (!page) notFound()
  const ctx = await getBlockContext()
  return (
    <div className="pb-12">
      <div className="bg-hero text-white">
        <div className="container-py space-y-3 py-12">
          <Breadcrumbs tone="dark" items={[{ label: page.title }]} />
          <h1 className="text-4xl md:text-6xl" data-testid="page-title">
            {page.title}
          </h1>
          {page.intro ? <p className="max-w-2xl text-lg text-steel-400">{page.intro}</p> : null}
        </div>
      </div>
      <RenderBlocks blocks={page.layout as never} ctx={ctx} />
    </div>
  )
}
