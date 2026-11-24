import { PROJECTS } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { useReveal } from '../hooks/useScrollAnimation'
import { IconArrowRight } from './icons'
import { trackEvent } from '../lib/analytics'
import SectionBackground from './SectionBackground'

export default function PortfolioSection() {
  const projectRows = usePublicRows('projects')
  const projects = projectRows.length ? projectRows.map(row => ({ id: String(row.id || ''), slug: String(row.slug || ''), title: String(row.title || ''), category: String(row.category || ''), image: String(row.cover_image_url || '/assets/work-neon.webp'), description: String(row.description || ''), url: String(row.project_url || ''), gallery: Array.isArray(row.gallery) ? row.gallery.map(item => String(item)).filter(Boolean) : [], placeholder: false })) : PROJECTS.map((project, index) => ({ ...project, slug: '', id: String(index) }))
  const ref = useReveal<HTMLElement>()
  return <section ref={ref} id="portfolio" className="section portfolio" aria-label="Featured work">
    <SectionBackground section='portfolio' />
    <div className="container split">
      <div className="split-head" data-reveal><p className="section-label">{'//'} My Portfolio</p><h2 className="section-title">Featured <span className="text-red">Work</span></h2><p className="section-sub">A glimpse of my creative journey.</p><a href="#contact" className="btn btn-ghost">View All Projects <IconArrowRight /></a></div>
      <div className="work-grid">{projects.map((project, i) => <article className="work-card" key={project.title} data-reveal data-reveal-delay={(i % 4) * 0.08}>
        <a className="work-card-cover" href={project.slug ? `/projects/${project.slug}` : "#portfolio"} onClick={() => trackEvent("project_view", project.title)} aria-label={`View ${project.title} details`}><img src={project.image} alt={`${project.title} — ${project.category}`} loading="lazy" /></a>
        {project.placeholder && <span className="work-chip">Placeholder</span>}<div className="work-overlay"><h3 className="work-title">{project.title}</h3><p className="work-cat">{project.category}</p>
          {"description" in project && project.description && <p className="work-description">{project.description}</p>}{"gallery" in project && project.gallery.length > 0 && <div className="work-gallery">{project.gallery.slice(0, 3).map((src, index) => <img key={src + index} src={src} alt={`${project.title} gallery ${index + 1}`} loading="lazy" />)}</div>}
          {"slug" in project && project.slug && <a className="work-project-link" href={`/projects/${project.slug}`}>View project details ↗</a>}{"url" in project && project.url && <a className="work-project-link" href={project.url} target="_blank" rel="noreferrer">Live project ↗</a>}
        </div></article>)}</div>
    </div>
  </section>
}
