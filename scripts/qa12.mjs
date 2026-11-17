// QA-12: samurai size reduction (~15%) + horizontal centering across ALL scroll states.
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:5173'
const NATURAL = 1349 / 1024
fs.mkdirSync('qa', { recursive: true })
const browser = await chromium.launch()
const results = []
const check = (name, cond, detail) => results.push({ name, pass: !!cond, detail })

async function measure(page) {
  return page.evaluate(() => {
    const ib = document.querySelector('.hero-samurai img').getBoundingClientRect()
    const tb = document.querySelector('.hero-title').getBoundingClientRect()
    return {
      w: Math.round(ib.width), h: Math.round(ib.height),
      aspect: ib.width / ib.height,
      centerDelta: Math.round((ib.left + ib.right) / 2 - innerWidth / 2),
      bottomGap: Math.round(innerHeight - ib.bottom),
      titleOverlapW: Math.round(Math.max(0, Math.min(ib.right, tb.right) - Math.max(ib.left, tb.left))),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      scrollY: Math.round(scrollY),
    }
  })
}

async function run(page, label, pinDist, shot) {
  const states = [
    ['initial', 0],
    ['mid', Math.round(pinDist / 2)],
    ['revealed', pinDist],
    ['reverse', 0],
  ]
  for (const [state, y] of states) {
    await page.evaluate((yy) => scrollTo(0, yy), y)
    await page.waitForTimeout(950)
    const m = await measure(page)
    const tag = `${label} ${state}`
    check(`${tag}: centered`, Math.abs(m.centerDelta) <= 2, `delta=${m.centerDelta}px`)
    check(`${tag}: aspect natural`, Math.abs(m.aspect - NATURAL) < 0.01, `${m.aspect.toFixed(4)} (${m.w}x${m.h})`)
    check(`${tag}: no overflow-x`, m.overflowX <= 0, `overflowX=${m.overflowX}`)
    if (shot && shot[state]) await page.screenshot({ path: `qa/${shot[state]}` })
  }
}

// Desktop: pin distance = 100% of viewport height
const d = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
await d.goto(BASE, { waitUntil: 'networkidle' })
await d.waitForTimeout(1400)
await run(d, 'desktop', 1080, {
  initial: '80-size-initial.png',
  mid: '81-size-mid.png',
  revealed: '82-size-revealed.png',
  reverse: '83-size-reverse.png',
})
let m = await measure(d)
check('desktop: size ~15% smaller', Math.abs(m.h - 886) <= 6, `h=${m.h}px (was 1048, target ~886)`)
check('desktop: still overlaps title', m.titleOverlapW > 500, `overlapW=${m.titleOverlapW}px`)
await d.close()

// Tablet (iPad portrait) — desktop scroll config (width > 768)
const t = await browser.newPage({ viewport: { width: 834, height: 1112 } })
await t.goto(BASE, { waitUntil: 'networkidle' })
await t.waitForTimeout(1400)
await run(t, 'tablet', 1112, { initial: '84-size-tablet.png' })
await t.close()

// Mobile — pin distance = 75% of viewport height
const mo = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
await mo.goto(BASE, { waitUntil: 'networkidle' })
await mo.waitForTimeout(1400)
await run(mo, 'mobile', 633, { initial: '85-size-mobile.png' })
await mo.close()

await browser.close()
const fails = results.filter((x) => !x.pass)
for (const x of results) console.log(`${x.pass ? 'PASS' : 'FAIL'}  ${x.name}  (${x.detail})`)
console.log(fails.length ? `\n${fails.length} FAILURES` : `\nALL ${results.length} CHECKS PASS`)
process.exit(fails.length ? 1 : 0)
