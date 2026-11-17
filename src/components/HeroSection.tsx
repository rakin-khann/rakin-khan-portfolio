import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { gsap } from '../lib/gsap'
import { PROFILE, SOCIALS } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { IconArrowRight, SiteIcon } from './icons'

/** Deterministic pseudo-random petals (falling red maple leaves). */
const PETALS: CSSProperties[] = Array.from({ length: 42 }, (_, i) => {
  const size = 5 + ((i * 7) % 8)
  return {
    left: `${(i * 71 + 13) % 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    opacity: 0.3 + ((i * 29) % 45) / 100,
    animationDuration: `${8 + ((i * 13) % 9)}s`,
    animationDelay: `${-((i * 17) % 16)}s`,
  }
})

/** Sakura petals drift inward from both edges of the cinematic hero. */
const SAKURA_PETALS: CSSProperties[] = Array.from({ length: 30 }, (_, i) => {
  const fromLeft = i % 2 === 0
  return {
    top: `${5 + ((i * 19) % 88)}%`,
    left: fromLeft ? `${-2 + (i % 5) * 1.2}%` : 'auto',
    right: fromLeft ? 'auto' : `${-2 + (i % 5) * 1.2}%`,
    width: `${8 + ((i * 11) % 10)}px`,
    height: `${12 + ((i * 7) % 10)}px`,
    opacity: 0.35 + ((i * 17) % 45) / 100,
    animationDuration: `${12 + ((i * 13) % 12)}s`,
    animationDelay: `-${(i * 7) % 22}s`,
    ['--sakura-direction' as string]: fromLeft ? '1' : '-1',
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
        <svg className="sakura-branch sakura-branch-left" viewBox="0 0 320 820" preserveAspectRatio="none">
          <path d="M-24 820 C72 660 42 540 126 410 S214 188 314 18" />
          <path d="M52 680 C-4 596 10 530 34 468 M126 410 C66 368 48 304 58 256 M212 214 C160 190 144 134 154 92 M168 336 C232 328 264 284 280 238" />
          {Array.from({length: 22},(_,i)=><circle key={i} cx={28+((i*47)%270)} cy={55+((i*83)%700)} r={3+(i%4)} className="sakura-blossom" />)}
          {Array.from({length: 9},(_,i)=><g key={i} className="sakura-flower" transform={`translate(${34+(i*31)%250} ${110+(i*73)%620})`}>{Array.from({length:5},(_,j)=><ellipse key={j} cx="0" cy="-7" rx="4.5" ry="8" transform={`rotate(${j*72})`} />)}<circle r="3" /></g>)}
        </svg>
        <svg className="sakura-branch sakura-branch-right" viewBox="0 0 320 820" preserveAspectRatio="none">
          <path d="-24 820 C72 660 42 540 126 410 S214 188 314 18" />
          <path d="M52 680 C-4 596 10 530 34 468 M126 410 C66 368 48 304 58 256 M212 214 C160 190 144 134 154 92 M168 336 C232 328 264 284 280 238" />
          {Array.from({length: 22},(_,i)=><circle key={i} cx={28+((i*47)%270)} cy={55+((i*83)%700)} r={3+(i%4)} className="sakura-blossom" />)}
          {Array.from({length: 9},(_,i)=><g key={i} className="sakura-flower" transform={`translate(${34+(i*31)%250} ${110+(i*73)%620})`}>{Array.from({length:5},(_,j)=><ellipse key={j} cx="0" cy="-7" rx="4.5" ry="8" transform={`rotate(${j*72})`} />)}<circle r="3" /></g>)}
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
