// QA-11: acceptance probe for samurai sizing + central overlap requirements.
// Verifies per viewport: width constraints, wrapper dims, scaling fidelity vs
// natural PNG ratio, positioning (centering), transform uniformity, z-order,
// and geometric overlap between the samurai and the RAKIN KHAN typography.
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:5173'
const NATURAL = 1349 / 1024 // 1.3173828125 — measured from the uploaded artwork
fs.mkdirSync('qa', { recursive: true })
const browser = await chromium.launch()
const results = []
const check = (name, cond, detail) => results.push({ name, pass: !!cond, detail })

async function probe(page, label) {
  return page.evaluate((NAT) => {
    const img = document.querySelector('.hero-samurai img')
    const wrap = document.querySelector('.hero-samurai')
    const title = document.querySelector('.hero-title')
    const ib = img.getBoundingClientRect()
    const wb = wrap.getBoundingClientRect()
    const tb = title.getBoundingClientRect()
    const ic = getComputedStyle(img)
    const wc = getComputedStyle(wrap)
    // transform uniformity of the wrapper (scaleX must equal scaleY)
    let a = 1, d = 1
    const m = wc.transform.match(/matrix\(([^)]+)\)/)
    if (m) { const p = m[1].split(',').map(Number); a = p[0]; d = p[3] }
    // geometric overlap title vs samurai
    const ox = Math.max(0, Math.min(ib.right, tb.right) - Math.max(ib.left, tb.left))
    const oy = Math.max(0, Math.min(ib.bottom, tb.bottom) - Math.max(ib.top, tb.top))
    // z-order: pointer-events:none wrappers are skipped by elementFromPoint,
    // so compare stacking contexts directly instead.
    const ziW = Number(getComputedStyle(wrap).zIndex)
    const ziT = Number(getComputedStyle(title).zIndex)
    const onTop = ziW > ziT ? 'samurai' : `title(z${ziT} vs ${ziW})`
    return {
      natural: { w: img.naturalWidth, h: img.naturalHeight },
      img: { w: Math.round(ib.width), h: Math.round(ib.height), aspect: ib.width / ib.height },
      imgCss: { maxWidth: ic.maxWidth, objectFit: ic.objectFit, width: ic.width, height: ic.height, transform: ic.transform },
      wrap: { w: Math.round(wb.width), h: Math.round(wb.height), maxHeight: wc.maxHeight, maxWidth: wc.maxWidth, aspectRatio: wc.aspectRatio, scaleX: a, scaleY: d },
      centerDelta: Math.round((ib.left + ib.right) / 2 - innerWidth / 2),
      bottomGap: Math.round(innerHeight - ib.bottom),
      title: { left: Math.round(tb.left), right: Math.round(tb.right), w: Math.round(tb.width), opacity: getComputedStyle(title).opacity },
      overlap: { w: Math.round(ox), h: Math.round(oy), pctOfTitle: Math.round((ox / tb.width) * 100) },
      samuraiOnTop: onTop,
      vw: innerWidth, vh: innerHeight,
      scrollW: document.documentElement.scrollWidth,
    }
  })
}

