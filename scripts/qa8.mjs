import { chromium } from 'playwright'

const browser = await chromium.launch()

for (const vp of [
  { width: 1920, height: 1080, label: '1920x1080' },
  { width: 1600, height: 900, label: '1600x900' },
]) {
  const page = await browser.newPage({ viewport: vp })
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1400)
  const m = await page.evaluate(() => {
    const img = document.querySelector('.hero-samurai img')
    const wrap = document.querySelector('.hero-samurai')
    const r = img.getBoundingClientRect()
    const w = wrap.getBoundingClientRect()
    const hero = document.querySelector('.hero').getBoundingClientRect()
    return {
      viewport: `${innerWidth}x${innerHeight}`,
      heroH: Math.round(hero.height),
      img: { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left) },
      renderedAspect: +(r.width / r.height).toFixed(4),
      naturalAspect: +(img.naturalWidth / img.naturalHeight).toFixed(4),
      wrapH: Math.round(w.height),
      imgHeightPctOfHero: +((r.height / hero.height) * 100).toFixed(1),
      scrollable: document.documentElement.scrollHeight - innerHeight,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }
  })
  console.log(JSON.stringify(m))
  await page.close()
}
await browser.close()
console.log('DONE')
