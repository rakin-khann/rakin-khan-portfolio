import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '../lib/analytics'
type Props={id:string;title:string;poster?:string;versions:Record<string,string>}
const options=['2160','1080','720','480','360']
export default function PortfolioVideo({id,title,poster,versions}:Props){
 const video=useRef<HTMLVideoElement>(null)
 const [quality,setQuality]=useState('auto')
 const available=options.filter(q=>Boolean(versions[q]))
 const chosen=quality==='auto'?(available.includes('1080')?'1080':available[0]):quality
 const src=versions[chosen]||versions[available[0]]
 useEffect(()=>{const el=video.current;if(!el||!src)return;const time=el.currentTime;const wasPlaying=!el.paused;el.src=src;el.load();const restore=()=>{el.currentTime=Math.min(time,Math.max(0,el.duration||time));if(wasPlaying)void el.play().catch(()=>{})};el.addEventListener('loadedmetadata',restore,{once:true});return()=>el.removeEventListener('loadedmetadata',restore)},[src])
 return <div className="portfolio-video-card"><div className="portfolio-video-frame"><video ref={video} controls playsInline preload="none" poster={poster} onPlay={()=>trackEvent('video_play',id)} onEnded={()=>trackEvent('video_complete',id)}><source src={src}/></video></div><div className="portfolio-video-meta"><div><h3>{title}</h3><small>VIDEOGRAPHY / {available.map(q=>q+'P').join(' · ')}</small></div><label>QUALITY <select value={quality} onChange={e=>setQuality(e.target.value)}><option value="auto">Auto</option>{available.map(q=><option value={q} key={q}>{q}p</option>)}</select></label></div></div>
}
