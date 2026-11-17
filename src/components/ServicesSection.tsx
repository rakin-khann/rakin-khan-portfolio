import { SERVICES } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { useReveal } from '../hooks/useScrollAnimation'
import { IconArrowRight, SiteIcon } from './icons'

export default function ServicesSection() {
  const serviceRows = usePublicRows('services')
  const services = serviceRows.length ? serviceRows.map(row => ({ name: String(row.title || ''), icon: String(row.icon || 'pen'), desc: String(row.description || row.short_description || '') })) : SERVICES
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} id="services" className="section services" aria-label="Services">
      <div className="container split">
        <div className="split-head" data-reveal>
          <p className="section-label">{'//'} My Services</p>
          <h2 className="section-title">
            What I <span className="text-red">Do</span>
          </h2>
          <p className="section-sub">
            Bringing creativity and technology together to grow your brand.
          </p>
          <a href="#contact" className="btn btn-ghost">
            View All Services <IconArrowRight />
          </a>
        </div>

        <div className="service-grid">
          {services.map((service, i) => (
            <article
              className="service-card"
              key={service.name}
              data-reveal
              data-reveal-delay={(i % 4) * 0.08}
            >
              <div className="service-icon">
                <SiteIcon name={service.icon} />
              </div>
              <h3 className="service-name">{service.name}</h3>
              <p className="service-desc">{service.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
