import { usePublicRows } from '../hooks/usePublicRows'
import Header from './Header'
import Footer from './Footer'
import BackToTop from './BackToTop'
import './project-detail.css'

export default function ProjectDetail({ slug }: { slug: string }) {
  const rows = usePublicRows('projects')
  const project = rows.find(row => String(row.slug || '') === slug)
  if (!project) return <><Header /><main className="project-detail-page"><div className="project-detail-wrap"><p className="section-label">// PROJECT NOT FOUND</p><h1>This project is <span className="text-red">unavailable.</span></h1><a className="work-project-link" href="/#portfolio">← Back to portfolio</a></div></main><Footer /></>
  const gallery = Array.isArray(project.gallery) ? project.gallery.flatMap(item => String(item).split(/\r?\n|\\n/).map(url => url.trim()).filter(Boolean)) : typeof project.gallery === 'string' ? project.gallery.split(/\r?\n|\\n/).map(url => url.trim()).filter(Boolean) : []
  const cover = String(project.cover_image_url || '')
  const images = [...new Set([cover, ...gallery].filter(Boolean))]
  const details = [
    ['Client / Brand', project.client_name], ['My role', project.role_description],
    ['Duration', project.project_duration], ['Tools & technologies', project.tools_used],
  ].filter(([, value]) => Boolean(value))
  const sections = [
    ['Project goal', project.project_goal], ['The challenge', project.challenge],
    ['My solution', project.solution], ['Result & outcome', project.outcome],
  ].filter(([, value]) => Boolean(value))
  return <>
    <Header />
    <main className="project-detail-page">
      <div className="project-detail-wrap">
        <a className="project-back-link" href="/#portfolio">← Back to portfolio</a>
        <p className="section-label">// {String(project.category || 'Selected work')}</p>
        <h1>{String(project.title || '')}</h1>
        {Boolean(project.description) && <p className="project-detail-intro">{String(project.description)}</p>}
        {details.length > 0 && <div className="project-meta-grid">{details.map(([label, value]) => <div className="project-meta" key={String(label)}><small>{String(label)}</small><strong>{String(value)}</strong></div>)}</div>}
        {images.length > 0 && <section className="project-gallery-grid" aria-label="Project image gallery">{images.map((src, index) => <figure key={src}><img src={src} alt={String(project.title) + ' — image ' + (index + 1)} loading={index > 0 ? 'lazy' : 'eager'} decoding="async" /></figure>)}</section>}
        {sections.map(([heading, body]) => <section className="project-story" key={String(heading)}><p className="section-label">// {String(heading)}</p><p>{String(body)}</p></section>)}
        {Boolean(project.project_url) && <a className="project-live-link" href={String(project.project_url)} target="_blank" rel="noreferrer">Visit live project ↗</a>}
      </div>
    </main>
    <Footer />
    <BackToTop />
  </>
}