const viewports = [
  { width: 1920, height: 1080, label: '1920x1080' },
  { width: 1600, height: 900, label: '1600x900' },
  { width: 1440, height: 900, label: '1440x900' },
  { width: 1366, height: 768, label: '1366x768' },
  { width: 1280, height: 800, label: '1280x800' },
  { width: 1024, height: 700, label: '1024x700' },
]

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1300)
  const r = await probe(page, vp.label)
  check(`${vp.label}: natural file ratio`, r.natural.w === 1349 && r.natural.h === 1024, `${r.natural.w}x${r.natural.h}`)
  check(`${vp.label}: rendered aspect == natural`, Math.abs(r.img.aspect - NATURAL) < 0.01, `${r.img.aspect.toFixed(4)} vs ${NATURAL.toFixed(4)} (${r.img.w}x${r.img.h})`)
  check(`${vp.label}: no width clamp`, r.imgCss.maxWidth === 'none', `max-width=${r.imgCss.maxWidth}`)
  check(`${vp.label}: no wrapper caps`, r.wrap.maxHeight === 'none' && r.wrap.maxWidth === 'none', `maxH=${r.wrap.maxHeight} maxW=${r.wrap.maxWidth}`)
  check(`${vp.label}: wrapper aspect-ratio set`, r.wrap.aspectRatio.replace(/\s/g, '') === '1349/1024', r.wrap.aspectRatio)
  check(`${vp.label}: object-fit contain`, r.imgCss.objectFit === 'contain', r.imgCss.objectFit)
  check(`${vp.label}: img transform none`, r.imgCss.transform === 'none', r.imgCss.transform)
  check(`${vp.label}: uniform wrapper scale`, Math.abs(r.wrap.scaleX - r.wrap.scaleY) < 0.001, `scaleX=${r.wrap.scaleX.toFixed(3)} scaleY=${r.wrap.scaleY.toFixed(3)}`)
  check(`${vp.label}: horizontally centered`, Math.abs(r.centerDelta) <= 2, `delta=${r.centerDelta}px`)
  check(`${vp.label}: anchored to hero bottom`, Math.abs(r.bottomGap) <= 2, `gap=${r.bottomGap}px`)
  check(`${vp.label}: overlaps typography`, r.overlap.w > 200 && r.overlap.h > 60, `overlap=${r.overlap.w}x${r.overlap.h} (${r.overlap.pctOfTitle}% of title width)`)
  check(`${vp.label}: samurai layered above title`, r.samuraiOnTop === 'samurai', r.samuraiOnTop)
  check(`${vp.label}: no overflow-x`, r.scrollW <= r.vw, `scrollW=${r.scrollW} vw=${r.vw}`)
  if (vp.label === '1920x1080') await page.screenshot({ path: 'qa/70-samurai-final-1920.png' })
  if (vp.label === '1440x900') await page.screenshot({ path: 'qa/71-samurai-final-1440.png' })
  await page.close()
}

// Mobile + reduced-motion sanity
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
await mob.goto(BASE, { waitUntil: 'networkidle' })
await mob.waitForTimeout(1300)
let r = await probe(mob, '390x844')
check('mobile: rendered aspect == natural', Math.abs(r.img.aspect - NATURAL) < 0.01, `${r.img.aspect.toFixed(4)} (${r.img.w}x${r.img.h})`)
check('mobile: horizontally centered', Math.abs(r.centerDelta) <= 2, `delta=${r.centerDelta}px`)
check('mobile: no overflow-x', r.scrollW <= r.vw, `scrollW=${r.scrollW}`)
await mob.close()

const rm = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' })
await rm.goto(BASE, { waitUntil: 'networkidle' })
await rm.waitForTimeout(1300)
r = await probe(rm, 'reduced-motion')
check('reduced-motion: aspect == natural', Math.abs(r.img.aspect - NATURAL) < 0.01, `${r.img.aspect.toFixed(4)}`)
check('reduced-motion: uniform scale', Math.abs(r.wrap.scaleX - r.wrap.scaleY) < 0.001, `scaleX=${r.wrap.scaleX.toFixed(3)} scaleY=${r.wrap.scaleY.toFixed(3)}`)
check('reduced-motion: centered', Math.abs(r.centerDelta) <= 2, `delta=${r.centerDelta}px`)
await rm.close()

await browser.close()
const fails = results.filter((x) => !x.pass)
for (const x of results) console.log(`${x.pass ? 'PASS' : 'FAIL'}  ${x.name}  (${x.detail})`)
console.log(fails.length ? `\n${fails.length} FAILURES` : `\nALL ${results.length} CHECKS PASS`)
process.exit(fails.length ? 1 : 0)
