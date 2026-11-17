import { useEffect, useState } from 'react'
import { saveRow, uploadPublicAsset, type Session } from '../lib/supabase'

type Props = { session: Session; rows: Record<string, unknown>[]; reload: () => Promise<void>; setError: (value: string) => void }
type SectionBg = { mode: 'color' | 'image'; color: string; image_url: string; overlay: number; red_glow: number }
type Scene = { name: string; character_url: string; background_mode: 'color' | 'image'; background_url: string; background_color: string; accent_color: string; secondary_color: string; red_glow: number; is_published: boolean }
const defaults = { primary: '#ff101a', secondary: '#850000', background: '#050505', text: '#ffffff', muted: '#c0c0c0' }
const imageAccept = 'image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif'
const sectionNames = [{ key: 'about', label: 'About' }, { key: 'services', label: 'Services' }, { key: 'portfolio', label: 'Portfolio' }, { key: 'skills', label: 'Skills' }] as const
const defaultSectionBg: SectionBg = { mode: 'color', color: '#050505', image_url: '', overlay: 0.12, red_glow: 0.12 }
const newScene = (number: number): Scene => ({ name: `Character ${number}`, character_url: '', background_mode: 'color', background_url: '', background_color: '#050505', accent_color: '#ff101a', secondary_color: '#850000', red_glow: 0.13, is_published: true })
const asScene = (value: Record<string, unknown>, number: number): Scene => ({ ...newScene(number), name: String(value.name || `Character ${number}`), character_url: String(value.character_url || ''), background_mode: value.background_mode === 'image' || value.background_url ? 'image' : 'color', background_url: String(value.background_url || ''), background_color: String(value.background_color || '#050505'), accent_color: String(value.accent_color || '#ff101a'), secondary_color: String(value.secondary_color || '#850000'), red_glow: Math.max(0, Math.min(0.6, Number(value.red_glow ?? 0.13))), is_published: value.is_published !== false })

