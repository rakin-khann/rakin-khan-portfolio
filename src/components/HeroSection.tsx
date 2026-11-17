import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { gsap } from '../lib/gsap'
import { PROFILE, SOCIALS } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { IconArrowRight, SiteIcon } from './icons'

/** Deterministic pseudo-random petals (falling red maple leaves). */
const PETALS: CSSProperties[] = Array.from({ length: 14 }, (_, i) => {
  const size = 9 + ((i * 7) % 9)
  return {
    left: `${(i * 71 + 13) % 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    opacity: 0.3 + ((i * 29) % 45) / 100,
    animationDuration: `${9 + ((i * 13) % 8)}s`,
    animationDelay: `${-((i * 17) % 16)}s`,
  }
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
        }}
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

      <div className="hero-petals" aria-hidden="true">
        {PETALS.map((style, i) => (
          <span key={i} style={style} />
        ))}
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
