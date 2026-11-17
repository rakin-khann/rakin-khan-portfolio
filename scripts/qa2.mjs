import { chromium } from 'playwright'

const BASE = 'http://localhost:5173'
const OUT = './qa'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

const metrics = await page.evaluate(() => ({
  scrollable: document.documentElement.scrollHeight - window.innerHeight,
  vh: window.innerHeight,
}))
console.log('metrics:', JSON.stringify(metrics))

async function samuraiState(label) {
  const s = await page.evaluate(() => {
    const sam = document.querySelector('.hero-samurai')
    const title = document.querySelector('.hero-title')
    const sc = getComputedStyle(sam)
    const tc = getComputedStyle(title)
    const rect = sam.getBoundingClientRect()
    return {
      scrollY: Math.round(window.scrollY),
      samuraiTransform: sc.transform,
      samuraiTop: Math.round(rect.top),
      titleOpacity: tc.opacity,
    }
  })
  console.log(label, JSON.stringify(s))
}

// Reveal state: end of the pinned scrub range (170% of 900px viewport)
await page.evaluate(() => window.scrollTo({ top: 1530, behavior: 'instant' }))
await page.waitForTimeout(1400)
await samuraiState('REVEALED')
await page.screenshot({ path: `${OUT}/20-desktop-revealed-check.png` })

// Mid state
await page.evaluate(() => window.scrollTo({ top: 760, behavior: 'instant' }))
await page.waitForTimeout(1400)
await samuraiState('MID')
await page.screenshot({ path: `${OUT}/21-desktop-mid-check.png` })

// Restored
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
await page.waitForTimeout(1400)
await samuraiState('RESTORED')

// Skills rings: animate, then read state twice
await page.evaluate(() => document.querySelector('#skills')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(2200)
const ringsAtSkills = await page.evaluate(() =>
  Array.from(document.querySelectorAll('.skill-ring')).map((r) => ({
    name: r.querySelector('.skill-name')?.textContent,
    value: r.querySelector('.ring-value')?.textContent,
    dash: getComputedStyle(r.querySelector('.ring-fg')).strokeDashoffset,
  })),
)
console.log('rings at skills:', JSON.stringify(ringsAtSkills))

await page.evaluate(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(1200)
const ringsAtContact = await page.evaluate(() =>
  Array.from(document.querySelectorAll('.skill-ring')).map((r) => ({
    name: r.querySelector('.skill-name')?.textContent,
    value: r.querySelector('.ring-value')?.textContent,
    dash: getComputedStyle(r.querySelector('.ring-fg')).strokeDashoffset,
  })),
)
console.log('rings at contact:', JSON.stringify(ringsAtContact))
await page.screenshot({ path: `${OUT}/22-desktop-contact-check.png` })

await browser.close()
console.log('DONE')
