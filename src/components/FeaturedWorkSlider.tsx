import { useEffect, useState } from 'react'
import { usePublicRows } from '../hooks/usePublicRows'
import './FeaturedWorkSlider.css'

export default function FeaturedWorkSlider() {
  const rows = usePublicRows('projects')
  const projects = rows.filter(row => row.is_published !== false && Boolean(row.title) && Boolean(row.cover_image_url)).slice(0, 12)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (projects.length < 2) return
    const timer = window.setInterval(() => setActive(current => (current + 1) % projects.length), 3500)
    return () => window.clearInterval(timer)
  }, [projects.length])

  if (!projects.length) return null
  const project = projects[active]

  return (
    <section className="featured-slider-section" aria-label="Featured projects">
      <div className="featured-slider-shell">
        <div className="featured-slider-heading">
          <div><p className="section-label">// PLAYER ONE · PORTFOLIO</p><h2 className="section-title">Featured <span className="text-red">Works</span></h2></div>
          <span className="featured-slider-counter">WORK <i>{String(active + 1).padStart(2, '0')}</i> / {String(projects.length).padStart(2, '0')}</span>
        </div>
        <div className="featured-slider-frame" key={String(project.id || active)}>
          <div className="featured-slider-hud-top"><span>RK // CREATIVE ARCHIVE</span><span className="featured-slider-live"><i /> LIVE SHOWCASE</span></div>
          <div className="featured-slider-art">
            <img src={String(project.cover_image_url)} alt={String(project.title)} />
            <span className="featured-slider-vignette" />
            <span className="featured-slider-target" aria-hidden="true">+</span>
            <div className="featured-slider-titleplate"><span className="featured-slider-index">0{active + 1} / SELECTED PROJECT</span><h3>{String(project.title)}</h3></div>
          </div>
          <div className="featured-slider-hud-bottom"><span>◈ SYSTEM SHOWCASE</span><div className="featured-slider-progress">{projects.map((item, index) => <span key={String(item.id || index)} className={index === active ? 'active' : ''} />)}</div><span>AUTO PLAY · 3.5 SEC</span></div>
        </div>
      </div>
    </section>
  )
}
