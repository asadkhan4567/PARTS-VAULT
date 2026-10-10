import { ShieldCheck, Truck, Wrench } from 'lucide-react'
import Link from 'next/link'

import { Logo } from '@/components/brand/Logo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

// Phase 0 placeholder: proves the design system end to end. Replaced by the CMS-driven home
// (layout blocks from the Homepage global) in Phase 2.
export default function HomePage() {
  return (
    <main>
      <section className="bg-hero relative overflow-hidden text-white">
        <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col justify-center gap-8 px-5 py-16">
          <Logo className="h-12 self-start" />
          <h1 className="max-w-3xl text-5xl leading-[1.05] md:text-7xl">
            Genuine Parts. <span className="text-red-600">Locked In.</span> Delivered Fast.
          </h1>
          <p className="max-w-xl text-lg text-steel-400">
            Genuine OEM and premium aftermarket parts for Toyota, Honda, Kia, Audi and more —
            same-day delivery across Lahore.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/admin">Open admin panel</Link>
            </Button>
            <Button size="lg" variant="glass">
              Select vehicle
            </Button>
          </div>
          <div className="glass grid max-w-2xl gap-4 rounded-brand p-5 sm:grid-cols-3">
            {[
              { icon: Truck, label: 'Same-day delivery', sub: 'Under 60 min in Lahore' },
              { icon: ShieldCheck, label: '100% Genuine', sub: 'OEM & trusted brands' },
              { icon: Wrench, label: '5,000+ Parts', sub: '18 brands in stock' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3">
                <Icon className="mt-0.5 size-5 text-red-600" aria-hidden />
                <div>
                  <p className="font-heading text-lg font-semibold">{label}</p>
                  <p className="text-sm text-steel-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <article className="max-w-sm rounded-brand border bg-card p-5 shadow-navy">
          <div className="mb-3 flex gap-2">
            <Badge variant="navy">Genuine</Badge>
            <Badge variant="success">In stock</Badge>
          </div>
          <h2 className="text-xl">Front Brake Pads – Toyota Corolla [14–22]</h2>
          <p className="mt-1 font-mono text-sm text-muted-foreground">OEM 04465-02220 · Hitachi</p>
          <p className="mt-3 text-2xl font-bold text-red-600">{formatPrice(8425)}</p>
        </article>
      </section>
    </main>
  )
}
