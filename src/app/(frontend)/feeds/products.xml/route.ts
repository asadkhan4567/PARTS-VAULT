import { conditionLabel, relName } from '@/lib/product'
import { mediaUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'
import { richTextToPlain } from '@/lib/richtext'
import { absoluteUrl } from '@/lib/url'

export const revalidate = 3600

const x = (s: unknown) => String(s ?? '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!)

/** Google Merchant Center / Meta catalogue feed (RSS 2.0 with g: namespace). */
export async function GET() {
  const payload = await getPayloadClient()
  const [{ docs }, site] = await Promise.all([
    payload.find({ collection: 'products', overrideAccess: false, depth: 1, limit: 0, pagination: false }),
    payload.findGlobal({ slug: 'site-settings', overrideAccess: false }),
  ])
  const items = docs
    .map((p) => {
      const img = mediaUrl(p.images?.[0], 'large')
      const extra = (p.images ?? []).slice(1, 6).map((m) => mediaUrl(m, 'large')).filter(Boolean) as string[]
      const sale = p.compareAtPrice && p.compareAtPrice > p.price
      return `<item>
<g:id>${x(p.sku)}</g:id>
<g:title>${x(p.title.slice(0, 150))}</g:title>
<g:description>${x(richTextToPlain(p.description).slice(0, 4900) || p.title)}</g:description>
<g:link>${x(absoluteUrl(`/product/${p.slug}`))}</g:link>
${img ? `<g:image_link>${x(absoluteUrl(img))}</g:image_link>` : ''}
${extra.map((u) => `<g:additional_image_link>${x(absoluteUrl(u))}</g:additional_image_link>`).join('\n')}
<g:availability>${p.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
<g:price>${sale ? p.compareAtPrice : p.price}.00 PKR</g:price>
${sale ? `<g:sale_price>${p.price}.00 PKR</g:sale_price>` : ''}
<g:brand>${x(relName(p.partBrand))}</g:brand>
${p.oemNumber ? `<g:mpn>${x(p.oemNumber)}</g:mpn>` : '<g:identifier_exists>no</g:identifier_exists>'}
<g:condition>new</g:condition>
<g:product_type>${x((p.categories ?? []).map((c) => relName(c)).join(' > '))}</g:product_type>
<g:google_product_category>Vehicles &amp; Parts &gt; Vehicle Parts &amp; Accessories</g:google_product_category>
<g:custom_label_0>${x(conditionLabel(p.condition))}</g:custom_label_0>
</item>`
    })
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${x(site.storeName)}</title>
<link>${x(absoluteUrl('/'))}</link>
<description>${x(site.tagline ?? '')}</description>
${items}
</channel>
</rss>`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, s-maxage=3600' } })
}
