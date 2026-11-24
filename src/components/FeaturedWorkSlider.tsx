import { useEffect, useState } from 'react'
import { usePublicRows } from '../hooks/usePublicRows'
import './FeaturedWorkSlider.css'

export default function FeaturedWorkSlider() {
  const rows = usePublicRows('projects')
  const projects = rows.filter(row => row.is_published !== false && Boolean(row.title) && Boolean(row.cover_image_url)).slice(0, 12)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => { if (active >= projects.length) setActive(0) }, [active, projects.length])
  useEffect(() => {
    if (paused || projects.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActive(current => (current + 1) % projects.length), 4000)
    return () => window.clearInterval(timer)
  }, [paused, projects.length, active])

  if (!projects.length) return null
  const project = projects[active]
  const title = String(project.title)
  const category = String(project.category || 'SELECTED PROJECT')
  const description = String(project.description || 'A selected project from my creative portfolio.')
  const externalUrl = String(project.project_url || '')
  const detailUrl = project.slug ? `/projects/${encodeURIComponent(String(project.slug))}` : '#portfolio'
  const href = externalUrl || detailUrl

  return <section className="featured-slider-section" aria-label="Featured projects">
    <div className="featured-slider-shell" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false) }}>
      <div className="featured-slider-heading">
        <div><p className="section-label">// PROJECT ARCHIVE</p><h2 className="section-title">Featured <span className="text-red">Works</span></h2></div>
        <span className="featured-slider-counter">{String(active + 1).padStart(2, '0')} <i>/</i> {String(projects.length).padStart(2, '0')}</span>
      </div>
      <div className="featured-slider-card" key={String(project.id || active)}>
        <div className="featured-slider-visual">
          <img className="featured-slider-image" src={String(project.cover_image_url)} alt={title} />
          <div className="featured-slider-image-shade" />
          <span className="featured-slider-image-tag">RK // SELECTED WORK</span>
          <span className="featured-slider-crosshair" aria-hidden="true">＋</span>
          <span className="featured-slider-orbit featured-slider-orbit-one" aria-hidden="true" />
          <span className="featured-slider-orbit featured-slider-orbit-two" aria-hidden="true" />
          <span className="featured-slider-stars" aria-hidden="true" />
          <span className="featured-slider-image-index">0{active + 1} / 0{projects.length}</span>
        </div>
        <div className="featured-slider-details">
          <div className="featured-slider-status"><span /> SYSTEM ONLINE <i>•</i> PROJECT {String(active + 1).padStart(2, '0')}</div>
          <p className="featured-slider-kicker">{category}</p>
          <h3>{title}</h3>
          <p className="featured-slider-description">{description}</p>
          <div className="featured-slider-feature"><span className="featured-slider-feature-icon">◈</span><div><strong>CREATIVE ARCHIVE</strong><small>Selected work by Rakin Khan</small></div></div>
          <a className="featured-slider-link" href={href} target={externalUrl ? '_blank' : undefined} rel={externalUrl ? 'noreferrer' : undefined}>VIEW PROJECT <span>↗</span></a>
          <div className="featured-slider-controls">
            <button type="button" aria-label="Previous project" onClick={() => setActive(current => (current - 1 + projects.length) % projects.length)}>←</button>
            <div className="featured-slider-dots">{projects.map((item, index) => <button key={String(item.id || index)} type="button" className={index === active ? 'active' : ''} aria-label={`Show project ${index + 1}: ${String(item.title)}`} onClick={() => setActive(index)} />)}</div>
            <button type="button" aria-label="Next project" onClick={() => setActive(current => (current + 1) % projects.length)}>→</button>
          </div>
        </div>
      </div>
      <div className="featured-slider-progress"><span key={active} className={paused ? 'paused' : ''} /></div>
      <p className="featured-slider-footnote"><span /> AUTO ROTATING SHOWCASE <span className="featured-slider-footnote-right">4 SEC // NEXT PROJECT LOADING</span></p>
    </div>
  </section>
}
