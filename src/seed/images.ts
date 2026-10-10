import sharp from 'sharp'

/** Placeholder artwork rendered at seed time. Real photos replace these from the admin. */

const NAVY = '#0A1A33'
const NAVY5 = '#1E4A8A'
const RED = '#E10600'
const STEEL = '#8A97AB'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Part illustrations, drawn around (0,0) in a ~400px box. */
const GLYPHS: Record<string, string> = {
  disc: `<circle r="190" fill="${NAVY}"/><circle r="150" fill="#2b3f5f"/><circle r="70" fill="${NAVY}"/><circle r="26" fill="#d9e1ee"/>
    ${[0, 72, 144, 216, 288].map((a) => `<circle cx="${Math.cos((a * Math.PI) / 180) * 46}" cy="${Math.sin((a * Math.PI) / 180) * 46}" r="9" fill="#d9e1ee"/>`).join('')}
    <path d="M-150 -40 A160 160 0 0 1 -40 -150 L-20 -110 A120 120 0 0 0 -110 -20Z" fill="${RED}"/>`,
  filter: `<rect x="-130" y="-170" width="260" height="340" rx="40" fill="${NAVY}"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${-110 + i * 26}" y="-130" width="12" height="260" rx="6" fill="#2b3f5f"/>`).join('')}
    <rect x="-140" y="-190" width="280" height="50" rx="16" fill="${RED}"/><circle cy="-165" r="14" fill="#fff"/>`,
  engine: `<g fill="${NAVY}">${Array.from({ length: 12 }, (_, i) => `<rect x="-26" y="-200" width="52" height="70" rx="10" transform="rotate(${i * 30})"/>`).join('')}</g>
    <circle r="150" fill="${NAVY}"/><circle r="90" fill="#2b3f5f"/><circle r="40" fill="${RED}"/>`,
  lightbulb: `<path d="M-200 -60 Q-180 -150 -40 -160 L170 -140 Q210 -60 180 60 L-160 120 Q-210 60 -200 -60Z" fill="${NAVY}"/>
    <circle cx="-70" cy="-30" r="70" fill="#d9e1ee"/><circle cx="-70" cy="-30" r="40" fill="#fff"/><circle cx="80" cy="-30" r="48" fill="#d9e1ee"/>
    <path d="M-170 95 L150 50" stroke="${RED}" stroke-width="16" stroke-linecap="round"/>`,
  cog: `<rect x="-40" y="-200" width="80" height="120" rx="14" fill="${NAVY}"/>
    <path d="M-90 -70 L90 -40 L-90 -10 L90 20 L-90 50 L90 80 L-90 110" fill="none" stroke="${RED}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="-22" y="-80" width="44" height="260" rx="10" fill="#2b3f5f"/><rect x="-60" y="170" width="120" height="30" rx="10" fill="${NAVY}"/>`,
  'car-front': `<path d="M-210 60 L-180 -40 Q-160 -120 -80 -130 L80 -130 Q160 -120 180 -40 L210 60 L210 140 L-210 140Z" fill="${NAVY}"/>
    <path d="M-140 -40 L-120 -100 L120 -100 L140 -40Z" fill="#d9e1ee"/>
    <circle cx="-130" cy="40" r="30" fill="#fff"/><circle cx="130" cy="40" r="30" fill="#fff"/><rect x="-70" y="20" width="140" height="44" rx="10" fill="${RED}"/>`,
  droplet: `<rect x="-120" y="-120" width="240" height="300" rx="36" fill="${NAVY}"/><rect x="-60" y="-190" width="120" height="80" rx="16" fill="${RED}"/>
    <rect x="-90" y="-40" width="180" height="140" rx="16" fill="#d9e1ee"/><path d="M0 -20 Q40 30 0 70 Q-40 30 0 -20Z" fill="${RED}"/>`,
  snowflake: `<g stroke="${NAVY}" stroke-width="26" stroke-linecap="round">${[0, 60, 120].map((a) => `<line x1="0" y1="-190" x2="0" y2="190" transform="rotate(${a})"/>`).join('')}</g>
    <circle r="56" fill="${RED}"/>`,
  battery: `<rect x="-200" y="-120" width="400" height="260" rx="28" fill="${NAVY}"/><rect x="-150" y="-160" width="70" height="44" rx="8" fill="${RED}"/>
    <rect x="80" y="-160" width="70" height="44" rx="8" fill="#2b3f5f"/><path d="M-20 -60 L-60 20 L0 20 L-20 90 L60 -10 L0 -10 L20 -60Z" fill="#F5A524"/>`,
  sparkles: `<path d="M0 -200 L40 -40 L200 0 L40 40 L0 200 L-40 40 L-200 0 L-40 -40Z" fill="${NAVY}"/><circle r="50" fill="${RED}"/>`,
  wrench: `<path d="M-160 160 L40 -40" stroke="${NAVY}" stroke-width="60" stroke-linecap="round"/><circle cx="90" cy="-90" r="90" fill="${NAVY}"/>
    <path d="M60 -180 L120 -120 L180 -150 L150 -60Z" fill="#f4f7fb"/><circle cx="-150" cy="150" r="14" fill="${RED}"/>`,
}

