import { useState } from 'react'
import { usePublicRows } from '../hooks/usePublicRows'
import Header from './Header'
import Footer from './Footer'
import BackToTop from './BackToTop'
import './project-detail.css'
import '../admin/media-analytics.css'

export default function VideoDetail({ id }: { id: string }) {
  const rows = usePublicRows('portfolio_media')
  const video = rows.find(row => String(row.id || '') === id)
  const [quality,setQuality] = useState('')
  if (!video) return <><Header /><main className="project-detail-page"><div className="project-detail-wrap"><p className="section-label">// VIDEO NOT FOUND</p><h1>This video is <span className="text-red">unavailable.</span></h1><a className="work-project-link" href="/#portfolio">← Back to portfolio</a></div></main><Footer /></>
  const versions = ['2160','1080','720','480','360'].filter(q => Boolean(video['video_'+q+'_url']))
  const preferred = String(video.default_quality || 'auto')
  const selected = quality || (preferred !== 'auto' && versions.includes(preferred) ? preferred : versions[0])
  const source = String(video['video_'+selected+'_url'] || video['video_'+versions[0]+'_url'] || '')
  return <><Header /><main className="project-detail-page video-detail-page"><div className="project-detail-wrap">
    <a className="project-back-link" href="/#portfolio">← Back to portfolio</a>
    <p className="section-label">// {String(video.category || 'VIDEOGRAPHY')}</p>
    <h1>{String(video.title || 'Video project')}</h1>
    <div className="video-detail-player"><video key={source} controls playsInline preload="metadata" poster={String(video.poster_url || '')}><source src={source}/></video></div>
    {versions.length>1&&<label className="video-detail-quality">VIDEO QUALITY <select value={selected} onChange={e=>setQuality(e.target.value)}>{versions.map(q=><option value={q} key={q}>{q}p</option>)}</select></label>}
    <div className="project-meta-grid"><div className="project-meta"><small>CONTENT TYPE</small><strong>Videography</strong></div><div className="project-meta"><small>AVAILABLE QUALITY</small><strong>{versions.map(q=>q+'p').join(' · ')}</strong></div></div>
    <section className="project-story"><p className="section-label">// VIDEO DETAILS</p><p>{String(video.description || 'Selected video from my portfolio.')}</p></section>
    <a className="work-project-link" href="/#portfolio">← Back to all work</a>
  </div></main><Footer /><BackToTop /></>
}
