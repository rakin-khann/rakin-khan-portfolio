import { chromium } from 'playwright'

const browser = await chromium.launch()

async function audit(page, label) {
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)

  // ---- SKILLS ----
  await page.evaluate(() => document.querySelector('#skills')?.scrollIntoView({ behavior: 'instant' }))
  await page.waitForTimeout(2200)
  const skills = await page.evaluate(() => {
    const rings = Array.from(document.querySelectorAll('.skill-ring'))
    return {
      heading: document.querySelector('#skills .section-title')?.textContent?.trim(),
      rings: rings.map((r) => {
        const val = r.querySelector('.ring-value')
        const cs = getComputedStyle(val)
        return {
          skill: r.querySelector('.skill-name')?.textContent?.trim(),
          label: val?.textContent?.trim(),
          labelColor: cs.color,
          labelWeight: cs.fontWeight,
          aria: r.querySelector('svg')?.getAttribute('aria-label'),
        }
      }),
    }
  })
  console.log(`[${label}] SKILLS:`, JSON.stringify(skills, null, 1))
  await page.screenshot({ path: `./qa/40-${label}-skills.png` })

  // ---- CONTACT ----
  await page.evaluate(() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'instant' }))
  await page.waitForTimeout(1400)
  const contact = await page.evaluate(() => {
    const sec = document.querySelector('#contact')
    return {
      headline: sec?.querySelector('.section-title')?.textContent?.trim(),
      invitation: sec?.querySelector('.section-sub')?.textContent?.trim(),
      links: Array.from(sec?.querySelectorAll('a') ?? []).map((a) => a.getAttribute('href')),
      socialCount: sec?.querySelectorAll('.social-link').length,
      socialsWork: Array.from(sec?.querySelectorAll('.social-link') ?? []).every((a) =>
        /^https:\/\//.test(a.getAttribute('href') ?? ''),
      ),
    }
  })
  console.log(`[${label}] CONTACT:`, JSON.stringify(contact, null, 1))
  await page.screenshot({ path: `./qa/41-${label}-contact.png` })
}

await audit(await browser.newPage({ viewport: { width: 1600, height: 900 } }), 'desktop')
await audit(
  await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }),
  'mobile',
)

await browser.close()
console.log('DONE')
