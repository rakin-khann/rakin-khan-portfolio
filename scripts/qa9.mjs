import { chromium } from 'playwright'

const browser = await chromium.launch()

async function measure(page, label) {
  const m = await page.evaluate(() => {
    const img = document.querySelector('.hero-samurai img')
    const r = img.getBoundingClientRect()
    const hero = document.querySelector('.hero').getBoundingClientRect()
    return {
      vp: `${innerWidth}x${innerHeight}`,
      imgW: Math.round(r.width),
      imgH: Math.round(r.height),
      aspect: +(r.width / r.height).toFixed(4),
      heightPct: +((r.height / hero.height) * 100).toFixed(1),
      scrollable: document.documentElement.scrollHeight - innerHeight,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
  console.log(label, JSON.stringify(m))
}

// ---------- Desktop 1920x1080 ----------
const d = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await d.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await d.waitForTimeout(1400)
await measure(d, 'desktop-initial')
await d.screenshot({ path: './qa/60-fix-hero-initial.png' })

// pin distance is now 100% of 1080 = 1080px
await d.evaluate(() => window.scrollTo({ top: 540, behavior: 'instant' }))
await d.waitForTimeout(900)
const mid = await d.evaluate(() => ({
  title: getComputedStyle(document.querySelector('.hero-title')).opacity,
  samY: document.querySelector('.hero-samurai').getBoundingClientRect().top,
}))
console.log('desktop-mid', JSON.stringify(mid))
await d.screenshot({ path: './qa/61-fix-hero-mid.png' })

await d.evaluate(() => window.scrollTo({ top: 1080, behavior: 'instant' }))
await d.waitForTimeout(900)
const end = await d.evaluate(() => ({
  title: getComputedStyle(document.querySelector('.hero-title')).opacity,
  samY: Math.round(document.querySelector('.hero-samurai').getBoundingClientRect().top),
}))
console.log('desktop-revealed', JSON.stringify(end))
await d.screenshot({ path: './qa/62-fix-hero-revealed.png' })

// reverse scroll: must restore
await d.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
await d.waitForTimeout(1100)
const back = await d.evaluate(() => ({
  title: getComputedStyle(document.querySelector('.hero-title')).opacity,
  samY: Math.round(document.querySelector('.hero-samurai').getBoundingClientRect().top),
}))
console.log('desktop-restored', JSON.stringify(back))
await d.close()

// ---------- Mobile 390x844 with real touch swipe ----------
const mo = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
await mo.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await mo.waitForTimeout(1400)
await measure(mo, 'mobile-initial')

// CDP touch drag (touch scrolling)
const cdp = await mo.context().newCDPSession(mo)
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 600, id: 1 }] })
for (let y = 600; y >= 150; y -= 45) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y, id: 1 }] })
  await mo.waitForTimeout(28)
}
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await mo.waitForTimeout(900)
const touch = await mo.evaluate(() => ({
  scrollY: Math.round(window.scrollY),
  samMoved: getComputedStyle(document.querySelector('.hero-samurai')).transform !== 'none'
    && document.querySelector('.hero-samurai').getBoundingClientRect().top > 60,
  overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}))
console.log('mobile-touch-swipe', JSON.stringify(touch))
await mo.screenshot({ path: './qa/63-fix-mobile-touch.png' })
await mo.close()

await browser.close()
console.log('DONE')
