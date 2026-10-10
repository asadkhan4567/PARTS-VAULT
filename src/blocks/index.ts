import type { Block, Field } from 'payload'

import { linkFields } from '@/fields/link'

/** Every block can be switched off without deleting it. */
const enabled: Field = {
  name: 'enabled',
  label: 'Show this section',
  type: 'checkbox',
  defaultValue: true,
}

const heading = (defaultValue?: string): Field => ({ name: 'heading', type: 'text', defaultValue })
const subheading: Field = { name: 'subheading', type: 'text' }

const button = (name: string, label: string): Field => ({
  name,
  label,
  type: 'group',
  fields: [{ type: 'row', fields: linkFields(false) }],
})

const ICONS = [
  'truck',
  'shield-check',
  'badge-percent',
  'gift',
  'wrench',
  'clock',
  'phone',
  'star',
  'package',
  'map-pin',
].map((v) => ({ label: v, value: v }))

// ——— Homepage sections ———

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  labels: { singular: 'Hero + vehicle finder', plural: 'Hero sections' },
  fields: [
    enabled,
    { name: 'eyebrow', type: 'text', defaultValue: 'Over 5,000 genuine parts in stock' },
    { name: 'headline', type: 'text', required: true, defaultValue: 'Genuine Parts. Locked In. Delivered Fast.' },
    { name: 'highlight', type: 'text', admin: { description: 'Words in the headline to colour red' }, defaultValue: 'Locked In.' },
    { name: 'subheadline', type: 'textarea' },
    button('primaryCta', 'Main button'),
    button('secondaryCta', 'Second button'),
    { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
    { name: 'backgroundVideo', label: 'Background video (mobile fallback)', type: 'upload', relationTo: 'media' },
    { name: 'show3D', label: 'Show 3D car animation (desktop)', type: 'checkbox', defaultValue: true },
    { name: 'showFinder', label: 'Show vehicle finder', type: 'checkbox', defaultValue: true },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  labels: { singular: 'Stats counters', plural: 'Stats counters' },
  fields: [
    enabled,
    {
      name: 'items',
      type: 'array',
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'number', required: true },
            { name: 'prefix', type: 'text', admin: { placeholder: '<' } },
            { name: 'suffix', type: 'text', admin: { placeholder: '+ / min' } },
            { name: 'label', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}

export const TrustStripBlock: Block = {
  slug: 'trustStrip',
  interfaceName: 'TrustStripBlock',
  labels: { singular: 'Trust strip', plural: 'Trust strips' },
  fields: [
    enabled,
    {
      name: 'items',
      type: 'array',
      maxRows: 6,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'icon', type: 'select', options: ICONS, defaultValue: 'truck' },
            { name: 'title', type: 'text', required: true },
            { name: 'text', type: 'text' },
          ],
        },
      ],
    },
  ],
}

export const ShopByMakeBlock: Block = {
  slug: 'shopByMake',
  interfaceName: 'ShopByMakeBlock',
  labels: { singular: 'Shop by make', plural: 'Shop by make' },
  fields: [
    enabled,
    heading('Shop by Make'),
    subheading,
    { name: 'makes', type: 'relationship', relationTo: 'makes', hasMany: true, admin: { description: 'Empty = all visible makes' } },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'horizontal',
      options: [
        { label: 'Horizontal scroll (desktop pinned)', value: 'horizontal' },
        { label: 'Logo grid', value: 'grid' },
      ],
    },
  ],
}

export const PromoBannersBlock: Block = {
  slug: 'promoBanners',
  interfaceName: 'PromoBannersBlock',
  labels: { singular: 'Promo banners (2-up)', plural: 'Promo banners' },
  fields: [
    enabled,
    {
      name: 'banners',
      type: 'relationship',
      relationTo: 'banners',
      hasMany: true,
      admin: { description: 'Empty = all active banners placed "Homepage — promo"' },
    },
  ],
}

export const PopularCategoriesBlock: Block = {
  slug: 'popularCategories',
  interfaceName: 'PopularCategoriesBlock',
  labels: { singular: 'Popular categories', plural: 'Popular categories' },
  fields: [
    enabled,
    heading('Popular Categories'),
    subheading,
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: { description: 'Empty = categories ticked "Show in Popular Categories"' },
    },
  ],
}

