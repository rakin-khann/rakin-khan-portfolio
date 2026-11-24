import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { gsap } from '../lib/gsap'
import { PROFILE } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { IconArrowRight, SiteIcon } from './icons'

const SPARKS: CSSProperties[] = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 47 + 9) % 100}%`,
  top: `${(i * 67 + 13) % 100}%`,
  width: `${2 + (i % 3)}px`,
  height: `${2 + (i % 3)}px`,
  animationDelay: `${-((i * 11) % 9)}s`,
  animationDuration: `${5 + (i % 6)}s`,
}))

export default function HeroSection() {
  const profileRow = usePublicRows('profiles')[0]
  const socialRows = usePublicRows('social_links')
  const settingsRows = usePublicRows('site_settings')
  const legacyScene = (settingsRows.find(row => row.key === 'hero_scene')?.value || {}) as Record<string, unknown>
  const configuredScenes = settingsRows.find(row => row.key === 'hero_scenes')?.value
  const scenes = (Array.isArray(configuredScenes) ? configuredScenes : [legacyScene])
    .filter((scene: Record<string, unknown>) => scene.is_published !== false && Boolean(scene.character_url) && (scene.background_mode !== 'image' || Boolean(scene.background_url)))
    .slice(0, 10) as Record<string, unknown>[]
  const [sceneIndex, setSceneIndex] = useState(0)
  useEffect(() => {
    if (!scenes.length) return
    try {
      const key = 'rakin_hero_theme_rotation'
      const nextIndex = Math.abs(Number(window.localStorage.getItem(key) || 0)) % scenes.length
      setSceneIndex(nextIndex)
      window.localStorage.setItem(key, String((nextIndex + 1) % scenes.length))
    } catch { setSceneIndex(0) }
  }, [settingsRows.length])
  const heroScene = scenes[sceneIndex] || scenes[0] || (Array.isArray(configuredScenes) ? {} : legacyScene)
  const characterSrc = String(heroScene.character_url || '/assets/samurai.webp')
  const heroBackgroundUrl = String(heroScene.background_url || '')
  const heroBackgroundColor = String(heroScene.background_color || '#050505')
  const heroAccent = String(heroScene.accent_color || '#20d9f3')
  const heroSecondary = String(heroScene.secondary_color || '#9b4dff')
  const hexToRgb = (hex: string) => {
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return match ? `${parseInt(match[1], 16)}, ${parseInt(match[2], 16)}, ${parseInt(match[3], 16)}` : '32, 217, 243'
  }
  const profile = { ...PROFILE, name: String(profileRow?.name || PROFILE.name), title: String(profileRow?.headline || PROFILE.title), tagline: String(profileRow?.tagline || PROFILE.tagline), about: String(profileRow?.bio || PROFILE.about), email: String(profileRow?.email || PROFILE.email), location: String(profileRow?.location || PROFILE.location) }
  const socials = socialRows.map(row => ({ label: String(row.platform || ''), icon: String(row.icon || ''), href: String(row.url || '') })).filter(item => item.label && item.icon && /^https?:\/\//i.test(item.href))
  const heroRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo(imageRef.current, { autoAlpha: 0, x: -36, scale: .96 }, { autoAlpha: 1, x: 0, scale: 1, duration: 1.05, ease: 'power3.out' })
      gsap.fromTo(copyRef.current, { autoAlpha: 0, x: 36 }, { autoAlpha: 1, x: 0, duration: 1.05, delay: .12, ease: 'power3.out' })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} id="home" className="hero hero-split" aria-label="Introduction" style={{ '--red': heroAccent, '--red-rgb': hexToRgb(heroAccent), '--hero-secondary': heroSecondary, '--bg': heroBackgroundColor } as CSSProperties}>
      <div className="hero-bg hero-split-bg" style={{ backgroundColor: heroBackgroundColor, backgroundImage: heroBackgroundUrl ? `url("${heroBackgroundUrl}")` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div className="hero-split-glow" aria-hidden="true" />
      <div className="hero-split-inner">
        <div ref={imageRef} className="hero-portrait-wrap">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-portrait-halo" />
          <div className="hero-samurai hero-portrait">
            <img src={characterSrc} alt={`${profile.name} — portfolio character artwork`} draggable={false} decoding="async" />
          </div>
          <div className="hero-spark-field" aria-hidden="true">
            {SPARKS.map((style, i) => <span key={i} style={style} />)}
          </div>
          <span className="hero-image-tag">CREATIVE MIND / 001</span>
          <span className="hero-image-line" />
        </div>

        <div ref={copyRef} className="hero-copy-panel">
          <p className="hero-verified"><span className="hero-verified-mark">›_</span> IDENTITY VERIFIED</p>
          <p className="hero-kicker">{profile.title}</p>
          <h1 className="hero-main-heading">CRAFTING DIGITAL<br /><span>EXPERIENCES</span></h1>
          <p className="hero-description">{profile.tagline || profile.about}</p>
          <p className="hero-description hero-description-secondary">{profile.about}</p>
          <div className="hero-feature-grid">
            <article className="hero-feature-card">
              <span className="hero-feature-icon">✳</span>
              <div><h2>VISUAL DESIGN</h2><p>Branding · Graphics · UI/UX</p></div>
            </article>
            <article className="hero-feature-card hero-feature-purple">
              <span className="hero-feature-icon">◎</span>
              <div><h2>DIGITAL EXPERIENCE</h2><p>Web · Motion · Digital Media</p></div>
            </article>
          </div>
          <div className="hero-cta-row">
            <a href="#portfolio" className="hero-primary-link">EXPLORE MY WORK <IconArrowRight /></a>
            <a href="#contact" className="hero-secondary-link">LET’S CONNECT ↗</a>
          </div>
          <div className="hero-social hero-split-social">
            {socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}><SiteIcon name={s.icon} width={17} height={17} /></a>)}
          </div>
        </div>
      </div>
      <div className="hero-split-footer"><span>{profile.location}</span><span>AVAILABLE FOR SELECT PROJECTS</span><a href="#portfolio">SCROLL TO EXPLORE ↓</a></div>
      <div className="frame-corners" aria-hidden="true"><i className="c-tl" /><i className="c-tr" /><i className="c-bl" /><i className="c-br" /></div>
    </section>
  )
}
