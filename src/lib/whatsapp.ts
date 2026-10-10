/** wa.me link with a pre-filled message. `number` is international without "+", e.g. 923001234567. */
export function whatsappLink(number: string | null | undefined, message?: string): string {
  const digits = (number ?? '').replace(/\D/g, '')
  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

export function productWhatsappMessage(p: { title: string; sku?: string | null; price: number; url: string }): string {
  return `Assalam o Alaikum! I want to order:\n${p.title}\nSKU: ${p.sku ?? '-'}\nPrice: Rs ${p.price.toLocaleString('en-PK')}\n${p.url}`
}

/** Pakistani mobile numbers: 03XX-XXXXXXX (also accepts +92 / 92 / no dash). */
export function normalizePkPhone(input: string): string | null {
  let d = input.replace(/\D/g, '')
  if (d.startsWith('92')) d = `0${d.slice(2)}`
  if (!/^03\d{9}$/.test(d)) return null
  return `${d.slice(0, 4)}-${d.slice(4)}`
}
