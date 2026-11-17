import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { gsap } from '../lib/gsap'
import { PROFILE, SOCIALS } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { IconArrowRight, SiteIcon } from './icons'

/** Dense, drifting dark-crimson cherry blossom petals. */
const PETALS: CSSProperties[] = Array.from({ length: 42 }, (_, i) => {
  const size = 8 + ((i * 7) % 10)
  return {
    left: `${(i * 71 + 13) % 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    opacity: 0.42 + ((i * 29) % 42) / 100,
    animationDuration: `${8 + ((i * 13) % 9)}s`,
    animationDelay: `${-((i * 17) % 16)}s`,
  }
})

/** Individual crimson sakura petals drift inward from both edges. */
const SAKURA_PETALS: CSSProperties[] = Array.from({ length: 30 }, (_, i) => {
  const fromLeft = i % 2 === 0
  return {
    top: `${5 + ((i * 19) % 88)}%`,
    left: fromLeft ? `${-2 + (i % 5) * 1.2}%` : 'auto',
    right: fromLeft ? 'auto' : `${-2 + (i % 5) * 1.2}%`,
    width: `${10 + ((i * 11) % 13)}px`,
    height: `${15 + ((i * 7) % 13)}px`,
    opacity: 0.35 + ((i * 17) % 45) / 100,
    animationDuration: `${12 + ((i * 13) % 12)}s`,
    animationDelay: `-${(i * 7) % 22}s`,
    ['--sakura-start' as string]: fromLeft ? '-2vw' : '2vw',
    ['--sakura-mid' as string]: fromLeft ? '19vw' : '-19vw',
    ['--sakura-late' as string]: fromLeft ? '27vw' : '-27vw',
    ['--sakura-end' as string]: fromLeft ? '34vw' : '-34vw',
  } as CSSProperties
})

/**
 * Signature cinematic hero: the pinned samurai slides DOWN with scroll
 * (GSAP ScrollTrigger, scrubbed), revealing the giant RAKIN KHAN type
 * behind it. Scrolling up reverses the sequence smoothly.
 */
export default function HeroSection() {
  const profileRow = usePublicRows('profiles')[0]
  const socialRows = usePublicRows('social_links')
  const settingsRows = usePublicRows('site_settings')
  const heroScene = (settingsRows.find(row => row.key === 'hero_scene')?.value || {}) as Record<string, unknown>
  const characterSrc = String(heroScene.character_url || '/assets/samurai.webp')
  const heroBackgroundUrl = String(heroScene.background_url || '')
  const heroBackgroundColor = String(heroScene.background_color || '#050505')
  const heroRedGlow = Math.max(0, Math.min(0.6, Number(heroScene.red_glow ?? 0.13)))
  const profile = { ...PROFILE, name: String(profileRow?.name || PROFILE.name), title: String(profileRow?.headline || PROFILE.title), tagline: String(profileRow?.tagline || PROFILE.tagline), about: String(profileRow?.bio || PROFILE.about), email: String(profileRow?.email || PROFILE.email), location: String(profileRow?.location || PROFILE.location) }
  const nameParts = profile.name.trim().split(/\s+/)
  const firstName = nameParts.shift() || 'Rakin'
  const lastName = nameParts.join(' ') || 'Khan'
  const socials = socialRows.length ? socialRows.map(row => ({ label: String(row.platform || ''), icon: String(row.icon || 'link'), href: String(row.url || '#') })) : SOCIALS
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const samuraiRef = useRef<HTMLDivElement>(null)
  const flareRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const socialRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = () => window.innerWidth <= 768

    const ctx = gsap.context(() => {
      // Keep the horizontally-centered positioning under GSAP control.
      // Explicit x:0 — React StrictMode's double effect pass can leave a
      // residual pixel translate from the first mount; without the explicit
      // zero, GSAP parses it and double-counts the -50% centering offset.
      gsap.set(titleRef.current, { xPercent: -50, x: 0 })
      gsap.set(samuraiRef.current, { xPercent: -50, x: 0 })

      if (prefersReduced) {
        // Accessible static composition: name fully visible, samurai settled.
        gsap.set(titleRef.current, { opacity: 1 })
        gsap.set(samuraiRef.current, { yPercent: 30, scale: 0.95 })
        gsap.set(introRef.current, { opacity: 1 })
        return
      }

      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: () => (isMobile() ? '+=48%' : '+=62%'), // shorter pin distance for a faster reveal
            scrub: 0.25, // faster response while keeping smooth reverse scrubbing
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        // Chrome of the initial composition exits first.
        .fromTo(
          introRef.current,
          { opacity: 1, x: 0 },
          { opacity: 0, x: -70, duration: 0.22, ease: 'power2.in' },
          0,
        )
        .fromTo(socialRef.current, { opacity: 1 }, { opacity: 0, duration: 0.16 }, 0)
        .fromTo(scrollRef.current, { opacity: 1 }, { opacity: 0, duration: 0.12 }, 0)
        // The signature move: samurai descends out of the frame…
        .fromTo(
          samuraiRef.current,
          { yPercent: 0, scale: 1 },
          { yPercent: () => (isMobile() ? 48 : 62), scale: 0.94, duration: 1 },
          0,
        )
        // …revealing the monumental typography behind it.
        .fromTo(
          titleRef.current,
          { opacity: 0.3, yPercent: 5 },
          { opacity: 1, yPercent: 0, duration: 0.85 },
          0.05,
        )
        // Lighting + background parallax.
        .fromTo(flareRef.current, { opacity: 0.45 }, { opacity: 1, duration: 1 }, 0)
        .fromTo(
          bgRef.current,
          { yPercent: 0, scale: 1.05 },
          { yPercent: -6, scale: 1.12, duration: 1 },
          0,
        )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="home" className="hero" aria-label="Introduction">
      <div
        ref={bgRef}
        className="hero-bg"
        style={{
          backgroundColor: heroBackgroundColor,
          backgroundImage: heroBackgroundUrl ? `url("${heroBackgroundUrl}")` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          ['--hero-red-glow' as string]: heroRedGlow,
        } as CSSProperties}
      />

      <div className="hero-moon" aria-hidden="true" />

      <h1 ref={titleRef} className="hero-title">
        <span>{firstName.toUpperCase()}</span>
        <span>{lastName.toUpperCase()}</span>
      </h1>

      <div ref={flareRef} className="hero-flare" aria-hidden="true" />

      <div ref={samuraiRef} className="hero-samurai">
        <img
          src={characterSrc}
          alt="Crimson ronin samurai — signature artwork of Rakin Khan"
          draggable={false}
          decoding="async"
        />
      </div>

      <div className="hero-sakura-branches" aria-hidden="true">
        <svg className="sakura-branch sakura-branch-left" viewBox="0 0 360 820" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sakura-bark-left" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#050506"/><stop offset=".5" stopColor="#241013"/><stop offset="1" stopColor="#090809"/></linearGradient>
            <radialGradient id="sakura-bloom-left"><stop offset="0" stopColor="#a51b29"/><stop offset=".58" stopColor="#690b17"/><stop offset="1" stopColor="#26070d"/></radialGradient>
          </defs>
          <g className="sakura-wood">
            <path d="M-30 830 C38 720 34 634 91 548 C140 474 124 412 174 346 C222 281 216 212 274 145 C303 112 323 63 365 5"/>
            <path d="M72 582 C20 547 8 491 17 435 M113 502 C64 461 53 410 61 360 M166 357 C112 327 95 276 104 226 M217 286 C176 247 176 196 189 153 M262 166 C222 136 215 99 228 62 M196 335 C254 334 291 299 321 251 M147 401 C205 414 246 394 272 358 M286 129 C321 134 345 111 359 80"/>
          </g>
          {Array.from({length:15},(_,i)=><g key={i} className="sakura-flower-cluster" transform={`translate(${18+((i*61)%325)} ${72+((i*83)%680)}) scale(${.68+((i*7)%5)*.11}) rotate(${(i*37)%80-40})`}>
            {Array.from({length:5},(_,j)=><ellipse key={j} className="sakura-bloom-petal" cx="0" cy="-9" rx="5.4" ry="10.5" transform={`rotate(${j*72})`}/>)}
            <circle className="sakura-bloom-center" r="3"/>
          </g>)}
          {Array.from({length:12},(_,i)=><ellipse key={i} className="sakura-bud" cx={22+((i*43)%315)} cy={65+((i*71)%680)} rx="3.5" ry="6.5" transform={`rotate(${(i*29)%90} ${22+((i*43)%315)} ${65+((i*71)%680)})`}/>)}
        </svg>
        <svg className="sakura-branch sakura-branch-right" viewBox="0 0 360 820" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sakura-bark-right" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#050506"/><stop offset=".5" stopColor="#241013"/><stop offset="1" stopColor="#090809"/></linearGradient>
            <radialGradient id="sakura-bloom-right"><stop offset="0" stopColor="#a51b29"/><stop offset=".58" stopColor="#690b17"/><stop offset="1" stopColor="#26070d"/></radialGradient>
          </defs>
          <g className="sakura-wood">
            <path d="M-30 830 C38 720 34 634 91 548 C140 474 124 412 174 346 C222 281 216 212 274 145 C303 112 323 63 365 5"/>
            <path d="M72 582 C20 547 8 491 17 435 M113 502 C64 461 53 410 61 360 M166 357 C112 327 95 276 104 226 M217 286 C176 247 176 196 189 153 M262 166 C222 136 215 99 228 62 M196 335 C254 334 291 299 321 251 M147 401 C205 414 246 394 272 358 M286 129 C321 134 345 111 359 80"/>
          </g>
          {Array.from({length:15},(_,i)=><g key={i} className="sakura-flower-cluster" transform={`translate(${18+((i*61)%325)} ${72+((i*83)%680)}) scale(${.68+((i*7)%5)*.11}) rotate(${(i*37)%80-40})`}>
            {Array.from({length:5},(_,j)=><ellipse key={j} className="sakura-bloom-petal" cx="0" cy="-9" rx="5.4" ry="10.5" transform={`rotate(${j*72})`}/>)}
            <circle className="sakura-bloom-center" r="3"/>
          </g>)}
          {Array.from({length:12},(_,i)=><ellipse key={i} className="sakura-bud" cx={22+((i*43)%315)} cy={65+((i*71)%680)} rx="3.5" ry="6.5" transform={`rotate(${(i*29)%90} ${22+((i*43)%315)} ${65+((i*71)%680)})`}/>)}
        </svg>
      </div>
      <div className="hero-petals" aria-hidden="true">
        {PETALS.map((style, i) => (
          <span key={i} style={style} />
        ))}
      </div>
      <div className="hero-sakura-petals" aria-hidden="true">
        {SAKURA_PETALS.map((style, i) => <span key={i} style={style} />)}
      </div>

      <div ref={introRef} className="hero-intro">
        <p className="hero-role">{profile.title}</p>
        <p className="hero-name">
          {firstName} <span>{lastName}</span>
        </p>
        <p className="hero-tagline">{profile.tagline}</p>
        <a href="#portfolio" className="btn">
          Explore My Work <IconArrowRight />
        </a>
      </div>

      <div ref={socialRef} className="hero-social">
        {socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}>
            <SiteIcon name={s.icon} width={18} height={18} />
          </a>
        ))}
      </div>

      <div ref={scrollRef} className="hero-scroll" aria-hidden="true">
        <div className="hero-mouse">
          <span />
        </div>
        <p>Scroll</p>
      </div>

      <div className="frame-corners" aria-hidden="true">
        <i className="c-tl" />
        <i className="c-tr" />
        <i className="c-bl" />
        <i className="c-br" />
      </div>
    </section>
  )
}
