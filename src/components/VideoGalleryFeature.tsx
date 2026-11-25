import { usePublicRows } from '../hooks/usePublicRows'
import { trackEvent } from '../lib/analytics'
import './VideoGalleryFeature.css'

export default function VideoGalleryFeature() {
  const videos = usePublicRows('portfolio_media')
  const featured = videos[0]
  const poster = String(featured?.poster_url || '')
  return <section id="video-portfolio" className="section video-feature-section" aria-labelledby="video-feature-title">
    <div className="video-feature-shell">
      <div className="video-feature-heading">
        <p className="section-label">// MOTION & VISUAL STORYTELLING</p>
        <span className="video-feature-index">RK / VIDEO ARCHIVE</span>
      </div>
      <a className="video-feature-card" href="/videos" onClick={() => trackEvent('video_gallery_view', 'all-videos')} aria-label="Explore the complete video portfolio">
        <div className="video-feature-visual">
          {poster ? <img src={poster} alt="Featured video portfolio preview" loading="lazy" /> : <div className="video-feature-art"><span>RK</span><i>PLAY</i></div>}
          <div className="video-feature-scanlines" aria-hidden="true" />
          <span className="video-feature-play" aria-hidden="true">▶</span>
          <span className="video-feature-visual-label">MOTION REEL / 001</span>
        </div>
        <div className="video-feature-copy">
          <p className="video-feature-kicker">THE VIDEO PORTFOLIO</p>
          <h2 id="video-feature-title">Beyond Static Visuals<span>.</span><br /><em>Experience Motion.</em></h2>
          <p className="video-feature-highlight">BEYOND STATIC VISUALS — EXPERIENCE MY CREATIVE WORLD IN MOTION.</p>
          <p className="video-feature-description">Discover cinematic edits, visual stories and selected video projects — all in one place.</p>
          <div className="video-feature-bottom"><span className="video-feature-count">{videos.length.toString().padStart(2, '0')} / SELECTED VIDEOS</span><span className="video-feature-link">EXPLORE VIDEO GALLERY <b>↗</b></span></div>
        </div>
      </a>
      <p className="video-feature-footnote"><span /> CLICK TO ENTER THE VIDEO ARCHIVE <span className="video-feature-footnote-right">VISUALS IN MOTION // RK</span></p>
    </div>
  </section>
}
