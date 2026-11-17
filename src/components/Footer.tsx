import { NAV_LINKS, PROFILE, SOCIALS } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { SiteIcon } from './icons'

export default function Footer() {
  const year = new Date().getFullYear()
  const profile = usePublicRows('profiles')[0]
  const socialRows = usePublicRows('social_links')
  const name = String(profile?.name || PROFILE.name)
  const title = String(profile?.headline || PROFILE.title)
  const socials = socialRows.length ? socialRows.map(row => ({ label: String(row.platform || ''), icon: String(row.icon || 'link'), href: String(row.url || '#') })) : SOCIALS

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <a href="#home" className="footer-logo" aria-label={`${name} — back to top`}>
          <img src="/assets/logo.webp" alt="Rakin Khan logo" width={150} height={50} />
        </a>

        <nav aria-label="Footer">
          <ul className="footer-nav">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-social">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className="social-link"
            >
              <SiteIcon name={s.icon} width={17} height={17} />
            </a>
          ))}
        </div>
      </div>

      <div className="container footer-bottom">
        <p>
          © {year} {name}. All rights reserved.
        </p>
        <p className="footer-role">{title}</p>
      </div>
    </footer>
  )
}
