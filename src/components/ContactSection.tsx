import { PROFILE, SOCIALS } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { useReveal } from '../hooks/useScrollAnimation'
import { IconArrowRight, IconMail, IconMapPin, SiteIcon } from './icons'

export default function ContactSection() {
  const profileRow = usePublicRows('profiles')[0]
  const socialRows = usePublicRows('social_links')
  const profile = { ...PROFILE, email: String(profileRow?.email || PROFILE.email), location: String(profileRow?.location || PROFILE.location) }
  const socials = socialRows.length ? socialRows.map(row => ({ label: String(row.platform || ''), icon: String(row.icon || 'link'), href: String(row.url || '#') })) : SOCIALS
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} id="contact" className="section contact" aria-label="Contact">
      <div className="bg-art right flip" aria-hidden="true">
        <img src="/assets/bg-torii.webp" alt="" />
      </div>

      <div className="container contact-grid">
        <div className="contact-info" data-reveal>
          <p className="section-label">{'//'} Get In Touch</p>
          <h2 className="section-title contact-title">
            Let&apos;s Work <span className="text-red">Together</span>
          </h2>
          <p className="section-sub">
            Have a project in mind? Let&apos;s create something amazing!
          </p>
          <a href={`mailto:${profile.email}`} className="btn">
            Contact Me <IconArrowRight />
          </a>
        </div>

        <div className="contact-panel">
          <a className="contact-card" href={`mailto:${profile.email}`} data-reveal data-reveal-delay="0.1">
            <span className="contact-icon">
              <IconMail />
            </span>
            <span>
              <span className="contact-card-label">Email</span>
              <span className="contact-card-value">{PROFILE.email}</span>
            </span>
          </a>

          <a
            className="contact-card"
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.location)}`}
            target="_blank"
            rel="noreferrer"
            data-reveal
            data-reveal-delay="0.2"
            aria-label={`View location on Google Maps: ${profile.location}`}
          >
            <span className="contact-icon">
              <IconMapPin />
            </span>
            <span>
              <span className="contact-card-label">Location</span>
              <span className="contact-card-value">{profile.location}</span>
            </span>
          </a>

          <div className="contact-social" data-reveal data-reveal-delay="0.3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="social-link"
              >
                <SiteIcon name={s.icon} width={19} height={19} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="frame-corners" aria-hidden="true">
        <i className="c-tl" />
        <i className="c-br" />
      </div>
    </section>
  )
}
