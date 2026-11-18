import { usePublicRows } from '../hooks/usePublicRows'
import Header from './Header'
import Footer from './Footer'
import BackToTop from './BackToTop'
import './project-detail.css'
import '../admin/media-analytics.css'

export default function VideoGallery() {
  const videos = usePublicRows('portfolio_media')
  return <><Header /><main className="project-detail-page video-gallery-page"><div className="project-detail-wrap">
    <a className="project-back-link" href="/#portfolio">← Back to portfolio</a>
    <p className="section-label">// SELECTED MOTION WORK</p><h1>Video <span className="text-red">Gallery</span></h1>
    <p className="section-sub">Explore the complete collection. Select any video to watch it.</p>
    {videos.length ? <div className="video-gallery-grid">{videos.map(video=>{
      const id=String(video.id||''); const title=String(video.title||'Video project'); const poster=String(video.poster_url||'');
      const qualities=['2160','1080','720','480','360'].filter(q=>Boolean(video['video_'+q+'_url']));
      return <a className="video-gallery-card" href={'/videos/'+encodeURIComponent(id)} key={id}>
        <div className="video-gallery-poster">{poster?<img src={poster} alt={title+' thumbnail'} loading="lazy"/>:<div className="portfolio-video-placeholder"/>}<span className="portfolio-video-play" aria-hidden="true">▶</span></div>
        <div className="video-gallery-copy"><h2>{title}</h2><p>{String(video.description||'Selected video from my portfolio.')}</p><small>{String(video.category||'VIDEOGRAPHY')} · {qualities.map(q=>q+'P').join(' · ')}</small></div>
      </a>
    })}</div>:<p className="analytics-empty">New video projects will appear here soon.</p>}
  </div></main><Footer/><BackToTop/></>
}