export function glyphFor(icon: string | undefined): string {
  return GLYPHS[icon ?? 'wrench'] ?? GLYPHS.wrench
}

async function toPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer()
}

/** 1200×1200 product shot: light studio background, part glyph, brand + OEM caption. */
export function productImage(opts: { icon?: string; title: string; brand: string; oem: string; variant?: number }) {
  const tilt = ((opts.variant ?? 0) % 3) * 8 - 8
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
    <defs><radialGradient id="g" cx="50%" cy="42%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3eaf4"/></radialGradient></defs>
    <rect width="1200" height="1200" fill="url(#g)"/>
    <ellipse cx="600" cy="800" rx="300" ry="34" fill="#0A1A33" opacity="0.12"/>
    <g transform="translate(600 500) rotate(${tilt}) scale(1.25)">${glyphFor(opts.icon)}</g>
    <rect x="${1130 - Math.max(140, opts.brand.length * 26 + 60)}" y="70" width="${Math.max(140, opts.brand.length * 26 + 60)}" height="64" rx="32" fill="${NAVY}"/>
    <text x="${1130 - Math.max(140, opts.brand.length * 26 + 60) / 2}" y="113" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="30" fill="#fff">${esc(opts.brand)}</text>
    <text x="600" y="960" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="52" fill="${NAVY}">${esc(opts.title)}</text>
    <text x="600" y="1030" text-anchor="middle" font-family="DejaVu Sans Mono, monospace" font-size="36" fill="${STEEL}">${esc(opts.oem)}</text>
  </svg>`
  return toPng(svg)
}

/** 600×600 category tile art: navy background, glyph in white-ish tones. */
export function categoryImage(opts: { icon?: string; name: string }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8eef7"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs>
    <rect width="800" height="800" fill="url(#g)"/>
    <circle cx="400" cy="380" r="300" fill="${NAVY5}" opacity="0.08"/>
    <g transform="translate(400 380) scale(1.1)">${glyphFor(opts.icon)}</g>
  </svg>`
  return toPng(svg)
}

/** Make badge: wordmark on white roundel (until the owner uploads the real logo). */
export function makeLogo(name: string) {
  const size = name.length > 10 ? 64 : name.length > 6 ? 84 : 104
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
    <rect width="600" height="600" rx="120" fill="#ffffff"/>
    <circle cx="300" cy="300" r="250" fill="none" stroke="${NAVY}" stroke-width="10" opacity="0.15"/>
    <text x="300" y="${300 + size / 3}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="${size}" fill="${NAVY}">${esc(name)}</text>
  </svg>`
  return toPng(svg)
}

/** Car silhouette for model tiles. */
export function modelImage(name: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="600" viewBox="0 0 1000 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12305C"/><stop offset="1" stop-color="#06122A"/></linearGradient></defs>
    <rect width="1000" height="600" fill="url(#g)"/>
    <path d="M120 400 Q130 330 210 315 L330 300 Q400 220 520 215 Q640 215 720 300 L840 320 Q890 335 890 400 Z" fill="#1E4A8A"/>
    <path d="M360 300 Q420 245 510 242 L520 300Z M545 300 L548 243 Q630 248 690 300Z" fill="#8A97AB" opacity="0.6"/>
    <circle cx="280" cy="405" r="58" fill="#06122A" stroke="#8A97AB" stroke-width="12"/><circle cx="730" cy="405" r="58" fill="#06122A" stroke="#8A97AB" stroke-width="12"/>
    <path d="M110 470 L900 470" stroke="${RED}" stroke-width="6" opacity="0.7"/>
    <text x="500" y="120" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-weight="700" font-size="64" fill="#ffffff">${esc(name)}</text>
  </svg>`
  return toPng(svg)
}

/** Wide banner background: navy with a red light streak and a big glyph on the right. */
export function bannerImage(opts: { icon?: string; tone?: 'navy' | 'red' }) {
  const bg = opts.tone === 'red' ? ['#E10600', '#7a0300'] : ['#12305C', '#06122A']
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="720" viewBox="0 0 1920 720">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
      <linearGradient id="s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${RED}" stop-opacity="0"/><stop offset="0.6" stop-color="${opts.tone === 'red' ? '#fff' : RED}" stop-opacity="0.8"/><stop offset="1" stop-color="${RED}" stop-opacity="0"/></linearGradient>
    </defs>
    <rect width="1920" height="720" fill="url(#g)"/>
    <rect x="-200" y="470" width="2400" height="8" fill="url(#s)" transform="rotate(-8 960 360)"/>
    <circle cx="1450" cy="360" r="320" fill="#ffffff" opacity="0.06"/>
    <g transform="translate(1450 360) scale(1.25)" opacity="0.95">${glyphFor(opts.icon).replaceAll(NAVY, '#e8eef7').replaceAll('#2b3f5f', '#8A97AB')}</g>
  </svg>`
  return toPng(svg)
}
