import { chromium } from 'playwright'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })

// Track network weight
let bytes = 0
let requests = 0
page.on('response', async (res) => {
  requests++
  try {
    const body = await res.body()
    bytes += body.length
  } catch {
    /* streamed */
  }
})

await page.goto('http://localhost:5173', { waitUntil: 'load' })
await page.waitForTimeout(2500)

const timing = await page.evaluate(() => {
  const nav = performance.getEntriesByType('navigation')[0]
  const lcp = performance.getEntriesByType('largest-contentful-paint')
  return {
    domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
    load: Math.round(nav.loadEventEnd),
    lcp: lcp.length ? Math.round(lcp[lcp.length - 1].startTime) : null,
  }
})
console.log('requests:', requests, '| transferred:', (bytes / 1024 / 1024).toFixed(2), 'MB')
console.log('timing(ms):', JSON.stringify(timing))

// Frame pacing while scrolling through the pinned samurai sequence
const pacing = await page.evaluate(
  () =>
    new Promise((resolve) => {
      const deltas = []
      let last = performance.now()
      let frames = 0
      function tick(t) {
        deltas.push(t - last)
        last = t
        frames++
        if (frames < 120) requestAnimationFrame(tick)
        else finish()
      }
      function finish() {
        deltas.sort((a, b) => a - b)
        const avg = deltas.reduce((s, d) => s + d, 0) / deltas.length
        resolve({
          avgFrameMs: +avg.toFixed(2),
          p95: +deltas[Math.floor(deltas.length * 0.95)].toFixed(2),
        })
      }
      // drive synthetic scroll through the pin while sampling
      let y = 0
      const iv = setInterval(() => {
        y += 14
        window.scrollTo(0, y)
        if (y > 1600) clearInterval(iv)
      }, 16)
      requestAnimationFrame(tick)
    }),
)
console.log('scroll frame pacing:', JSON.stringify(pacing))

await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(1200)
await page.screenshot({ path: './qa/50-perf-hero-webp.png' })

await browser.close()
console.log('DONE')
