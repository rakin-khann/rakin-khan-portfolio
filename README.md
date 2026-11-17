# RAKIN KHAN — Cinematic Samurai Portfolio

A dark, cinematic, Japanese-samurai-inspired personal portfolio for **Rakin Khan — Creative Director & Digital Artist**, recreated from the supplied landing-page design reference.

Built from scratch with **React 18 + TypeScript + Vite + GSAP (ScrollTrigger)**.

## Signature feature — scroll-reactive samurai

The hero is pinned and driven entirely by scroll position (GSAP ScrollTrigger, `scrub`):

- **Scroll down** → the crimson samurai descends smoothly out of the frame, revealing the monumental `RAKIN KHAN` typography behind it while the red atmosphere parallaxes.
- **Scroll up** → the animation reverses; the samurai rises back into its original foreground composition.
- Works with mouse wheel, trackpad, and touch scrolling. Under `prefers-reduced-motion`, a static accessible composition is shown instead.

## Run

```bash
npm install
npm run dev      # dev server on :5173
npm run build    # type-check (tsc -b) + production build
npm run lint     # eslint
npm run preview  # serve the production build
```

## Structure

```
src/
  components/
    Header.tsx            Fixed nav + mobile menu
    HeroSection.tsx       Pinned scrub samurai animation
    EdgeDivider.tsx       Angular red neon separators
    AboutSection.tsx      Bio, framed portrait, stats
    ServicesSection.tsx   8 service cards (4/2/1 grid)
    PortfolioSection.tsx  Featured work (placeholder cards)
    SkillsSection.tsx     Animated circular progress rings
    ContactSection.tsx    Email, location, socials
    Footer.tsx
    BackToTop.tsx
    icons.tsx             Inline SVG icon set
  hooks/useScrollAnimation.ts   data-reveal entrance hook
  data/content.ts         ALL site copy in one editable file
  lib/gsap.ts             GSAP + ScrollTrigger registration
  styles/                 global.css, animations.css, responsive.css
public/assets/            samurai.png (cutout), logo.png, portrait.png,
                          bg-hero.png, bg-torii.png, work-*.jpg
scripts/                  asset processing + Playwright QA scripts
qa/                       rendered QA screenshots (desktop + mobile)
```

## Content notes

- The professional CV referenced in the brief was not attached and was not found in the connected Google Drive. All factual content (title, stats, skills, email, location) is sourced strictly from the supplied landing-page screenshot.
- Portfolio images are **clearly labeled placeholders** — swap them in `src/data/content.ts`.
- Social URLs are platform-level placeholders — replace with real profile links in `src/data/content.ts`.

## License / assets

All artwork lives locally in `public/assets`. The samurai, portrait, and logo are the supplied brand assets; background and placeholder artwork were generated for this project.
