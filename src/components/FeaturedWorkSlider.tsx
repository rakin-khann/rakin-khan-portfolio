import { useEffect, useState } from 'react'
import { usePublicRows } from '../hooks/usePublicRows'
import { IconArrowRight } from './icons'
import './FeaturedWorkSlider.css'

export default function FeaturedWorkSlider() {
  const rows = usePublicRows('projects')
  const projects = rows
    .filter(row => row.is_published !== false && Boolean(row.title) && Boolean(row.cover_image_url))
    .slice(0, 12)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (active >= projects.length) setActive(0)
  }, [active, projects.length])

  useEffect(() => {
    if (paused || projects.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setActive(current => (current + 1) % projects.length), 5600)
    return () => window.clearInterval(timer)
  }, [paused, projects.length])

  if (!projects.length) return null
  const project = projects[active]
  const slug = String(project.slug || '')
  const href = slug ? `/projects/${encodeURIComponent(slug)}` : '#portfolio'

  return (
    <section className="featured-slider-section" aria-label="Featured projects">
      <div className="featured-slider-shell" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false) }}>
        <div className="featured-slider-heading">
          <div><p className="section-label">// THE SHOWCASE</p><h2 className="section-title">Featured <span className="text-red">Creations</span></h2><p className="section-sub">A rotating showcase of my latest creative work.</p></div>
          <span className="featured-slider-counter">{String(active + 1).padStart(2, '0')} <i>/</i> {String(projects.length).padStart(2, '0')}</span>
        </div>
        <div className="featured-slider-card" key={String(project.id || active)}>
          <div className="featured-slider-art">
            <img src={String(project.cover_image_url)} alt={String(project.title)} />
            <span className="featured-slider-stamp">RK / FEATURED WORK</span>
            <span className="featured-slider-scan" aria-hidden="true" />
          </div>
          <div className="featured-slider-copy">
            <p className="featured-slider-kicker">{String(project.category || 'SELECTED PROJECT')}</p>
            <h3>{String(project.title)}</h3>
            <p className="featured-slider-description">{String(project.description || 'A selected project from my creative portfolio.')}</p>
            <a className="featured-slider-link" href={href}>Explore Project <IconArrowRight /></a>
            <div className="featured-slider-controls">
              <button type="button" aria-label="Previous project" onClick={() => setActive(current => (current - 1 + projects.length) % projects.length)}>←</button>
              <div className="featured-slider-dots">{projects.map((item, index) => <button key={String(item.id || index)} type="button" className={index === active ? 'active' : ''} aria-label={`Show project ${index + 1}: ${String(item.title)}`} aria-current={index === active ? 'true' : undefined} onClick={() => setActive(index)} />)}</div>
              <button type="button" aria-label="Next project" onClick={() => setActive(current => (current + 1) % projects.length)}>→</button>
            </div>
          </div>
        </div>
        <p className="featured-slider-footnote"><span /> AUTO ROTATING SHOWCASE <span className="featured-slider-footnote-right">DESIGNED IN THE SPIRIT OF THE RONIN</span></p>
      </div>
    </section>
  )
}