export const FeatureBannersBlock: Block = {
  slug: 'featureBanners',
  interfaceName: 'FeatureBannersBlock',
  labels: { singular: 'Feature banners', plural: 'Feature banners' },
  fields: [
    enabled,
    {
      name: 'banners',
      type: 'relationship',
      relationTo: 'banners',
      hasMany: true,
      admin: { description: 'Empty = all active banners placed "Homepage — feature"' },
    },
  ],
}

export const DealOfTheDayBlock: Block = {
  slug: 'dealOfTheDay',
  interfaceName: 'DealOfTheDayBlock',
  labels: { singular: 'Deal of the day', plural: 'Deals of the day' },
  fields: [
    enabled,
    heading('Deal of the Day'),
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    {
      name: 'endsAt',
      type: 'date',
      admin: { date: { pickerAppearance: 'dayAndTime' }, description: 'Empty = countdown to midnight' },
    },
    { name: 'note', type: 'text', admin: { placeholder: 'While stocks last' } },
  ],
}

export const ProductTabsBlock: Block = {
  slug: 'productTabs',
  interfaceName: 'ProductTabsBlock',
  labels: { singular: 'Product carousel (tabs)', plural: 'Product carousels' },
  fields: [
    enabled,
    heading('Top Picks'),
    {
      name: 'tabs',
      type: 'array',
      minRows: 1,
      maxRows: 5,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true },
            {
              name: 'source',
              type: 'select',
              required: true,
              defaultValue: 'bestSellers',
              options: [
                { label: 'Best sellers', value: 'bestSellers' },
                { label: 'New arrivals', value: 'newArrivals' },
                { label: 'Featured', value: 'featured' },
                { label: 'On sale', value: 'onSale' },
                { label: 'From a category', value: 'category' },
                { label: 'Hand-picked', value: 'manual' },
              ],
            },
            { name: 'limit', type: 'number', defaultValue: 10, min: 2, max: 24 },
          ],
        },
        { name: 'category', type: 'relationship', relationTo: 'categories', admin: { condition: (_, s) => s?.source === 'category' } },
        { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true, admin: { condition: (_, s) => s?.source === 'manual' } },
      ],
    },
  ],
}

export const BrandMarqueeBlock: Block = {
  slug: 'brandMarquee',
  interfaceName: 'BrandMarqueeBlock',
  labels: { singular: 'Brands marquee', plural: 'Brands marquee' },
  fields: [enabled, heading('Brands We Trust')],
}

export const DeliveryStripBlock: Block = {
  slug: 'deliveryStrip',
  interfaceName: 'DeliveryStripBlock',
  labels: { singular: 'Same-day delivery strip', plural: 'Same-day delivery strips' },
  fields: [
    enabled,
    heading('Order before the cutoff — get it today'),
    { name: 'text', type: 'textarea', defaultValue: 'Our riders cover Lahore in under 60 minutes for in-stock parts.' },
  ],
}

export const PartRequestBlock: Block = {
  slug: 'partRequest',
  interfaceName: 'PartRequestBlock',
  labels: { singular: '"Can\'t find your part?"', plural: 'Part request sections' },
  fields: [
    enabled,
    heading("Can't find your part?"),
    { name: 'text', type: 'textarea', defaultValue: 'Send a photo of the part or your VIN on WhatsApp — our experts reply within minutes.' },
    { name: 'buttonLabel', type: 'text', defaultValue: 'Send on WhatsApp' },
    { name: 'showForm', label: 'Also show a request form', type: 'checkbox', defaultValue: true },
  ],
}

export const ReviewsBlock: Block = {
  slug: 'reviews',
  interfaceName: 'ReviewsBlock',
  labels: { singular: 'Reviews carousel', plural: 'Reviews carousels' },
  fields: [enabled, heading('What Our Customers Say'), { name: 'limit', type: 'number', defaultValue: 8 }],
}

export const BlogTeaserBlock: Block = {
  slug: 'blogTeaser',
  interfaceName: 'BlogTeaserBlock',
  labels: { singular: 'Latest blog posts', plural: 'Blog teasers' },
  fields: [enabled, heading('Maintenance Tips'), { name: 'limit', type: 'number', defaultValue: 3, min: 1, max: 6 }],
}

export const NewsletterBlock: Block = {
  slug: 'newsletter',
  interfaceName: 'NewsletterBlock',
  labels: { singular: 'Newsletter signup', plural: 'Newsletter signups' },
  fields: [
    enabled,
    heading('Get 10% off your first order'),
    { name: 'text', type: 'text', defaultValue: 'Join for deals, new arrivals and car-care tips. No spam.' },
    { name: 'couponCode', type: 'text', defaultValue: 'YAAR10' },
  ],
}

