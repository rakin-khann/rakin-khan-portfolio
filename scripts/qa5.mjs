import { chromium } from 'playwright'

const browser = await chromium.launch()

// --- Mobile menu test ---
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await mobile.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await mobile.waitForTimeout(1000)
await mobile.tap('.menu-btn')
await mobile.waitForTimeout(700)
await mobile.screenshot({ path: './qa/30-mobile-menu.png' })
await mobile.tap('.mobile-menu-list a[href="#services"]')
await mobile.waitForTimeout(1600)
const m = await mobile.evaluate(() => ({
  menuOpen: document.querySelector('.mobile-menu')?.classList.contains('open'),
  nearServices: Math.abs((document.querySelector('#services')?.getBoundingClientRect().top ?? 0)) < 400,
}))
console.log('mobile menu:', JSON.stringify(m))

// --- Desktop nav + CTA test ---
const desktop = await browser.newPage({ viewport: { width: 1600, height: 900 } })
await desktop.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await desktop.waitForTimeout(1000)
await desktop.click('a.nav-link[href="#skills"]')
await desktop.waitForTimeout(2500)
const d = await desktop.evaluate(() => ({
  skillsVisible: Math.abs(document.querySelector('#skills')?.getBoundingClientRect().top ?? 9999) < 500,
  mailto: document.querySelector('.contact-card')?.getAttribute('href'),
  footerVisible: !!document.querySelector('.footer'),
}))
console.log('desktop nav:', JSON.stringify(d))
await desktop.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
await desktop.waitForTimeout(900)
await desktop.screenshot({ path: './qa/31-desktop-footer.png' })

await browser.close()
console.log('DONE')
