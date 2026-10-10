import type { Order } from '@/payload-types'

import { statusLabel } from '../orders/status'
import { formatPrice } from '../utils'

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

function layout(title: string, body: string, footer = 'Partsyaar.com — Genuine Parts. Locked In. Delivered Fast.') {
  return `<!doctype html><html><body style="margin:0;background:#E8EEF7;font-family:Inter,Arial,sans-serif;color:#06122A">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden">
    <tr><td style="background:#0A1A33;padding:20px 24px;font-size:22px;font-weight:700;color:#fff">Parts<span style="color:#E10600">Yaar</span><span style="color:#8A97AB;font-size:13px">.com</span></td></tr>
    <tr><td style="padding:24px"><h1 style="margin:0 0 12px;font-size:22px">${esc(title)}</h1>${body}</td></tr>
    <tr><td style="background:#06122A;color:#8A97AB;font-size:12px;padding:16px 24px">${esc(footer)}</td></tr>
  </table></td></tr></table></body></html>`
}

function itemsTable(order: Order) {
  const rows = (order.items ?? [])
    .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #E8EEF7">${esc(i.title)} × ${i.quantity}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #E8EEF7">${formatPrice(i.lineTotal ?? i.unitPrice * i.quantity)}</td></tr>`)
    .join('')
  const line = (label: string, v: number, bold = false) =>
    `<tr><td style="padding:4px 0;${bold ? 'font-weight:700;font-size:16px' : ''}">${label}</td><td align="right" style="padding:4px 0;${bold ? 'font-weight:700;font-size:16px;color:#E10600' : ''}">${formatPrice(v)}</td></tr>`
  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}
    ${line('Subtotal', order.subtotal ?? 0)}
    ${order.discount ? line(`Discount${order.couponCode ? ` (${esc(order.couponCode)})` : ''}`, -order.discount) : ''}
    ${line('Delivery', order.deliveryFee ?? 0)}
    ${order.codFee ? line('COD fee', order.codFee) : ''}
    ${line('Total', order.total ?? 0, true)}</table>`
}

export function orderConfirmationEmail(order: Order, opts: { trackUrl: string; paymentInstructions?: string | null }) {
  const body = `<p>Assalam o Alaikum ${esc(order.customerName)},</p>
    <p>Thank you! We’ve received order <strong>${esc(order.orderNumber)}</strong>. We’ll call or WhatsApp you on ${esc(order.phone)} to confirm.</p>
    ${order.deliveryEta ? `<p><strong>Delivery:</strong> ${esc(order.deliveryEta)}</p>` : ''}
    ${itemsTable(order)}
    <p style="margin-top:16px"><strong>Deliver to:</strong> ${esc(order.address)}, ${esc(order.area ?? '')} ${esc(order.city)}</p>
    ${opts.paymentInstructions ? `<p style="white-space:pre-line;background:#E8EEF7;padding:12px;border-radius:8px"><strong>Payment:</strong>\n${esc(opts.paymentInstructions)}</p>` : ''}
    <p><a href="${esc(opts.trackUrl)}" style="display:inline-block;background:#E10600;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Track your order</a></p>`
  return { subject: `Order ${order.orderNumber} received — Partsyaar.com`, html: layout('Your order is in the vault 🔒', body) }
}

export function newOrderAlertEmail(order: Order, adminUrl: string) {
  const body = `<p><strong>${esc(order.customerName)}</strong> · ${esc(order.phone)} · ${esc(order.city)}</p>
    <p>Payment: ${esc(order.paymentMethod)} · Total <strong>${formatPrice(order.total ?? 0)}</strong></p>
    ${itemsTable(order)}
    <p><a href="${esc(adminUrl)}" style="display:inline-block;background:#0A1A33;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Open in admin</a></p>`
  return { subject: `🛒 New order ${order.orderNumber} — ${formatPrice(order.total ?? 0)}`, html: layout(`New order ${order.orderNumber}`, body) }
}

export function statusUpdateEmail(order: Order, trackUrl: string) {
  const extra =
    order.status === 'out_for_delivery' && order.riderName
      ? `<p>Your rider <strong>${esc(order.riderName)}</strong>${order.riderPhone ? ` (${esc(order.riderPhone)})` : ''} is on the way.</p>`
      : ''
  const body = `<p>Order <strong>${esc(order.orderNumber)}</strong> is now: <strong style="color:#E10600">${esc(statusLabel(order.status))}</strong>.</p>${extra}
    <p><a href="${esc(trackUrl)}" style="display:inline-block;background:#E10600;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:700">Track your order</a></p>`
  return { subject: `Order ${order.orderNumber}: ${statusLabel(order.status)}`, html: layout(`Order update: ${statusLabel(order.status)}`, body) }
}

/** Pre-filled WhatsApp message staff can send the customer for a status change. */
export function statusWhatsappText(order: Pick<Order, 'orderNumber' | 'status' | 'riderName' | 'riderPhone' | 'customerName'>, trackUrl: string) {
  const rider = order.status === 'out_for_delivery' && order.riderName ? ` Rider: ${order.riderName}${order.riderPhone ? ` (${order.riderPhone})` : ''}.` : ''
  return `Assalam o Alaikum ${order.customerName}! Your Partsyaar order ${order.orderNumber} is now: ${statusLabel(order.status)}.${rider} Track: ${trackUrl}`
}
