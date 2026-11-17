import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
page.on('console', (m) => console.log('[console]', m.type(), m.text()))
page.on('pageerror', (e) => console.log('[pageerror]', String(e)))
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const probe = await page.evaluate(() => {
  const sam = document.querySelector('.hero-samurai')
  return {
    pinSpacers: document.querySelectorAll('.pin-spacer').length,
    samuraiInlineStyle: sam?.getAttribute('style'),
    titleInlineStyle: document.querySelector('.hero-title')?.getAttribute('style'),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    heroHeight: document.querySelector('.hero')?.getBoundingClientRect().height,
  }
})
console.log(JSON.stringify(probe, null, 2))
await browser.close()
