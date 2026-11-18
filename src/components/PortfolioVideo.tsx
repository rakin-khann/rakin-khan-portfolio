import { trackEvent } from '../lib/analytics'
type Props={id:string;title:string;poster?:string;versions:Record<string,string>}
const options=['2160','1080','720','480','360']
export default function PortfolioVideo({id,title,poster,versions}:Props){
 const available=options.filter(q=>Boolean(versions[q]))
 return <a className="portfolio-video-card portfolio-video-link" href={'/videos/'+encodeURIComponent(id)} onClick={()=>trackEvent('video_detail_view',id)} aria-label={'Open video details for '+title}>
  <div className="portfolio-video-frame portfolio-video-poster">{poster?<img src={poster} alt={title+' video poster'} loading="lazy"/>:<div className="portfolio-video-placeholder"/>}<span className="portfolio-video-play" aria-hidden="true">▶</span></div>
  <div className="portfolio-video-meta"><div><h3>{title}</h3><small>VIDEOGRAPHY / {available.map(q=>q+'P').join(' · ')}</small></div><span className="work-project-link">VIEW VIDEO & DETAILS ↗</span></div>
 </a>
}
