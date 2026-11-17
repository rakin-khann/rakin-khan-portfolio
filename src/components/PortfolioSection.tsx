import { PROJECTS } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { useReveal } from '../hooks/useScrollAnimation'
import { IconArrowRight } from './icons'
import PortfolioVideo from './PortfolioVideo'
import { trackEvent } from '../lib/analytics'

export default function PortfolioSection() {
  const projectRows = usePublicRows('projects')
  const videoRows = usePublicRows('portfolio_media')
  const projects = projectRows.length ? projectRows.map(row => ({ title: String(row.title || ''), category: String(row.category || ''), image: String(row.cover_image_url || '/assets/work-neon.webp'), description: String(row.description || ''), url: String(row.project_url || ''), gallery: Array.isArray(row.gallery) ? row.gallery.map(item => String(item)).filter(Boolean) : [], placeholder: false })) : PROJECTS
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
              <img onClick={() => trackEvent("project_view", project.title)} src={project.image} alt={`${project.title} — ${project.category}`} loading="lazy" />
              {project.placeholder && <span className="work-chip">Placeholder</span>}
              <div className="work-overlay">
                <h3 className="work-title">{project.title}</h3>
                <p className="work-cat">{project.category}</p>
                {"description" in project && project.description && <p className="work-description">{project.description}</p>}
                {"gallery" in project && project.gallery.length > 0 && <div className="work-gallery">{project.gallery.slice(0, 3).map((src, index) => <img key={src + index} src={src} alt={`${project.title} gallery ${index + 1}`} loading="lazy" />)}</div>}
                {"url" in project && project.url && <a className="work-project-link" href={project.url} target="_blank" rel="noreferrer">View project ↗</a>}
              </div>
            </article>
          ))}
        </div>
      </div>
      {videoRows.length > 0 && <div className="container portfolio-video-section"><div className="portfolio-video-heading"><p className="section-label">// Videography</p><h2 className="section-title">Video <span className="text-red">Portfolio</span></h2><p className="section-sub">Selected films and motion work.</p></div><div className="portfolio-video-grid">{videoRows.map(row => <PortfolioVideo key={String(row.id)} id={String(row.id)} title={String(row.title)} poster={String(row.poster_url || '')} versions={{360:String(row.video_360_url||''),480:String(row.video_480_url||''),720:String(row.video_720_url||''),1080:String(row.video_1080_url||''),2160:String(row.video_2160_url||'')}} />)}</div></div>}
    </section>
  )
}
