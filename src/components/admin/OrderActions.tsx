'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

import { statusWhatsappText } from '@/lib/email/templates'

/** Sidebar on an order: WhatsApp the customer an update, open the invoice / packing slip. */
export default function OrderActions() {
  const { id } = useDocumentInfo()
  const fields = useFormFields(([f]) => f)
  const v = (k: string) => (fields[k]?.value as string | undefined) ?? ''
  if (!id) return null
  const phone = v('phone').replace(/\D/g, '').replace(/^0/, '92')
  const origin = typeof window === 'undefined' ? '' : window.location.origin
  const text = statusWhatsappText(
    { orderNumber: v('orderNumber'), status: v('status') as never, riderName: v('riderName'), riderPhone: v('riderPhone'), customerName: v('customerName') },
    `${origin}/track?order=${v('orderNumber')}`,
  )
  return (
    <div className="py-order-actions">
      <p className="py-order-actions__title">Quick actions</p>
      <a className="btn btn--style-primary btn--size-small py-wa" href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer" data-testid="order-whatsapp">
        WhatsApp status to customer
      </a>
      <a className="btn btn--style-secondary btn--size-small" href={`/api/tools/order-pdf/${id}`} target="_blank" rel="noreferrer">
        Invoice (PDF)
      </a>
      <a className="btn btn--style-secondary btn--size-small" href={`/api/tools/order-pdf/${id}?type=slip`} target="_blank" rel="noreferrer">
        Packing slip (PDF)
      </a>
      <p className="py-muted">Save the order first after changing the status, then send the WhatsApp.</p>
    </div>
  )
}
