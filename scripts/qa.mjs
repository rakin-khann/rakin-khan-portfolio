import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = './qa'

async function shoot(page, name) {
  await page.waitForTimeout(450)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log('saved', name)
}

const browser = await chromium.launch()

// ---------- Desktop ----------
const desktop = await browser.newPage({ viewport: { width: 1600, height: 900 } })
const errors = []
desktop.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
desktop.on('pageerror', (e) => errors.push(String(e)))
await desktop.goto(BASE, { waitUntil: 'networkidle' })
await desktop.waitForTimeout(1200)

await shoot(desktop, '01-desktop-hero-initial')

// advance the pinned scrub timeline (scroll down inside the pin)
await desktop.mouse.move(800, 450)
await desktop.mouse.wheel(0, 700)
await shoot(desktop, '02-desktop-hero-mid')

await desktop.mouse.wheel(0, 900)
await shoot(desktop, '03-desktop-hero-revealed')

// about section
await desktop.mouse.wheel(0, 1400)
await shoot(desktop, '04-desktop-about')

// services / portfolio
await desktop.evaluate(() => document.querySelector('#services')?.scrollIntoView())
await shoot(desktop, '05-desktop-services')

await desktop.evaluate(() => document.querySelector('#portfolio')?.scrollIntoView())
await desktop.waitForTimeout(600)
await shoot(desktop, '06-desktop-portfolio')

await desktop.evaluate(() => document.querySelector('#skills')?.scrollIntoView())
await desktop.waitForTimeout(1800)
await shoot(desktop, '07-desktop-skills')

await desktop.evaluate(() => document.querySelector('#contact')?.scrollIntoView())
await shoot(desktop, '08-desktop-contact')

// scroll back up: samurai must return to its initial foreground position
await desktop.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
await shoot(desktop, '09-desktop-hero-restored')

const desktopOverflow = await desktop.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
)
console.log('desktop horizontal overflow px:', desktopOverflow)
console.log('console errors:', errors.length ? errors : 'none')

// ---------- Mobile ----------
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
})
await mobile.goto(BASE, { waitUntil: 'networkidle' })
await mobile.waitForTimeout(1200)
await shoot(mobile, '10-mobile-hero-initial')

await mobile.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }))
await shoot(mobile, '11-mobile-hero-mid')

await mobile.evaluate(() => window.scrollTo({ top: 1600, behavior: 'instant' }))
await shoot(mobile, '12-mobile-hero-revealed')

await mobile.evaluate(() => document.querySelector('#services')?.scrollIntoView())
await shoot(mobile, '13-mobile-services')

await mobile.evaluate(() => document.querySelector('#contact')?.scrollIntoView())
await shoot(mobile, '14-mobile-contact')

const mobileOverflow = await mobile.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
)
console.log('mobile horizontal overflow px:', mobileOverflow)

await browser.close()
console.log('QA DONE')