// ——— General page blocks ———

export const RichTextBlock: Block = {
  slug: 'richText',
  interfaceName: 'RichTextBlock',
  labels: { singular: 'Text', plural: 'Text' },
  fields: [enabled, { name: 'content', type: 'richText', required: true }],
}

export const ImageBlock: Block = {
  slug: 'image',
  interfaceName: 'ImageBlock',
  labels: { singular: 'Image', plural: 'Images' },
  fields: [
    enabled,
    { name: 'image', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text' },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'content',
      options: [
        { label: 'Text width', value: 'content' },
        { label: 'Wide', value: 'wide' },
        { label: 'Full screen', value: 'full' },
      ],
    },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  interfaceName: 'FaqBlock',
  labels: { singular: 'FAQ accordion', plural: 'FAQ accordions' },
  fields: [
    enabled,
    heading('Frequently Asked Questions'),
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
  ],
}

export const BannerBlock: Block = {
  slug: 'banner',
  interfaceName: 'BannerBlock',
  labels: { singular: 'Banner', plural: 'Banners' },
  fields: [
    enabled,
    { name: 'banner', type: 'relationship', relationTo: 'banners', admin: { description: 'Pick a saved banner, or fill in below' } },
    { name: 'headline', type: 'text' },
    { name: 'text', type: 'textarea' },
    button('cta', 'Button'),
    {
      name: 'style',
      type: 'select',
      defaultValue: 'navy',
      options: [
        { label: 'Navy', value: 'navy' },
        { label: 'Red', value: 'red' },
        { label: 'Light', value: 'light' },
      ],
    },
  ],
}

export const ProductGridBlock: Block = {
  slug: 'productGrid',
  interfaceName: 'ProductGridBlock',
  labels: { singular: 'Product grid', plural: 'Product grids' },
  fields: [
    enabled,
    heading(),
    {
      name: 'source',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Hand-picked', value: 'manual' },
        { label: 'From a category', value: 'category' },
        { label: 'Best sellers', value: 'bestSellers' },
        { label: 'On sale', value: 'onSale' },
      ],
    },
    { name: 'products', type: 'relationship', relationTo: 'products', hasMany: true, admin: { condition: (_, s) => s?.source === 'manual' } },
    { name: 'category', type: 'relationship', relationTo: 'categories', admin: { condition: (_, s) => s?.source === 'category' } },
    { name: 'limit', type: 'number', defaultValue: 8 },
  ],
}

export const VideoBlock: Block = {
  slug: 'video',
  interfaceName: 'VideoBlock',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    enabled,
    { name: 'url', label: 'YouTube link', type: 'text' },
    { name: 'file', label: 'Or upload a video', type: 'upload', relationTo: 'media' },
    { name: 'caption', type: 'text' },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  interfaceName: 'CtaBlock',
  labels: { singular: 'Call to action', plural: 'Calls to action' },
  fields: [
    enabled,
    heading(),
    { name: 'text', type: 'textarea' },
    button('primary', 'Main button'),
    button('secondary', 'Second button'),
    { name: 'whatsapp', label: 'Add a WhatsApp button', type: 'checkbox', defaultValue: false },
  ],
}

export const ContactBlock: Block = {
  slug: 'contact',
  interfaceName: 'ContactBlock',
  labels: { singular: 'Contact details + map', plural: 'Contact sections' },
  fields: [enabled, heading('Get in touch'), { name: 'showForm', type: 'checkbox', defaultValue: true }],
}

export const HOME_BLOCKS: Block[] = [
  HeroBlock,
  TrustStripBlock,
  StatsBlock,
  ShopByMakeBlock,
  PromoBannersBlock,
  PopularCategoriesBlock,
  FeatureBannersBlock,
  DealOfTheDayBlock,
  ProductTabsBlock,
  DeliveryStripBlock,
  BrandMarqueeBlock,
  PartRequestBlock,
  ReviewsBlock,
  BlogTeaserBlock,
  NewsletterBlock,
  BannerBlock,
  RichTextBlock,
  CtaBlock,
]

export const PAGE_BLOCKS: Block[] = [
  RichTextBlock,
  ImageBlock,
  FaqBlock,
  BannerBlock,
  ProductGridBlock,
  VideoBlock,
  CtaBlock,
  ContactBlock,
  PartRequestBlock,
  TrustStripBlock,
  StatsBlock,
]
