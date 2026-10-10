'use client'

import { Banknote, Building2, CreditCard, Loader2, Lock, Smartphone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

import { placeOrder } from '@/app/(frontend)/checkout/actions'
import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat'
import type { PaymentOption } from '@/lib/checkout/types'
import { cn, formatPrice } from '@/lib/utils'
import { whatsappLink } from '@/lib/whatsapp'

import { useCart } from '../providers/CartProvider'
import { CouponField, Totals } from './Summary'
import { useQuote } from './useQuote'

type Props = {
  zones: Array<{ city: string; areas: string[] }>
  methods: PaymentOption[]
  whatsapp: string
  defaults: { name: string; phone: string; email: string; city: string; area: string; address: string; vehicle: string }
  loggedIn: boolean
}

const METHOD_ICON: Record<string, typeof Banknote> = { cod: Banknote, bank_transfer: Building2, jazzcash: Smartphone, easypaisa: Smartphone, card: CreditCard }
const input = 'h-12 w-full rounded-lg border bg-white px-3 text-[15px] aria-[invalid=true]:border-red-600'

export function CheckoutForm({ zones, methods, whatsapp, defaults, loggedIn }: Props) {
  const router = useRouter()
  const { items, coupon, clear, ready } = useCart()
  const [city, setCity] = useState(defaults.city || zones[0]?.city || '')
  const [phone, setPhone] = useState(defaults.phone)
  const [method, setMethod] = useState(methods[0]?.id ?? 'cod')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const [usePoints, setUsePoints] = useState(false)
  const { quote, loading } = useQuote({ city, paymentMethod: method, phone, usePoints })
  const areas = zones.find((z) => z.city === city)?.areas ?? []

  useEffect(() => {
    if (!defaults.city) {
      try {
        const saved = localStorage.getItem('py_city')
        if (saved && zones.some((z) => z.city === saved)) setCity(saved)
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (ready && !items.length)
    return (
      <div className="rounded-brand border bg-white p-10 text-center">
        <p className="mb-3 font-heading text-2xl font-bold">Your cart is empty</p>
        <Link href="/search" className="font-semibold text-navy-500 hover:underline">
          Browse parts →
        </Link>
      </div>
    )

  const submit = (form: FormData) => {
    form.set('items', JSON.stringify(items.map((i) => ({ productId: i.productId, quantity: i.quantity }))))
    form.set('couponCode', coupon ?? '')
    form.set('paymentMethod', method)
    form.set('usePoints', usePoints ? '1' : '')
    setMessage(null)
    start(async () => {
      const res = await placeOrder(form)
      if (res.ok) {
        clear()
        if (res.redirect?.startsWith('http')) window.location.href = res.redirect
        else router.push(res.redirect ?? `/order/${res.orderNumber}?t=${res.token}`)
      } else {
        setErrors(res.errors ?? {})
        setMessage(res.message)
        document.getElementById('checkout-error')?.focus()
      }
    })
  }

  const err = (k: string) =>
    errors[k] ? (
      <span className="text-xs font-semibold text-red-700" id={`${k}-error`}>
        {errors[k]}
      </span>
    ) : null
  const field = (k: string) => ({ 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `${k}-error` : undefined })

  return (
    <form action={submit} className="grid gap-8 lg:grid-cols-[1fr_400px]" noValidate data-testid="checkout-form">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="space-y-6">
        {message ? (
          <p id="checkout-error" tabIndex={-1} className="rounded-lg border border-red-600/40 bg-red-600/5 p-4 font-semibold text-red-700" role="alert">
            {message}
          </p>
        ) : null}
        <section className="space-y-4 rounded-brand border bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">1. Your details</h2>
            {!loggedIn ? (
              <Link href="/account/login?next=/checkout" className="text-sm font-semibold text-navy-500 hover:underline">
                Have an account? Log in
              </Link>
            ) : null}
          </div>
          <label className="grid gap-1 text-sm font-semibold">
            Mobile number
            <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="0300-1234567" value={phone} onChange={(e) => setPhone(e.target.value)} className={input} {...field('phone')} />
            <span className="text-xs font-normal text-muted-foreground">We’ll call or WhatsApp you to confirm your order.</span>
            {err('phone')}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold">
              Full name
              <input name="name" autoComplete="name" required defaultValue={defaults.name} className={input} {...field('name')} />
              {err('name')}
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Email <span className="font-normal text-muted-foreground">(optional, for receipt)</span>
              <input name="email" type="email" autoComplete="email" defaultValue={defaults.email} className={input} {...field('email')} />
              {err('email')}
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-brand border bg-white p-5">
          <h2 className="text-2xl">2. Delivery</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold">
              City
              <select name="city" value={city} onChange={(e) => setCity(e.target.value)} className={input} {...field('city')}>
                {zones.map((z) => (
                  <option key={z.city}>{z.city}</option>
                ))}
                <option value="Other">Other city</option>
              </select>
              {err('city')}
            </label>
            {city === 'Other' ? (
              <label className="grid gap-1 text-sm font-semibold">
                Your city
                <input name="otherCity" required className={input} />
              </label>
            ) : areas.length ? (
              <label className="grid gap-1 text-sm font-semibold">
                Area
                <select name="area" defaultValue={defaults.area} className={input}>
                  {areas.map((a) => (
                    <option key={a}>{a}</option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="grid gap-1 text-sm font-semibold">
                Area
                <input name="area" defaultValue={defaults.area} className={input} />
              </label>
            )}
          </div>
          <label className="grid gap-1 text-sm font-semibold">
            Full address
            <textarea name="address" required rows={3} autoComplete="street-address" defaultValue={defaults.address} placeholder="House no., street, block, nearby landmark" className={cn(input, 'h-auto py-2')} {...field('address')} />
            {err('address')}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold">
              Vehicle <span className="font-normal text-muted-foreground">(helps us double-check fitment)</span>
              <input name="vehicle" defaultValue={defaults.vehicle} className={input} />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Note for us <span className="font-normal text-muted-foreground">(optional)</span>
              <input name="note" className={input} />
            </label>
          </div>
        </section>

        <section className="space-y-3 rounded-brand border bg-white p-5" aria-labelledby="pay-h">
          <h2 id="pay-h" className="text-2xl">
            3. Payment
          </h2>
          <div className="grid gap-3" role="radiogroup">
            {methods.map((m) => {
              const Icon = METHOD_ICON[m.id] ?? Banknote
              const active = method === m.id
              return (
                <label key={m.id} className={cn('cursor-pointer rounded-lg border-2 p-4 transition-colors', active ? 'border-red-600 bg-red-600/5' : 'hover:border-navy-500/40')}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="pm" value={m.id} checked={active} onChange={() => setMethod(m.id)} className="size-4 accent-red-600" data-testid={`pay-${m.id}`} />
                    <Icon className="size-5 text-navy-500" />
                    <span className="flex-1 font-semibold">{m.label}</span>
                    {m.fee ? <span className="text-xs text-muted-foreground">+{formatPrice(m.fee)}</span> : null}
                  </span>
                  {active && m.instructions ? <p className="mt-2 whitespace-pre-line pl-7 text-sm text-muted-foreground">{m.instructions}</p> : null}
                </label>
              )
            })}
          </div>
          {err('paymentMethod')}
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-brand border bg-white p-5 lg:sticky lg:top-36">
        <h2 className="text-2xl">Order summary</h2>
        <ul className="max-h-64 space-y-3 overflow-y-auto">
          {(quote?.lines ?? []).map((l) => (
            <li key={l.productId} className="flex gap-3 text-sm">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-md bg-navy-100">
                {l.image ? <Image src={l.image} alt="" fill sizes="56px" className="object-cover" /> : null}
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-navy-900 text-[10px] font-bold text-white">{l.quantity}</span>
              </span>
              <span className="line-clamp-2 flex-1">{l.title}</span>
              <span className="font-semibold">{formatPrice(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <CouponField />
        {quote && quote.pointsAvailable > 0 ? (
          <label className="flex items-start gap-2 rounded-lg bg-navy-100/60 p-3 text-sm">
            <input type="checkbox" checked={usePoints} onChange={(e) => setUsePoints(e.target.checked)} disabled={quote.pointsAvailable < quote.pointsMin} className="mt-0.5 size-4 accent-red-600" data-testid="use-points" />
            <span>
              Use my Yaar Points <strong>({quote.pointsAvailable} available)</strong>
              {quote.pointsAvailable < quote.pointsMin ? <span className="block text-xs text-muted-foreground">You can redeem from {quote.pointsMin} points.</span> : null}
            </span>
          </label>
        ) : null}
        <Totals quote={quote} loading={loading} />
        <button disabled={pending || !quote?.lines.length} className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-lg font-semibold text-white hover:bg-red-700 disabled:opacity-60" data-testid="place-order">
          {pending ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-5" />}
          {pending ? 'Placing order…' : `Place order${quote ? ` · ${formatPrice(quote.total)}` : ''}`}
        </button>
        <a href={whatsappLink(whatsapp, 'Assalam o Alaikum! I want to order on WhatsApp.')} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-sm font-semibold text-navy-500 hover:underline">
          <WhatsAppIcon className="size-4 text-[#25D366]" /> Prefer WhatsApp? Order there
        </a>
      </aside>
    </form>
  )
}
