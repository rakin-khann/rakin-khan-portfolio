import { useEffect, useState } from 'react'
import { saveRow, uploadPublicAsset, type Session } from '../lib/supabase'

type Props = { session: Session; rows: Record<string, unknown>[]; reload: () => Promise<void>; setError: (value: string) => void }
const defaults = { primary: '#ff101a', secondary: '#850000', background: '#050505', text: '#ffffff', muted: '#c0c0c0' }
const imageAccept = 'image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif'

export default function AppearancePanel({ session, rows, reload, setError }: Props) {
  const [theme, setTheme] = useState(defaults)
  const [characterUrl, setCharacterUrl] = useState('/assets/samurai.webp')
  const [backgroundMode, setBackgroundMode] = useState<'color' | 'image'>('color')
  const [backgroundUrl, setBackgroundUrl] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#050505')
  const [redGlow, setRedGlow] = useState(0.13)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState<'character' | 'background' | null>(null)
  useEffect(() => {
    const savedTheme = (rows.find(row => row.key === 'global_theme')?.value || {}) as Record<string, string>
    const scene = (rows.find(row => row.key === 'hero_scene')?.value || {}) as Record<string, unknown>
    setTheme({ primary: savedTheme.primary || defaults.primary, secondary: savedTheme.secondary || defaults.secondary, background: savedTheme.background || defaults.background, text: savedTheme.text || defaults.text, muted: savedTheme.muted || defaults.muted })
    setCharacterUrl(String(scene.character_url || '/assets/samurai.webp'))
    const savedBackgroundUrl = String(scene.background_url || '')
    setBackgroundUrl(savedBackgroundUrl)
    setBackgroundMode(scene.background_mode === 'image' || savedBackgroundUrl ? 'image' : 'color')
    setBackgroundColor(String(scene.background_color || '#050505'))
    setRedGlow(Math.max(0, Math.min(0.6, Number(scene.red_glow ?? 0.13))))
  }, [rows])
  async function save() {
    setBusy(true); setError('')
    try {
      const oldScene = (rows.find(row => row.key === 'hero_scene')?.value || {}) as Record<string, unknown>
      await saveRow('site_settings', { key: 'global_theme', value: theme }, session.access_token, 'key')
      await saveRow('site_settings', {
        key: 'hero_scene',
        value: { ...oldScene, character_url: characterUrl, background_mode: backgroundMode, background_url: backgroundMode === 'image' ? backgroundUrl : '', background_color: backgroundColor, red_glow: redGlow },
      }, session.access_token, 'key')
      await reload()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save appearance') }
    finally { setBusy(false) }
  }
  async function upload(file: File | undefined, target: 'character' | 'background') {
    if (!file) return
    setUploading(target); setError('')
    try {
      const url = await uploadPublicAsset(file, session.access_token)
      if (target === 'character') setCharacterUrl(url)
      else { setBackgroundUrl(url); setBackgroundMode('image') }
    } catch (e) { setError(e instanceof Error ? e.message : 'Image upload failed') }
    finally { setUploading(null) }
  }
  const colours: { key: keyof typeof theme; label: string }[] = [{ key: 'primary', label: 'Primary accent' }, { key: 'secondary', label: 'Secondary accent' }, { key: 'background', label: 'Background' }, { key: 'text', label: 'Main text' }, { key: 'muted', label: 'Muted text' }]
  return <div className='appearance-editor'>
    <section className='appearance-card'><p className='admin-eyebrow'>GLOBAL DESIGN SYSTEM</p><h2>Website colours</h2><p>Choose the colours used across the public portfolio.</p>
      <div className='appearance-colours'>{colours.map(item => <label className='colour-field' key={item.key}>{item.label}<input type='color' value={theme[item.key]} onChange={e => setTheme(value => ({ ...value, [item.key]: e.target.value }))} /></label>)}</div>
      <div className='theme-preview' style={{ background: theme.background, color: theme.text, borderColor: theme.primary }}><strong style={{ color: theme.primary }}>LIVE PREVIEW</strong><h3>RAKIN KHAN</h3><span style={{ background: theme.primary }}>Explore My Work</span></div>
    </section>
    <section className='appearance-card'>
      <p className='admin-eyebrow'>HERO BACKGROUND</p><h2>Samurai / RAKIN KHAN background</h2>
      <p>Change the first screen background without changing the samurai character, title, 3D effects or animation.</p>
      <div className='background-mode-switch'>
        <button type='button' className={backgroundMode === 'color' ? 'selected' : ''} onClick={() => setBackgroundMode('color')}>SOLID COLOUR</button>
        <button type='button' className={backgroundMode === 'image' ? 'selected' : ''} onClick={() => setBackgroundMode('image')}>IMAGE BACKGROUND</button>
      </div>
      {backgroundMode === 'color' ? <label className='colour-field hero-bg-colour'>Hero background colour<input type='color' value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} /></label> : <>
        <label className='upload-character hero-bg-upload'>{uploading === 'background' ? 'UPLOADING BACKGROUND…' : 'UPLOAD BACKGROUND IMAGE'}<input type='file' accept={imageAccept} disabled={Boolean(uploading)} onChange={e => void upload(e.target.files?.[0], 'background')} /></label>
        <label className='character-url'>Background image URL<input value={backgroundUrl} onChange={e => setBackgroundUrl(e.target.value)} placeholder='Upload an image or paste an image URL' /></label>
        <button type='button' className='admin-secondary hero-bg-clear' onClick={() => { setBackgroundUrl(''); setBackgroundMode('color') }}>Remove image and use solid colour</button>
      </>}
      <label className='glow-control'>Red glow intensity <strong>{Math.round(redGlow * 100)}%</strong><input type='range' min='0' max='0.6' step='0.01' value={redGlow} onChange={e => setRedGlow(Number(e.target.value))} /></label>
      <div className='hero-background-preview' style={{ backgroundColor: backgroundMode === 'color' ? backgroundColor : '#050505', backgroundImage: backgroundMode === 'image' && backgroundUrl ? `linear-gradient(rgba(0,0,0,.3),rgba(0,0,0,.55)),url("${backgroundUrl}")` : undefined }}>
        <span>SAMURAI</span><strong>RAKIN KHAN</strong><small>HERO BACKGROUND PREVIEW</small>
      </div>
      <small>Supported formats: JPG, JPEG, PNG, WebP and AVIF. Maximum upload size: 12 MB.</small>
    </section>
    <section className='appearance-card'><p className='admin-eyebrow'>HERO CHARACTER</p><h2>Change character</h2><p>Upload a transparent PNG/WebP or use an image URL.</p>
      <div className='character-preview'><img src={characterUrl} alt='Current hero character' /></div>
      <label className='upload-character'>{uploading === 'character' ? 'UPLOADING…' : 'UPLOAD NEW CHARACTER'}<input type='file' accept={imageAccept} disabled={Boolean(uploading)} onChange={e => void upload(e.target.files?.[0], 'character')} /></label>
      <label className='character-url'>Image URL<input value={characterUrl} onChange={e => setCharacterUrl(e.target.value)} placeholder='https://example.com/character.webp' /></label>
      <small>Recommended: transparent PNG/WebP, centered, with a similar portrait aspect ratio.</small>
    </section>
    <button className='admin-primary appearance-save' disabled={busy || Boolean(uploading)} onClick={() => void save()}>{busy ? 'SAVING…' : 'SAVE WEBSITE APPEARANCE →'}</button>
  </div>
}
