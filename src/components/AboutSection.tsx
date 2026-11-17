import { PROFILE, STATS } from '../data/content'
import { useReveal } from '../hooks/useScrollAnimation'
import { IconArrowRight, SiteIcon } from './icons'

export default function AboutSection() {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} id="about" className="section about" aria-label="About Rakin Khan">
      <div className="bg-art right" aria-hidden="true">
        <img src="/assets/bg-hero.webp" alt="" />
      </div>

      <div className="container about-grid">
        <div className="about-info" data-reveal>
          <p className="section-label">{'//'} About Me</p>
          <h2 className="section-title">
            Rakin <span className="text-red">Khan</span>
          </h2>
          <p className="section-sub about-text">{PROFILE.about}</p>
          <a href="#contact" className="btn btn-ghost">
            Know More <IconArrowRight />
          </a>
        </div>

        <div className="about-portrait" data-reveal data-reveal-delay="0.12">
          <div className="portrait-frame">
            <img
              src="/assets/portrait.webp"
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
