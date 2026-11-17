// QA-10: verify hero title centering fix + samurai proportions + scroll/touch + resize.
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:5173'
const out = 'qa'
fs.mkdirSync(out, { recursive: true })
const browser = await chromium.launch()
const results = []

function check(name, cond, detail) {
  results.push({ name, pass: !!cond, detail })
}

async function measure(page) {
  return page.evaluate(() => {
    const r = (s) => {
      const el = document.querySelector(s)
      if (!el) return null
      const b = el.getBoundingClientRect()
      return { left: Math.round(b.left), right: Math.round(b.right), w: Math.round(b.width), h: Math.round(b.height), top: Math.round(b.top) }
    }
    const t = r('.hero-title')
    const s = r('.hero-samurai img')
    const cs = getComputedStyle(document.querySelector('.hero-title'))
    return {
      vw: innerWidth,
      title: t,
      titleCenterDelta: t ? Math.round((t.left + t.right) / 2 - innerWidth / 2) : null,
      titleOpacity: Number(cs.opacity).toFixed(2),
      samurai: s,
      samuraiAspect: s ? (s.w / s.h).toFixed(4) : null,
      samuraiCenterDelta: s ? Math.round((s.left + s.right) / 2 - innerWidth / 2) : null,
      overflowX: document.documentElement.scrollWidth - innerWidth,
      scrollY: Math.round(scrollY),
    }
  })
}

// ---------- Desktop 1920x1080 ----------
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(1400)

let m = await measure(page)
check('desktop initial: title centered', Math.abs(m.titleCenterDelta) <= 2, `delta=${m.titleCenterDelta}px`)
check('desktop initial: samurai aspect 1.3174', Math.abs(m.samuraiAspect - 1.3174) < 0.01, `aspect=${m.samuraiAspect}`)
check('desktop initial: samurai centered', Math.abs(m.samuraiCenterDelta) <= 2, `delta=${m.samuraiCenterDelta}px`)
check('desktop initial: no overflow-x', m.overflowX <= 0, `overflowX=${m.overflowX}`)
await page.screenshot({ path: `${out}/60-fix-hero-initial.png` })

// mid-scroll
await page.evaluate(() => scrollTo(0, 540))
await page.waitForTimeout(900)
m = await measure(page)
check('desktop mid: title centered', Math.abs(m.titleCenterDelta) <= 2, `delta=${m.titleCenterDelta}px`)
check('desktop mid: title revealing', Number(m.titleOpacity) > 0.5, `opacity=${m.titleOpacity}`)
await page.screenshot({ path: `${out}/61-fix-hero-mid.png` })

// fully revealed
await page.evaluate(() => scrollTo(0, 1080))
await page.waitForTimeout(900)
m = await measure(page)
check('desktop revealed: title centered', Math.abs(m.titleCenterDelta) <= 2, `delta=${m.titleCenterDelta}px`)
check('desktop revealed: title full opacity', Number(m.titleOpacity) === 1, `opacity=${m.titleOpacity}`)
await page.screenshot({ path: `${out}/62-fix-hero-revealed.png` })

// reverse to top
await page.evaluate(() => scrollTo(0, 0))
await page.waitForTimeout(1000)
m = await measure(page)
check('desktop restored: title centered', Math.abs(m.titleCenterDelta) <= 2, `delta=${m.titleCenterDelta}px`)
check('desktop restored: title dimmed 0.3', Math.abs(Number(m.titleOpacity) - 0.3) < 0.05, `opacity=${m.titleOpacity}`)

// resize mid-session: 1600x900 then 1366x768 — centering must track width change
for (const vp of [{ width: 1600, height: 900 }, { width: 1366, height: 768 }]) {
  await page.setViewportSize(vp)
  await page.waitForTimeout(900)
  m = await measure(page)
  check(`resize ${vp.width}: title centered`, Math.abs(m.titleCenterDelta) <= 2, `delta=${m.titleCenterDelta}px`)
  check(`resize ${vp.width}: samurai aspect`, Math.abs(m.samuraiAspect - 1.3174) < 0.01, `aspect=${m.samuraiAspect}`)
  check(`resize ${vp.width}: no overflow-x`, m.overflowX <= 0, `overflowX=${m.overflowX}`)
}
await page.close()

// ---------- Mobile 390x844 with CDP touch swipe ----------
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
await mob.goto(BASE, { waitUntil: 'networkidle' })
await mob.waitForTimeout(1400)
m = await measure(mob)
check('mobile initial: title centered', Math.abs(m.titleCenterDelta) <= 2, `delta=${m.titleCenterDelta}px`)
check('mobile initial: samurai aspect', Math.abs(m.samuraiAspect - 1.3174) < 0.01, `aspect=${m.samuraiAspect}`)
check('mobile initial: no overflow-x', m.overflowX <= 0, `overflowX=${m.overflowX}`)

const cdp = await mob.context().newCDPSession(mob)
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 600, id: 1 }] })
for (let y = 600; y >= 200; y -= 40) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y, id: 1 }] })
  await mob.waitForTimeout(24)
}
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await mob.waitForTimeout(900)
m = await measure(mob)
check('mobile touch: page scrolled', m.scrollY > 100, `scrollY=${m.scrollY}`)
check('mobile touch: no overflow-x', m.overflowX <= 0, `overflowX=${m.overflowX}`)
await mob.screenshot({ path: `${out}/63-fix-mobile-touch.png` })
await mob.close()

await browser.close()
const fails = results.filter((r) => !r.pass)
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}  (${r.detail})`)
console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL PASS')
process.exit(fails.length ? 1 : 0)
