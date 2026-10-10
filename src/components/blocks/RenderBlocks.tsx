import { Fragment } from 'react'

import { BannerSection, ContactSection, CtaSection, FaqSection, ImageSection, ProductGridSection, RichTextSection, VideoSection } from './content'
import {
  BlogTeaser,
  BrandMarquee,
  DealOfTheDay,
  DeliveryStrip,
  FeatureBanners,
  Hero,
  Newsletter,
  PartRequest,
  PopularCategories,
  ProductTabs,
  PromoBanners,
  Reviews,
  ShopByMake,
  Stats,
  TrustStrip,
} from './home'
import type { BlockContext } from './types'

type AnyBlock = { blockType: string; id?: string | null; enabled?: boolean | null } & Record<string, unknown>

/** Renders CMS layout blocks in the order the owner arranged them; hidden ones are skipped. */
export function RenderBlocks({ blocks, ctx }: { blocks: AnyBlock[] | null | undefined; ctx: BlockContext }) {
  return (
    <>
      {(blocks ?? [])
        .filter((b) => b.enabled !== false)
        .map((b, i) => {
          const key = b.id ?? `${b.blockType}-${i}`
          // Each component receives its own typed block; the cast is the single dispatch point.
          const block = b as never
          switch (b.blockType) {
            case 'hero':
              return <Hero key={key} block={block} ctx={ctx} />
            case 'trustStrip':
              return <TrustStrip key={key} block={block} />
            case 'stats':
              return <Stats key={key} block={block} />
            case 'shopByMake':
              return <ShopByMake key={key} block={block} />
            case 'promoBanners':
              return <PromoBanners key={key} block={block} ctx={ctx} />
            case 'popularCategories':
              return <PopularCategories key={key} block={block} />
            case 'featureBanners':
              return <FeatureBanners key={key} block={block} ctx={ctx} />
            case 'dealOfTheDay':
              return <DealOfTheDay key={key} block={block} ctx={ctx} />
            case 'productTabs':
              return <ProductTabs key={key} block={block} ctx={ctx} />
            case 'deliveryStrip':
              return <DeliveryStrip key={key} block={block} ctx={ctx} />
            case 'brandMarquee':
              return <BrandMarquee key={key} block={block} />
            case 'partRequest':
              return <PartRequest key={key} block={block} ctx={ctx} />
            case 'reviews':
              return <Reviews key={key} block={block} />
            case 'blogTeaser':
              return <BlogTeaser key={key} block={block} />
            case 'newsletter':
              return <Newsletter key={key} block={block} />
            case 'richText':
              return <RichTextSection key={key} block={block} />
            case 'image':
              return <ImageSection key={key} block={block} />
            case 'faq':
              return <FaqSection key={key} block={block} />
            case 'banner':
              return <BannerSection key={key} block={block} ctx={ctx} />
            case 'productGrid':
              return <ProductGridSection key={key} block={block} ctx={ctx} />
            case 'video':
              return <VideoSection key={key} block={block} />
            case 'cta':
              return <CtaSection key={key} block={block} ctx={ctx} />
            case 'contact':
              return <ContactSection key={key} block={block} ctx={ctx} />
            default:
              return <Fragment key={key} />
          }
        })}
    </>
  )
}
