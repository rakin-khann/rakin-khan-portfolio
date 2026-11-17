import { PROJECTS } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { useReveal } from '../hooks/useScrollAnimation'
import { IconArrowRight } from './icons'

export default function PortfolioSection() {
  const projectRows = usePublicRows('projects')
  const projects = projectRows.length ? projectRows.map(row => ({ title: String(row.title || ''), category: String(row.category || ''), image: String(row.cover_image_url || '/assets/work-neon.webp'), placeholder: false })) : PROJECTS
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} id="portfolio" className="section portfolio" aria-label="Featured work">
      <div className="container split">
        <div className="split-head" data-reveal>
          <p className="section-label">{'//'} My Portfolio</p>
          <h2 className="section-title">
            Featured <span className="text-red">Work</span>
          </h2>
          <p className="section-sub">A glimpse of my creative journey.</p>
          <a href="#contact" className="btn btn-ghost">
            View All Projects <IconArrowRight />
          </a>
        </div>

        <div className="work-grid">
          {projects.map((project, i) => (
            <article
              className="work-card"
              key={project.title}
              data-reveal
              data-reveal-delay={(i % 4) * 0.08}
            >
              <img src={project.image} alt={`${project.title} — ${project.category}`} loading="lazy" />
              {project.placeholder && <span className="work-chip">Placeholder</span>}
              <div className="work-overlay">
                <h3 className="work-title">{project.title}</h3>
                <p className="work-cat">{project.category}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