export default function AppearancePanel({ session, rows, reload, setError }: Props) {
  const [theme, setTheme] = useState(defaults)
  const [scenes, setScenes] = useState<Scene[]>([newScene(1)])
  const [sectionBackgrounds, setSectionBackgrounds] = useState<Record<string, SectionBg>>({ about: { ...defaultSectionBg }, services: { ...defaultSectionBg }, portfolio: { ...defaultSectionBg }, skills: { ...defaultSectionBg } })
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  useEffect(() => {
    const savedTheme = (rows.find(row => row.key === 'global_theme')?.value || {}) as Record<string, string>
    const sceneList = rows.find(row => row.key === 'hero_scenes')?.value
    const legacy = (rows.find(row => row.key === 'hero_scene')?.value || {}) as Record<string, unknown>
    const parsed = Array.isArray(sceneList) ? sceneList.slice(0, 10).map((item, index) => asScene((item || {}) as Record<string, unknown>, index + 1)) : [asScene(legacy, 1)]
    setTheme({ primary: savedTheme.primary || defaults.primary, secondary: savedTheme.secondary || defaults.secondary, background: savedTheme.background || defaults.background, text: savedTheme.text || defaults.text, muted: savedTheme.muted || defaults.muted })
    setScenes(parsed.length ? parsed : [newScene(1)])
    const nextBackgrounds: Record<string, SectionBg> = {}
    for (const item of sectionNames) {
      const value = (rows.find(row => row.key === 'section_bg_' + item.key)?.value || {}) as Partial<SectionBg>
      nextBackgrounds[item.key] = { ...defaultSectionBg, ...value, mode: value.mode === 'image' ? 'image' : 'color', color: value.color || '#050505', image_url: value.image_url || '', overlay: Math.max(0, Math.min(0.9, Number(value.overlay ?? 0.12))), red_glow: Math.max(0, Math.min(0.6, Number(value.red_glow ?? 0.12))) }
    }
    setSectionBackgrounds(nextBackgrounds)
  }, [rows])
  function updateScene(index: number, key: keyof Scene, value: string | number | boolean) { setScenes(current => current.map((scene, i) => i === index ? { ...scene, [key]: value } : scene)) }
  async function upload(index: number, target: 'character_url' | 'background_url', file?: File) {
    if (!file) return
    const uploadKey = `${index}-${target}`; setUploading(uploadKey); setError('')
    try { const url = await uploadPublicAsset(file, session.access_token); updateScene(index, target, url); if (target === 'background_url') updateScene(index, 'background_mode', 'image') }
    catch (e) { setError(e instanceof Error ? e.message : 'Image upload failed') }
    finally { setUploading(null) }
  }
  function updateSectionBg(key: string, field: keyof SectionBg, value: string | number) {
    setSectionBackgrounds(current => ({ ...current, [key]: { ...current[key], [field]: value } }))
  }
  async function uploadSectionBg(key: string, file?: File) {
    if (!file) return
    setUploading('section-' + key); setError('')
    try {
      const url = await uploadPublicAsset(file, session.access_token)
      setSectionBackgrounds(current => ({ ...current, [key]: { ...current[key], image_url: url, mode: 'image' } }))
    } catch (e) { setError(e instanceof Error ? e.message : 'Background upload failed') }
    finally { setUploading(null) }
  }
  async function save() {
    setBusy(true); setError('')
    try {
      await saveRow('site_settings', { key: 'global_theme', value: theme }, session.access_token, 'key')
      await saveRow('site_settings', { key: 'hero_scenes', value: scenes }, session.access_token, 'key')
      for (const item of sectionNames) await saveRow('site_settings', { key: 'section_bg_' + item.key, value: sectionBackgrounds[item.key] }, session.access_token, 'key')
      const first = scenes[0]
      await saveRow('site_settings', { key: 'hero_scene', value: { character_url: first.character_url, background_mode: first.background_mode, background_url: first.background_mode === 'image' ? first.background_url : '', background_color: first.background_color, red_glow: first.red_glow } }, session.access_token, 'key')
      await reload()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save appearance') }
    finally { setBusy(false) }
  }
  const colours: { key: keyof typeof theme; label: string }[] = [{ key: 'primary', label: 'Primary accent' }, { key: 'secondary', label: 'Secondary accent' }, { key: 'background', label: 'Background' }, { key: 'text', label: 'Main text' }, { key: 'muted', label: 'Muted text' }]
  return <div className='appearance-editor'>
    <section className='appearance-card'><p className='admin-eyebrow'>GLOBAL DESIGN SYSTEM</p><h2>Website colours</h2><p>These are the site's general design colours. Character themes below only change the Hero interface.</p>
      <div className='appearance-colours'>{colours.map(item => <label className='colour-field' key={item.key}>{item.label}<input type='color' value={theme[item.key]} onChange={e => setTheme(value => ({ ...value, [item.key]: e.target.value }))} /></label>)}</div>
      <div className='theme-preview' style={{ background: theme.background, color: theme.text, borderColor: theme.primary }}><strong style={{ color: theme.primary }}>LIVE PREVIEW</strong><h3>RAKIN KHAN</h3><span style={{ background: theme.primary }}>Explore My Work</span></div>
    </section>
    <section className='appearance-card'>
      <p className='admin-eyebrow'>SECTION BACKGROUND CONTROL</p><h2>About, Services, Portfolio & Skills backgrounds</h2>
      <p>প্রতিটি সেকশনের Background আলাদাভাবে পরিবর্তন করো। Solid colour অথবা নিজের ছবি Upload করো, Overlay ও Red Glow ঠিক করে Preview দেখে Save করো।</p>
    </section>
    {sectionNames.map(item => {
      const bg = sectionBackgrounds[item.key] || defaultSectionBg
      return <section className='appearance-card section-bg-editor' key={item.key}>
        <p className='admin-eyebrow'>SECTION / {item.key.toUpperCase()}</p><h2>{item.label} Background</h2>
        <div className='hero-background-preview section-bg-preview' style={{ backgroundColor: bg.mode === 'color' ? bg.color : '#050505', backgroundImage: bg.mode === 'image' && bg.image_url ? `linear-gradient(rgba(0,0,0,${bg.overlay}),rgba(0,0,0,${bg.overlay})),radial-gradient(ellipse at 50% 70%,rgba(255,16,26,${bg.red_glow}),transparent 65%),url("${bg.image_url}")` : `radial-gradient(ellipse at 50% 70%,rgba(255,16,26,${bg.red_glow}),transparent 65%)` }}>
          <strong>{item.label.toUpperCase()}</strong><small>BACKGROUND PREVIEW</small>
        </div>
        <div className='background-mode-switch'>
          <button type='button' className={bg.mode === 'color' ? 'selected' : ''} onClick={() => updateSectionBg(item.key, 'mode', 'color')}>SOLID COLOUR</button>
          <button type='button' className={bg.mode === 'image' ? 'selected' : ''} onClick={() => updateSectionBg(item.key, 'mode', 'image')}>IMAGE</button>
        </div>
        {bg.mode === 'color' ? <label className='colour-field hero-bg-colour'>Background colour<input type='color' value={bg.color} onChange={e => updateSectionBg(item.key, 'color', e.target.value)} /></label> : <>
          <label className='upload-character hero-bg-upload'>{uploading === 'section-' + item.key ? 'UPLOADING…' : 'UPLOAD BACKGROUND IMAGE'}<input type='file' accept={imageAccept} disabled={Boolean(uploading)} onChange={e => { void uploadSectionBg(item.key, e.target.files?.[0]); e.currentTarget.value = '' }} /></label>
          {bg.image_url && <small>Background image uploaded ✓</small>}
        </>}
        <label className='glow-control'>Dark overlay <strong>{Math.round(bg.overlay * 100)}%</strong><input type='range' min='0' max='0.9' step='0.01' value={bg.overlay} onChange={e => updateSectionBg(item.key, 'overlay', Number(e.target.value))} /></label>
        <label className='glow-control'>Red glow <strong>{Math.round(bg.red_glow * 100)}%</strong><input type='range' min='0' max='0.6' step='0.01' value={bg.red_glow} onChange={e => updateSectionBg(item.key, 'red_glow', Number(e.target.value))} /></label>
      </section>
    })}
    <section className='appearance-card rotation-intro'><p className='admin-eyebrow'>DYNAMIC HERO ROTATION</p><h2>Character & background library</h2><p>সর্বোচ্চ ১০টি আলাদা Hero theme তৈরি করো। প্রতিটি ভিজিট/রিফ্রেশে পরের Published theme দেখাবে। ১০ নম্বরের পর আবার প্রথমটি আসবে। কোনো theme অসম্পূর্ণ বা character image ছাড়া থাকলে সেটি website-এ দেখানো হবে না।</p><div className='rotation-summary'><strong>{scenes.length} / 10 themes configured</strong><span>Display order follows the cards below</span></div></section>
    {scenes.map((scene, index) => <section className='appearance-card rotation-scene' key={index}>
      <div className='rotation-scene-head'><div><p className='admin-eyebrow'>THEME {String(index + 1).padStart(2, '0')}</p><h2>{scene.name || `Character ${index + 1}`}</h2></div><div className='rotation-actions'>
        <button type='button' className='admin-secondary' disabled={index === 0} onClick={() => setScenes(current => { const next = [...current]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next })}>↑</button>
        <button type='button' className='admin-secondary' disabled={index === scenes.length - 1} onClick={() => setScenes(current => { const next = [...current]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; return next })}>↓</button>
        <button type='button' className='admin-secondary rotation-remove' disabled={scenes.length === 1} onClick={() => setScenes(current => current.filter((_, i) => i !== index))}>Remove</button>
      </div></div>
      <label className='character-url'>Theme / character name<input value={scene.name} onChange={e => updateScene(index, 'name', e.target.value)} placeholder='e.g. Samurai, Kratos, God of War' /></label>
      <label className='rotation-publish'><input type='checkbox' checked={scene.is_published} onChange={e => updateScene(index, 'is_published', e.target.checked)} /> <span>Include this theme in public rotation</span></label>
      <div className='rotation-media-grid'>
        <div><strong>Character artwork</strong><div className='character-preview'>{scene.character_url ? <img src={scene.character_url} alt={scene.name} /> : <span>Upload character image</span>}</div>
          <label className='upload-character'>{uploading === `${index}-character_url` ? 'UPLOADING…' : 'UPLOAD CHARACTER IMAGE'}<input type='file' accept={imageAccept} disabled={Boolean(uploading)} onChange={e => void upload(index, 'character_url', e.target.files?.[0])} /></label>
          <label className='character-url'>Character image URL<input value={scene.character_url} onChange={e => updateScene(index, 'character_url', e.target.value)} placeholder='Upload or paste image URL' /></label></div>
        <div><strong>Hero background</strong><div className='hero-background-preview' style={{ backgroundColor: scene.background_mode === 'color' ? scene.background_color : '#050505', backgroundImage: scene.background_mode === 'image' && scene.background_url ? `linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.55)),url("${scene.background_url}")` : undefined }}><span>{scene.name.toUpperCase()}</span><small>BACKGROUND PREVIEW</small></div>
          <div className='background-mode-switch'><button type='button' className={scene.background_mode === 'color' ? 'selected' : ''} onClick={() => updateScene(index, 'background_mode', 'color')}>SOLID COLOUR</button><button type='button' className={scene.background_mode === 'image' ? 'selected' : ''} onClick={() => updateScene(index, 'background_mode', 'image')}>IMAGE</button></div>
          {scene.background_mode === 'color' ? <label className='colour-field hero-bg-colour'>Background colour<input type='color' value={scene.background_color} onChange={e => updateScene(index, 'background_color', e.target.value)} /></label> : <>
            <label className='upload-character hero-bg-upload'>{uploading === `${index}-background_url` ? 'UPLOADING…' : 'UPLOAD BACKGROUND IMAGE'}<input type='file' accept={imageAccept} disabled={Boolean(uploading)} onChange={e => void upload(index, 'background_url', e.target.files?.[0])} /></label>
            <label className='character-url'>Background image URL<input value={scene.background_url} onChange={e => updateScene(index, 'background_url', e.target.value)} placeholder='Upload or paste image URL' /></label></>}</div>
      </div>
      <div className='appearance-colours rotation-colours'><label className='colour-field'>Hero accent<input type='color' value={scene.accent_color} onChange={e => updateScene(index, 'accent_color', e.target.value)} /></label><label className='colour-field'>Secondary accent<input type='color' value={scene.secondary_color} onChange={e => updateScene(index, 'secondary_color', e.target.value)} /></label><label className='glow-control'>Accent glow <strong>{Math.round(scene.red_glow * 100)}%</strong><input type='range' min='0' max='0.6' step='0.01' value={scene.red_glow} onChange={e => updateScene(index, 'red_glow', Number(e.target.value))} /></label></div>
      <small>Transparent PNG/WebP character images are recommended. JPG, PNG, WebP and AVIF supported; maximum 12 MB per image.</small>
    </section>)}
    <button type='button' className='admin-secondary rotation-add' disabled={scenes.length >= 10} onClick={() => setScenes(current => [...current, newScene(current.length + 1)])}>＋ ADD THEME ({scenes.length}/10)</button>
    <button className='admin-primary appearance-save' disabled={busy || Boolean(uploading)} onClick={() => void save()}>{busy ? 'SAVING…' : 'SAVE ALL THEMES & WEBSITE APPEARANCE →'}</button>
  </div>
}
