import type { Metadata } from 'next'

import { CheckoutForm } from '@/components/cart/CheckoutForm'
import { getSettings } from '@/lib/data/settings'
import { availablePayments } from '@/lib/payments'
import { getCustomer, getVehicle } from '@/lib/session'
import { vehicleLabel } from '@/lib/vehicle'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } }

export default async function CheckoutPage() {
  const [{ delivery, payments, site }, customer, vehicle] = await Promise.all([getSettings(), getCustomer(), getVehicle()])
  const methods = availablePayments(payments, delivery.codFee ?? 0, delivery.codEnabled !== false)
  const address = customer?.addresses?.[0]
  return (
    <div className="bg-navy-100/40">
      <div className="container-py py-10">
        <h1 className="mb-6 text-4xl">Checkout</h1>
        <CheckoutForm
          zones={(delivery.zones ?? []).map((z) => ({ city: z.city, areas: z.areas ?? [] }))}
          methods={methods}
          whatsapp={site.whatsapp}
          defaults={{
            name: customer?.name ?? '',
            phone: customer?.phone ?? '',
            email: customer?.email ?? '',
            city: address?.city ?? '',
            area: address?.area ?? '',
            address: address?.address ?? '',
            vehicle: vehicle ? vehicleLabel(vehicle) : '',
          }}
          loggedIn={Boolean(customer)}
        />
      </div>
    </div>
  )
}
