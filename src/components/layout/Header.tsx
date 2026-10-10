import { Heart, Phone, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Logo } from '@/components/brand/Logo'
import { LangToggle, T } from '@/components/providers/LangProvider'
import { VehicleSelector } from '@/components/vehicle/VehicleSelector'
import { getCategoryTree, getMakes } from '@/lib/data/catalog'
import type { Settings } from '@/lib/data/settings'
import { mediaUrl } from '@/lib/media'
import { whatsappLink } from '@/lib/whatsapp'

import { AnnouncementBar } from './AnnouncementBar'
import { CartButton } from './CartButton'
import { CategoriesMenu, MakesMenu } from './MegaMenu'
import { SearchBox } from './SearchBox'
import { StickyHeader } from './StickyHeader'
import { WhatsAppIcon } from './WhatsAppFloat'

export async function Header({ settings }: { settings: Settings }) {
  const { site, announcement, navigation } = settings
  const [tree, makes] = await Promise.all([getCategoryTree(), getMakes()])
  const logo = mediaUrl(site.logo)
  const categories = tree.slice(0, navigation.megaMenuCategoryCount ?? 10).map((c) => ({
    name: c.name,
    slug: c.slug ?? '',
    icon: c.icon ?? null,
    children: c.children.map((s) => ({ name: s.name, slug: s.slug ?? '' })),
  }))
  const menuMakes = makes.slice(0, navigation.megaMenuMakeCount ?? 16).map((m) => ({ name: m.name, slug: m.slug ?? '', logo: mediaUrl(m.logo, 'thumb') }))
  const iconBtn = 'hidden flex-col items-center gap-0.5 text-[11px] font-semibold text-white/85 hover:text-white md:flex'

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-navy-900">
        Skip to content
      </a>
      {announcement.enabled && announcement.messages?.length ? (
        <AnnouncementBar messages={announcement.messages} background={announcement.background} color={announcement.textColor} interval={announcement.intervalSeconds} />
      ) : null}
      <StickyHeader>
        <div className="container-py flex items-center gap-3 py-3 md:gap-5">
          <Link href="/" aria-label={`${site.storeName} home`} className="shrink-0">
            {logo ? (
              <Image src={logo} alt={site.storeName} width={180} height={40} className="h-9 w-auto md:h-10" priority />
            ) : (
              <Logo className="h-8 origin-left transition-transform duration-300 group-data-[shrunk]/header:scale-90 md:h-10" />
            )}
          </Link>
          <SearchBox className="hidden flex-1 md:block" />
          <VehicleSelector className="ml-auto max-w-[46vw] md:ml-0 md:max-w-56" compact />
          <a href={whatsappLink(site.whatsapp)} target="_blank" rel="noopener noreferrer" className={iconBtn}>
            <WhatsAppIcon className="size-6 text-[#25D366]" /> <T k="whatsapp" />
          </a>
          <Link href="/account" className={iconBtn}>
            <User className="size-6" /> <T k="account" />
          </Link>
          <Link href="/account/wishlist" className={iconBtn}>
            <Heart className="size-6" /> <T k="wishlist" />
          </Link>
          <CartButton className="hidden text-white md:inline-flex" />
        </div>
        <div className="container-py pb-3 md:hidden">
          <SearchBox />
        </div>
        <nav aria-label="Main" className="hidden border-t border-white/8 md:block">
          <div className="container-py flex items-center gap-1">
            <CategoriesMenu categories={categories} />
            <MakesMenu makes={menuMakes} />
            {navigation.headerLinks?.map((l) => (
              <Link key={l.url} href={l.url} className="inline-flex h-11 items-center rounded-md px-3 text-sm font-semibold text-white/90 hover:bg-white/8 hover:text-white">
                {l.label}
              </Link>
            ))}
            <LangToggle className="ms-auto w-16 rounded-md py-1.5 text-center text-sm font-semibold text-white/90 hover:bg-white/8" />
            <a href={`tel:${site.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white">
              <Phone className="size-4 text-red-600" /> {site.phone}
            </a>
          </div>
        </nav>
      </StickyHeader>
    </>
  )
}
