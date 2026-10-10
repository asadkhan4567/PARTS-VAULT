import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/catalog/Breadcrumbs'
import { ProductGrid } from '@/components/product/ProductCard'
import { RichText } from '@/components/RichText'
import { getBlogPostBySlug } from '@/lib/data/content'
import { getBlockContext } from '@/lib/data/context'
import { listProducts } from '@/lib/data/products'
import { mediaUrl } from '@/lib/media'
import { absoluteUrl } from '@/lib/url'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostBySlug((await params).slug)
  if (!post) return {}
  const img = mediaUrl(post.cover, 'large')
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: 'article', images: img ? [{ url: img }] : undefined, publishedTime: post.publishedAt ?? undefined },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const post = await getBlogPostBySlug(slug, draft)
  if (!post) notFound()
  const ctx = await getBlockContext()
  const relatedIds = (post.relatedProducts ?? []).map((p) => (typeof p === 'object' ? p.id : p))
  const related = relatedIds.length ? (await listProducts({ ids: relatedIds, limit: 8 })).docs : []
  const cover = mediaUrl(post.cover, 'banner')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Organization', name: post.author ?? 'Partsyaar Team' },
    image: cover ? absoluteUrl(cover) : undefined,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  }
  return (
    <article className="pb-16">
      <header className="bg-hero relative isolate overflow-hidden text-white">
        {cover ? <Image src={cover} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-35" /> : null}
        <div className="container-py max-w-4xl space-y-3 py-16">
          <Breadcrumbs tone="dark" items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]} />
          <h1 className="text-4xl md:text-5xl">{post.title}</h1>
          <p className="text-sm text-steel-400">
            {post.author} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }) : null}
          </p>
        </div>
      </header>
      <div className="container-py max-w-3xl pt-10">
        {post.excerpt ? <p className="mb-6 text-xl text-navy-900">{post.excerpt}</p> : null}
        <RichText data={post.body} />
      </div>
      {related.length ? (
        <section className="container-py pt-12">
          <h2 className="mb-4 text-2xl">Parts mentioned in this article</h2>
          <ProductGrid products={related} vehicle={ctx.vehicle} customer={ctx.customer} />
        </section>
      ) : null}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
  )
}
