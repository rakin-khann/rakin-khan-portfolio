import { usePublicRows } from '../hooks/usePublicRows'
import Header from './Header'
import Footer from './Footer'
import BackToTop from './BackToTop'
import './project-detail.css'
import '../admin/media-analytics.css'

export default function VideoDetail({ id }: { id: string }) {
  const rows = usePublicRows('portfolio_media')
  const video = rows.find(row => String(row.id || '') === id)
  if (!video) return <><Header /><main className="project-detail-page"><div className="project-detail-wrap"><p className="section-label">// VIDEO NOT FOUND</p><h1>This video is <span className="text-red">unavailable.</span></h1><a className="work-project-link" href="/#portfolio">← Back to portfolio</a></div></main><Footer /></>
  const versions = ['2160','1080','720','480','360'].filter(q => Boolean(video['video_'+q+'_url']))
  const preferred = String(video.default_quality || 'auto')
  const initial = preferred !== 'auto' && versions.includes(preferred) ? preferred : versions[0]
  return <><Header /><main className="project-detail-page video-detail-page"><div className="project-detail-wrap">
    <a className="project-back-link" href="/#portfolio">← Back to portfolio</a>
    <p className="section-label">// {String(video.category || 'VIDEOGRAPHY')}</p>
    <h1>{String(video.title || 'Video project')}</h1>
    <div className="video-detail-player"><video controls playsInline preload="metadata" poster={String(video.poster_url || '')}><source src={String(video['video_'+initial+'_url'] || '')}/></video></div>
    <div className="project-meta-grid"><div className="project-meta"><small>CONTENT TYPE</small><strong>Videography</strong></div><div className="project-meta"><small>AVAILABLE QUALITY</small><strong>{versions.map(q=>q+'p').join(' · ')}</strong></div></div>
    {Boolean(video.description) && <section className="project-story"><p className="section-label">// VIDEO DETAILS</p><p>{String(video.description)}</p></section>}
    <a className="work-project-link" href="/#portfolio">← Back to all work</a>
  </div></main><Footer /><BackToTop /></>
}
