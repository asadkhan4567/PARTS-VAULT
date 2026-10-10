import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Logo } from '@/components/brand/Logo'
import { FacebookIcon, InstagramIcon, TikTokIcon, YoutubeIcon } from '@/components/brand/SocialIcons'
import { getCategoryTree, getMakes } from '@/lib/data/catalog'
import type { Settings } from '@/lib/data/settings'
import { mediaUrl } from '@/lib/media'

import { NewsletterForm } from './NewsletterForm'

const PAYMENT_LABELS: Record<string, string> = { cod: 'Cash on Delivery', bank: 'Bank Transfer', jazzcash: 'JazzCash', easypaisa: 'Easypaisa', visa: 'Visa', mastercard: 'Mastercard' }

export async function Footer({ settings }: { settings: Settings }) {
  const { site, navigation } = settings
  const [makes, tree] = await Promise.all([getMakes(), getCategoryTree()])
  const store = site.stores?.[0]
  const logo = mediaUrl(site.logo)
  const socials = [
    { href: site.social?.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: site.social?.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: site.social?.tiktok, label: 'TikTok', Icon: TikTokIcon },
    { href: site.social?.youtube, label: 'YouTube', Icon: YoutubeIcon },
  ].filter((s) => s.href)

  const columnLinks = (col: NonNullable<typeof navigation.footerColumns>[number]) => {
    if (col.auto === 'makes') return makes.slice(0, 8).map((m) => ({ label: `${m.name} parts`, url: `/make/${m.slug}` }))
    if (col.auto === 'categories') return tree.slice(0, 8).map((c) => ({ label: c.name, url: `/category/${c.slug}` }))
    return col.links ?? []
  }

  return (
    <footer className="bg-navy-950 pb-24 text-white md:pb-0">
      <div className="container-py grid gap-10 py-14 lg:grid-cols-[1.3fr_2.7fr]">
        <div className="space-y-5">
          {logo ? <Image src={logo} alt={site.storeName} width={180} height={40} className="h-10 w-auto" /> : <Logo className="h-10" />}
          {site.aboutBlurb ? <p className="max-w-sm text-sm leading-relaxed text-steel-400">{site.aboutBlurb}</p> : null}
          <ul className="space-y-2 text-sm text-white/85">
            {store ? (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-red-600" />
                {store.mapUrl ? (
                  <a href={store.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {store.address}
                  </a>
                ) : (
                  store.address
                )}
              </li>
            ) : null}
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-red-600" />
              <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`} className="hover:underline" data-testid="footer-phone">
                {site.phone}
              </a>
            </li>
            {site.emails?.[0] ? (
              <li className="flex gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-red-600" />
                <a href={`mailto:${site.emails[0].email}`} className="hover:underline">
                  {site.emails[0].email}
                </a>
              </li>
            ) : null}
            {site.businessHours ? (
              <li className="flex gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-red-600" /> {site.businessHours}
              </li>
            ) : null}
          </ul>
          {socials.length ? (
            <div className="flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <a key={label} href={href!} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid size-10 place-items-center rounded-full bg-white/8 hover:bg-red-600">
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {navigation.footerColumns?.map((col) => (
            <div key={col.title}>
              <h2 className="mb-3 font-heading text-lg font-bold">{col.title}</h2>
              <ul className="space-y-2">
                {columnLinks(col).map((l) => (
                  <li key={l.url}>
                    <Link href={l.url} className="text-sm text-steel-400 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/8">
        <div className="container-py grid gap-6 py-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-2 font-heading text-lg font-bold">Deals & car-care tips in your inbox</p>
            <NewsletterForm />
          </div>
          <ul className="flex flex-wrap gap-2 md:justify-end" aria-label="Payment methods">
            {(navigation.paymentIcons ?? []).map((p) => (
              <li key={p} className="rounded-md border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/85">
                {PAYMENT_LABELS[p] ?? p}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/8 py-5 text-center text-xs text-steel-400">{site.footerText}</div>
    </footer>
  )
}
