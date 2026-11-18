import { useEffect, useState } from 'react'
import { deletePortfolioMedia, savePortfolioMedia, selectPortfolioMedia, uploadPortfolioVideo, uploadPublicAsset, type Session } from '../lib/supabase'

type Media = Record<string, unknown> & { id?: string }
const qualities = ['360','480','720','1080','2160'] as const
const blank = (): Media => ({ title:'', category:'Videography', description:'', poster_url:'', default_quality:'auto', sort_order:0, is_published:false })
export default function MediaPanel({ session }: { session: Session }) {
  const [items,setItems] = useState<Media[]>([])
  const [draft,setDraft] = useState<Media | null>(null)
  const [busy,setBusy] = useState(false)
  const [uploading,setUploading] = useState<string | null>(null)
  const [error,setError] = useState('')
  const [notice,setNotice] = useState('')
  const [bulkFiles,setBulkFiles] = useState<File[]>([])
  const [bulkRunning,setBulkRunning] = useState(false)
  const [bulkPublish,setBulkPublish] = useState(true)
  const [bulkProgress,setBulkProgress] = useState({done:0,total:0,current:''})
  const [bulkFailures,setBulkFailures] = useState<string[]>([])
  async function load(){ setBusy(true); try{setItems(await selectPortfolioMedia(session.access_token))}catch(e){setError(e instanceof Error?e.message:'Could not load media')}finally{setBusy(false)} }
  useEffect(()=>{void load()},[session.access_token])
  const update=(key:string,value:unknown)=>setDraft(current=>current?({...current,[key]:value}):current)
  async function uploadBulkVideos(){
    if(!bulkFiles.length||bulkRunning)return
    setBulkRunning(true);setBulkFailures([]);setError('');setNotice('');
    setBulkProgress({done:0,total:bulkFiles.length,current:''})
    const failures:string[]=[]
    let completed=0
    for(let index=0;index<bulkFiles.length;index++){
      const file=bulkFiles[index]
      setBulkProgress({done:completed,total:bulkFiles.length,current:file.name})
      try{
        if(!['mp4','webm'].includes(file.name.split('.').pop()?.toLowerCase()||''))throw new Error('Unsupported format (MP4/WebM only)')
        const url=await uploadPortfolioVideo(file,session.access_token,'1080')
        const title=file.name.replace(/\\.[^.]+$/,'').replace(/[_-]+/g,' ').trim()||'Untitled video'
        await savePortfolioMedia({title,category:'Videography',description:'',poster_url:null,default_quality:'1080',video_1080_url:url,sort_order:100000+index,is_published:bulkPublish},session.access_token)
      }catch(e){failures.push(file.name+': '+(e instanceof Error?e.message:'Upload failed'))}
      completed++
      setBulkProgress({done:completed,total:bulkFiles.length,current:file.name})
    }
    setBulkFailures(failures);setBulkFiles([]);setBulkRunning(false)
    setNotice((completed-failures.length)+' of '+completed+' videos uploaded'+(bulkPublish?' and published.':' as drafts.'))
    await load()
  }
  async function uploadVideo(quality:typeof qualities[number],file?:File){
    if(!file||!draft)return
    setUploading(quality);setError('')
    try{const url=await uploadPortfolioVideo(file,session.access_token,quality);update('video_'+quality+'_url',url);setNotice(quality+'p version uploaded. Save the project to publish it.')}
    catch(e){setError(e instanceof Error?e.message:'Video upload failed')}
    finally{setUploading(null)}
  }
  async function uploadPoster(file?:File){
    if(!file||!draft)return
    setUploading('poster');setError('')
    try{const url=await uploadPublicAsset(file,session.access_token);update('poster_url',url);setNotice('Poster uploaded. Save the project to apply it.')}
    catch(e){setError(e instanceof Error?e.message:'Poster upload failed')}
    finally{setUploading(null)}
  }
  async function save(){
    if(!draft)return
    if(!qualities.some(q=>draft['video_'+q+'_url'])){setError('Upload at least one video quality version.');return}
    setBusy(true);setError('')
    try{await savePortfolioMedia(draft,session.access_token);setDraft(null);setNotice('Video project saved.');await load()}
    catch(e){setError(e instanceof Error?e.message:'Could not save video project')}
    finally{setBusy(false)}
  }
  async function remove(item:Media){
    if(!item.id||!window.confirm('Delete this video portfolio record?'))return
    setBusy(true);try{await deletePortfolioMedia(item.id,session.access_token);await load();setNotice('Video record deleted.')}catch(e){setError(e instanceof Error?e.message:'Delete failed')}finally{setBusy(false)}
  }
  return <div className="media-panel">
    <div className="media-toolbar"><div><p className="admin-eyebrow">PORTFOLIO MEDIA LIBRARY</p><h2>Video projects</h2><small>Upload separate MP4/WebM versions for each quality. Auto selects the best available source supported by the viewer.</small></div><button className="admin-primary" onClick={()=>{setDraft(blank());setError('');setNotice('')}}>＋ Add video project</button></div>
    {error&&<p className="admin-error admin-notice">{error}</p>}{notice&&<p className="admin-success admin-notice">{notice}</p>}
    <section className="media-bulk-uploader">
      <div><h3>Bulk video upload</h3><p>Select up to 1,000+ MP4/WebM files at once. Each file becomes its own video project. Uploads run in a safe queue, one at a time.</p></div>
      <label className="media-bulk-picker">＋ Select multiple videos<input type="file" accept="video/mp4,video/webm,.mp4,.webm" multiple disabled={bulkRunning} onChange={e=>setBulkFiles(Array.from(e.target.files||[]))}/></label>
      {bulkFiles.length>0&&<><p className="media-bulk-count">{bulkFiles.length.toLocaleString()} videos selected</p><label className="editor-toggle"><input type="checkbox" checked={bulkPublish} disabled={bulkRunning} onChange={e=>setBulkPublish(e.target.checked)}/> <small>Publish each video immediately after upload</small></label><button className="admin-primary" disabled={bulkRunning} onClick={()=>void uploadBulkVideos()}>{bulkRunning?'UPLOADING…':'UPLOAD '+bulkFiles.length.toLocaleString()+' VIDEOS →'}</button></>}
      {bulkRunning&&<div className="media-bulk-progress"><div><strong>{bulkProgress.done.toLocaleString()} / {bulkProgress.total.toLocaleString()}</strong><span>{Math.round(bulkProgress.done/Math.max(1,bulkProgress.total)*100)}%</span></div><progress max={bulkProgress.total||1} value={bulkProgress.done}/><small>Now uploading: {bulkProgress.current}</small></div>}
      {bulkFailures.length>0&&<details className="media-bulk-errors"><summary>{bulkFailures.length} files could not be uploaded</summary>{bulkFailures.map((failure,i)=><p key={i}>{failure}</p>)}</details>}
    </section>

    {draft&&<section className="media-editor">
      <div className="admin-editor-head"><h2>{draft.id?'Edit video project':'New video project'}</h2><button onClick={()=>setDraft(null)}>✕ Close</button></div>
      <div className="editor-fields">
        <label className="editor-field"><span>Project title *</span><input value={String(draft.title||'')} onChange={e=>update('title',e.target.value)} required/></label>
        <label className="editor-field"><span>Category</span><input value={String(draft.category||'')} onChange={e=>update('category',e.target.value)}/></label>
        <label className="editor-field full"><span>Description</span><textarea rows={3} value={String(draft.description||'')} onChange={e=>update('description',e.target.value)}/></label>
        <label className="editor-field"><span>Poster / Thumbnail</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>void uploadPoster(e.target.files?.[0])}/><small>{uploading==='poster'?'Uploading poster…':'JPG, PNG, WebP or AVIF'}</small>{Boolean(draft.poster_url)&&<img className="editor-image-preview" src={String(draft.poster_url)} alt="Video poster"/>}</label>
        <label className="editor-field"><span>Default quality</span><select value={String(draft.default_quality||'auto')} onChange={e=>update('default_quality',e.target.value)}><option value="auto">Auto (recommended)</option>{qualities.map(q=><option key={q} value={q}>{q}p</option>)}</select></label>
        {qualities.map(q=><label className="editor-field" key={q}><span>{q}p video version</span><input type="file" accept="video/mp4,video/webm,.mp4,.webm" onChange={e=>void uploadVideo(q,e.target.files?.[0])}/><small>{uploading===q?'Uploading '+q+'p…':draft['video_'+q+'_url']?'✓ Version uploaded':'Upload MP4 or WebM file for '+q+'p'}</small></label>)}
        <label className="editor-field"><span>Display order</span><input type="number" value={String(draft.sort_order??0)} onChange={e=>update('sort_order',Number(e.target.value))}/></label>
        <label className="editor-field"><span>Publish on website</span><span className="editor-toggle"><input type="checkbox" checked={Boolean(draft.is_published)} onChange={e=>update('is_published',e.target.checked)}/> <small>{draft.is_published?'Published':'Draft'}</small></span></label>
      </div>
      <div className="editor-actions"><button className="admin-secondary" onClick={()=>setDraft(null)}>Cancel</button><button className="admin-primary" disabled={busy||Boolean(uploading)||!String(draft.title||'').trim()} onClick={()=>void save()}>{busy?'SAVING…':'SAVE VIDEO PROJECT →'}</button></div>
    </section>}
    {busy&&!draft?<p className="admin-empty">LOADING MEDIA…</p>:items.length===0&&!draft?<div className="admin-empty"><span>▣</span><h2>No video projects yet</h2><p>Upload your first videography project to feature it on the portfolio.</p></div>:<div className="media-records">{items.map(item=><article className="media-record" key={String(item.id)}>{Boolean(item.poster_url)&&<img src={String(item.poster_url)} alt="" loading="lazy"/>}<div className="media-record-copy"><strong>{String(item.title)}</strong><small>{String(item.category||'Videography')} · {qualities.filter(q=>item['video_'+q+'_url']).map(q=>q+'p').join(' / ')}</small><span className={item.is_published?'admin-pill published':'admin-pill'}>{item.is_published?'PUBLISHED':'DRAFT'}</span></div><div className="admin-record-actions"><button onClick={()=>{setDraft({...item});setError('');setNotice('')}}>Edit</button><button className="danger" onClick={()=>void remove(item)}>Delete</button></div></article>)}</div>}
  </div>
}
