import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
page.on('pageerror', (e) => console.log('[pageerror]', String(e)))
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

const probe = await page.evaluate(() => {
  return {
    debug: window.__heroDebug ?? null,
    pinSpacers: document.querySelectorAll('.pin-spacer').length,
    samuraiStyle: document.querySelector('.hero-samurai')?.getAttribute('style'),
    titleStyle: document.querySelector('.hero-title')?.getAttribute('style'),
  }
})
console.log(JSON.stringify(probe, null, 2))
await browser.close()
