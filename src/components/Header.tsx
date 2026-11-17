import { useEffect, useState } from 'react'
import { NAV_LINKS, PROFILE, SOCIALS } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { IconArrowRight, IconClose, IconMenu, SiteIcon } from './icons'

export default function Header() {
  const profileRow = usePublicRows('profiles')[0]
  const socialRows = usePublicRows('social_links')
  const profileName = String(profileRow?.name || PROFILE.name)
  const socials = socialRows.length ? socialRows.map(row => ({ label: String(row.platform || ''), icon: String(row.icon || 'link'), href: String(row.url || '#') })) : SOCIALS
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('#home')
  // Section links must return to the homepage when clicked from a project detail route.
  const sectionHref = (href: string) => window.location.pathname === '/' ? href : `/${href}`

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    NAV_LINKS.forEach(({ href }) => {
      const el = document.getElementById(href.slice(1))
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className={`header${scrolled ? ' scrolled' : ''}${open ? ' menu-open' : ''}`}>
        <div className="container header-inner">
          <a
            href={sectionHref("#home")}
            className="header-logo"
            aria-label={`${profileName} — home`}
            onClick={() => setOpen(false)}
          >
            <img src="/assets/logo.webp" alt="Rakin Khan logo" width={188} height={63} />
          </a>

          <nav className="header-nav" aria-label="Primary">
            <ul className="nav-list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={sectionHref(link.href)}
                    className={`nav-link${active === link.href ? ' active' : ''}`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            <a href={sectionHref("#contact")} className="btn header-cta">
              Let&apos;s Talk <IconArrowRight />
            </a>
            <button
              type="button"
              className="menu-btn"
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu${open ? ' open' : ''}`} aria-hidden={!open}>
        <ul className="mobile-menu-list">
          {NAV_LINKS.map((link, i) => (
            <li key={link.href} style={{ transitionDelay: open ? `${80 + i * 55}ms` : '0ms' }}>
              <a
                href={sectionHref(link.href)}
                className={active === link.href ? 'active' : ''}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mobile-menu-social">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              tabIndex={open ? 0 : -1}
            >
              <SiteIcon name={s.icon} width={20} height={20} />
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
