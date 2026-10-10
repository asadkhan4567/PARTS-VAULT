'use client'

import { MapPin, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Countdown } from '@/components/motion/Countdown'
import { deliveryEta, deliveryFee, findZone, msUntilCutoff, type DeliveryConfig } from '@/lib/delivery'
import { formatPrice } from '@/lib/utils'

const CITY_KEY = 'py_city'

/** Delivery ETA + fee for the shopper's city, with the same-day cutoff countdown. */
export function DeliveryEstimate({ delivery, price, inStock }: { delivery: DeliveryConfig; price: number; inStock: boolean }) {
  const cities = (delivery.zones ?? []).map((z) => z.city)
  const [city, setCity] = useState(cities[0] ?? '')
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CITY_KEY)
      if (saved && cities.includes(saved)) setCity(saved)
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const zone = findZone(delivery, city)
  const fee = deliveryFee(delivery, city, price)
  const sameDayOpen = Boolean(zone?.sameDay && delivery.sameDayEnabled && msUntilCutoff(delivery.sameDayCutoff) > 0)

  return (
    <div className="space-y-3 rounded-brand border bg-white p-4 text-sm" data-testid="delivery-estimate">
      <label className="flex items-center gap-2">
        <MapPin className="size-4 text-red-600" />
        <span className="text-muted-foreground">Deliver to</span>
        <select
          value={city}
          onChange={(e) => {
            setCity(e.target.value)
            try {
              localStorage.setItem(CITY_KEY, e.target.value)
            } catch {
              // ignore
            }
          }}
          className="h-9 flex-1 rounded-lg border bg-white px-2 font-semibold"
        >
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
          <option value="Other">Other city</option>
        </select>
      </label>
      <p className="flex items-start gap-2">
        <Truck className="mt-0.5 size-4 shrink-0 text-red-600" />
        <span>
          <strong>{inStock ? deliveryEta(delivery, city) : 'Ships when back in stock'}</strong>
          <span className="text-muted-foreground"> · {fee === 0 ? 'Free delivery' : `Delivery ${formatPrice(fee)}`}</span>
        </span>
      </p>
      {sameDayOpen && inStock ? (
        <p className="flex flex-wrap items-center gap-2 rounded-lg bg-success/10 px-3 py-2 font-semibold text-[#0f7a37]">
          Order within <Countdown cutoff={delivery.sameDayCutoff} compact className="font-bold" /> for same-day delivery
        </p>
      ) : null}
      {delivery.freeDeliveryThreshold ? <p className="text-xs text-muted-foreground">Free delivery on orders over {formatPrice(delivery.freeDeliveryThreshold)}.</p> : null}
    </div>
  )
}
