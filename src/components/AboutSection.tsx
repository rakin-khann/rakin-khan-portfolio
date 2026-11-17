import { PROFILE, STATS } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { useReveal } from '../hooks/useScrollAnimation'
import { IconArrowRight, SiteIcon } from './icons'
import SectionBackground from './SectionBackground'

export default function AboutSection() {
  const profileRow = usePublicRows('profiles')[0]
  const profile = { ...PROFILE, name: String(profileRow?.name || PROFILE.name), about: String(profileRow?.bio || PROFILE.about), avatar: String(profileRow?.avatar_url || '/assets/portrait.webp'), cv: String(profileRow?.cv_url || '') }
  const nameParts = profile.name.trim().split(/\\s+/)
  const firstName = nameParts.shift() || 'Rakin'
  const lastName = nameParts.join(' ') || 'Khan'
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} id="about" className="section about" aria-label="About Rakin Khan">
      <SectionBackground section='about' />
      <div className="bg-art right" aria-hidden="true">
        <img src="/assets/bg-hero.webp" alt="" />
      </div>

      <div className="container about-grid">
        <div className="about-info" data-reveal>
          <p className="section-label">{'//'} About Me</p>
          <h2 className="section-title">
            {firstName} <span className="text-red">{lastName}</span>
          </h2>
          <p className="section-sub about-text">{profile.about}</p>
          <div className="about-actions"><a href="#contact" className="btn btn-ghost">Know More <IconArrowRight /></a>{profile.cv && <a href={profile.cv} className="btn btn-ghost" target="_blank" rel="noreferrer">View CV ↗</a>}</div>
        </div>

        <div className="about-portrait" data-reveal data-reveal-delay="0.12">
          <div className="portrait-frame">
            <img
              src={profile.avatar}
              alt="Illustrated pop-art portrait of Rakin Khan"
              loading="lazy"
            />
          </div>
        </div>

        <div className="about-stats">
          {STATS.map((stat, i) => (
            <div className="stat-card" key={stat.label} data-reveal data-reveal-delay={0.1 + i * 0.1}>
              <div className="stat-icon">
                <SiteIcon name={stat.icon} />
              </div>
              <div>
                <p className="stat-value">{stat.value}</p>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="frame-corners" aria-hidden="true">
        <i className="c-tl" />
        <i className="c-br" />
      </div>
    </section>
  )
}
