import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from 'pdf-lib'

import type { Order, SiteSetting } from '@/payload-types'

import { PAYMENT_METHODS } from '../orders/status'
import { statusLabel } from '../orders/status'

const NAVY = rgb(10 / 255, 26 / 255, 51 / 255)
const RED = rgb(225 / 255, 6 / 255, 0)
const STEEL = rgb(138 / 255, 151 / 255, 171 / 255)
const LIGHT = rgb(232 / 255, 238 / 255, 247 / 255)

/** Standard PDF fonts only cover WinAnsi; replace anything else so generation never fails. */
const safe = (s: unknown) =>
  String(s ?? '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E–— -ÿ]/g, '')

const rs = (n: number | null | undefined) => `Rs ${Math.round(n ?? 0).toLocaleString('en-US')}`

function fit(text: string, font: PDFFont, size: number, max: number): string {
  let t = safe(text)
  if (font.widthOfTextAtSize(t, size) <= max) return t
  while (t.length > 3 && font.widthOfTextAtSize(`${t}...`, size) > max) t = t.slice(0, -1)
  return `${t}...`
}

function shield(page: PDFPage, x: number, y: number, s: number) {
  page.drawSvgPath('M22 3 39 9v13c0 11-7.4 19.3-17 23C12.4 41.3 5 33 5 22V9l17-6Z', { x, y, scale: s, color: RED })
  page.drawCircle({ x: x + 22 * s, y: y - 23 * s, size: 9.5 * s, borderColor: rgb(1, 1, 1), borderWidth: 2.2 * s })
  page.drawCircle({ x: x + 22 * s, y: y - 23 * s, size: 2.6 * s, color: rgb(1, 1, 1) })
}

/** A4 invoice (with prices) or packing slip (items + tick boxes) for an order. */
export async function orderPdf(order: Order, site: SiteSetting, kind: 'invoice' | 'slip'): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  pdf.setTitle(`${kind === 'invoice' ? 'Invoice' : 'Packing slip'} ${order.orderNumber}`)
  pdf.setAuthor(safe(site.storeName))
  const page = pdf.addPage([595.28, 841.89])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const { width, height } = page.getSize()
  const M = 40
  const text = (s: unknown, x: number, y: number, o: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb> } = {}) =>
    page.drawText(safe(s), { x, y, size: o.size ?? 10, font: o.f ?? font, color: o.color ?? NAVY })
  const right = (s: unknown, x: number, y: number, o: { size?: number; f?: PDFFont; color?: ReturnType<typeof rgb> } = {}) => {
    const str = safe(s)
    const w = (o.f ?? font).widthOfTextAtSize(str, o.size ?? 10)
    text(str, x - w, y, o)
  }

  // Header band
  page.drawRectangle({ x: 0, y: height - 90, width, height: 90, color: NAVY })
  shield(page, M - 4, height - 20, 1.15)
  text('Parts', M + 50, height - 55, { size: 24, f: bold, color: rgb(1, 1, 1) })
  text('Yaar', M + 50 + bold.widthOfTextAtSize('Parts', 24), height - 55, { size: 24, f: bold, color: RED })
  text('.com', M + 50 + bold.widthOfTextAtSize('PartsYaar', 24), height - 55, { size: 11, color: STEEL })
  right(kind === 'invoice' ? 'INVOICE' : 'PACKING SLIP', width - M, height - 45, { size: 18, f: bold, color: rgb(1, 1, 1) })
  right(order.orderNumber, width - M, height - 64, { size: 11, color: STEEL })

  // Store + order meta
  let y = height - 120
  const store = site.stores?.[0]
  text(site.storeName, M, y, { f: bold, size: 11 })
  if (store?.address) text(store.address, M, (y -= 14), { size: 9 })
  text(`Phone ${site.phone}  ·  WhatsApp +${site.whatsapp}`, M, (y -= 14), { size: 9 })
  if (site.ntn || site.strn) text([site.ntn ? `NTN ${site.ntn}` : '', site.strn ? `STRN ${site.strn}` : ''].filter(Boolean).join('  ·  '), M, (y -= 14), { size: 9 })

  let ry = height - 120
  const meta: Array<[string, string]> = [
    ['Date', new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })],
    ['Status', statusLabel(order.status)],
    ['Payment', `${PAYMENT_METHODS.find((p) => p.value === order.paymentMethod)?.label ?? order.paymentMethod} (${order.paymentStatus})`],
  ]
  for (const [k, v] of meta) {
    right(`${k}: ${v}`, width - M, ry, { size: 9 })
    ry -= 14
  }

  // Bill / ship to
  y = Math.min(y, ry) - 28
  page.drawRectangle({ x: M, y: y - 62, width: width - 2 * M, height: 72, color: LIGHT })
  text(kind === 'invoice' ? 'BILL & SHIP TO' : 'SHIP TO', M + 12, y - 6, { size: 8, f: bold, color: STEEL })
  text(order.customerName, M + 12, y - 22, { f: bold, size: 11 })
  text(`${order.phone}${order.email ? `  ·  ${order.email}` : ''}`, M + 12, y - 36, { size: 9 })
  text(fit(`${order.address}, ${order.area ? `${order.area}, ` : ''}${order.city}`, font, 9, width - 2 * M - 24), M + 12, y - 50, { size: 9 })
  if (order.vehicle) right(`Vehicle: ${order.vehicle}`, width - M - 12, y - 22, { size: 9 })

  // Items table
  y -= 90
  const cols = kind === 'invoice' ? { item: M, sku: 290, qty: 380, unit: 420, total: width - M } : { item: M, sku: 330, qty: 450, unit: 0, total: width - M }
  page.drawRectangle({ x: M, y: y - 6, width: width - 2 * M, height: 22, color: NAVY })
  const hy = y + 1
  text('ITEM', cols.item + 8, hy, { size: 8, f: bold, color: rgb(1, 1, 1) })
  text('SKU', cols.sku, hy, { size: 8, f: bold, color: rgb(1, 1, 1) })
  right('QTY', cols.qty + 20, hy, { size: 8, f: bold, color: rgb(1, 1, 1) })
  if (kind === 'invoice') {
    right('UNIT', cols.unit + 50, hy, { size: 8, f: bold, color: rgb(1, 1, 1) })
    right('TOTAL', cols.total - 8, hy, { size: 8, f: bold, color: rgb(1, 1, 1) })
  } else right('PACKED', cols.total - 8, hy, { size: 8, f: bold, color: rgb(1, 1, 1) })
  y -= 26
  for (const [i, item] of (order.items ?? []).entries()) {
    if (i % 2 === 1) page.drawRectangle({ x: M, y: y - 6, width: width - 2 * M, height: 20, color: rgb(0.97, 0.98, 1) })
    text(fit(item.title, font, 9, cols.sku - cols.item - 16), cols.item + 8, y, { size: 9 })
    text(fit(item.sku ?? '', font, 8, (kind === 'invoice' ? cols.qty : cols.qty) - cols.sku - 30), cols.sku, y, { size: 8, color: STEEL })
    right(item.quantity, cols.qty + 20, y, { size: 9, f: bold })
    if (kind === 'invoice') {
      right(rs(item.unitPrice), cols.unit + 50, y, { size: 9 })
      right(rs(item.lineTotal ?? item.unitPrice * item.quantity), cols.total - 8, y, { size: 9 })
    } else page.drawRectangle({ x: cols.total - 26, y: y - 3, width: 12, height: 12, borderColor: NAVY, borderWidth: 1 })
    y -= 20
    if (y < 140) break
  }

  if (kind === 'invoice') {
    y -= 10
    const rows: Array<[string, number, boolean?]> = [
      ['Subtotal', order.subtotal ?? 0],
      ...(order.discount ? ([[`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`, -order.discount]] as Array<[string, number]>) : []),
      ['Delivery', order.deliveryFee ?? 0],
      ...(order.codFee ? ([['COD fee', order.codFee]] as Array<[string, number]>) : []),
      ['Total', order.total ?? 0, true],
    ]
    for (const [k, v, strong] of rows) {
      if (strong) {
        y -= 8
        page.drawRectangle({ x: width - M - 200, y: y - 7, width: 200, height: 24, color: RED })
        text(k, width - M - 190, y, { f: bold, size: 11, color: rgb(1, 1, 1) })
        right(rs(v), width - M - 8, y, { f: bold, size: 11, color: rgb(1, 1, 1) })
      } else {
        text(k, width - M - 190, y, { size: 9 })
        right(v < 0 ? `-${rs(-v)}` : rs(v), width - M - 8, y, { size: 9 })
      }
      y -= 18
    }
  }

  // Footer
  page.drawLine({ start: { x: M, y: 70 }, end: { x: width - M, y: 70 }, thickness: 0.5, color: STEEL })
  text(kind === 'invoice' ? 'Thank you for shopping with Partsyaar.com — Genuine Parts. Locked In. Delivered Fast.' : 'Check every item against this slip before sealing the box.', M, 54, { size: 8, color: STEEL })
  text('7-day returns on unused parts in original packaging. Warranty claims: share your order number on WhatsApp.', M, 42, { size: 8, color: STEEL })
  return pdf.save()
}
