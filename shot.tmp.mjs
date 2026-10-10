import { chromium } from '@playwright/test'
const [,, path = '/', name = 'page', full = '1'] = process.argv
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const [vp, w, h] of [['d', 1366, 900], ['m', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text().slice(0, 160))); p.on('pageerror', e => errs.push('PAGEERR ' + e.message.slice(0, 160)))
  await p.goto('http://localhost:3000' + path, { waitUntil: 'networkidle' })
  await p.waitForTimeout(800)
  await p.screenshot({ path: `/tmp/claude-0/${name}-${vp}.png`, fullPage: full === '1' })
  console.log(vp, 'errors:', errs)
}
await b.close()
