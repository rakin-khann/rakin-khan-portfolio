import { useEffect, useState } from 'react'
import { saveRow, uploadPublicAsset, type Session } from '../lib/supabase'

type Props = { session: Session; rows: Record<string, unknown>[]; reload: () => Promise<void>; setError: (value: string) => void }
const defaults = { primary: '#ff101a', secondary: '#850000', background: '#050505', text: '#ffffff' }

export default function AppearancePanel({ session, rows, reload, setError }: Props) {
  const [theme, setTheme] = useState(defaults)
  const [characterUrl, setCharacterUrl] = useState('/assets/samurai.webp')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  useEffect(() => {
    const savedTheme = (rows.find(row => row.key === 'global_theme')?.value || {}) as Record<string, string>
    const scene = (rows.find(row => row.key === 'hero_scene')?.value || {}) as Record<string, unknown>
    setTheme({ primary: savedTheme.primary || defaults.primary, secondary: savedTheme.secondary || defaults.secondary, background: savedTheme.background || defaults.background, text: savedTheme.text || defaults.text })
    setCharacterUrl(String(scene.character_url || '/assets/samurai.webp'))
  }, [rows])
  async function save() {
    setBusy(true); setError('')
    try {
      const oldScene = (rows.find(row => row.key === 'hero_scene')?.value || {}) as Record<string, unknown>
      await saveRow('site_settings', { key: 'global_theme', value: theme }, session.access_token, 'key')
      await saveRow('site_settings', { key: 'hero_scene', value: { ...oldScene, character_url: characterUrl } }, session.access_token, 'key')
      await reload()
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save appearance') }
    finally { setBusy(false) }
  }
  async function upload(file?: File) {
    if (!file) return
    setUploading(true); setError('')
    try { setCharacterUrl(await uploadPublicAsset(file, session.access_token)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Image upload failed') }
    finally { setUploading(false) }
  }
  const colours: { key: keyof typeof theme; label: string }[] = [{ key: 'primary', label: 'Primary accent' }, { key: 'secondary', label: 'Secondary accent' }, { key: 'background', label: 'Background' }, { key: 'text', label: 'Main text' }]
  return <div className='appearance-editor'>
    <section className='appearance-card'><p className='admin-eyebrow'>GLOBAL DESIGN SYSTEM</p><h2>Website colours</h2><p>Choose the colours used across the public portfolio.</p>
      <div className='appearance-colours'>{colours.map(item => <label className='colour-field' key={item.key}>{item.label}<input type='color' value={theme[item.key]} onChange={e => setTheme(value => ({ ...value, [item.key]: e.target.value }))} /></label>)}</div>
      <div className='theme-preview' style={{ background: theme.background, color: theme.text, borderColor: theme.primary }}><strong style={{ color: theme.primary }}>LIVE PREVIEW</strong><h3>RAKIN KHAN</h3><span style={{ background: theme.primary }}>Explore My Work</span></div>
    </section>
    <section className='appearance-card'><p className='admin-eyebrow'>HERO CHARACTER</p><h2>Change character</h2><p>Upload a transparent PNG/WebP or use an image URL.</p>
      <div className='character-preview'><img src={characterUrl} alt='Current hero character' /></div>
      <label className='upload-character'>{uploading ? 'UPLOADING…' : 'UPLOAD NEW CHARACTER'}<input type='file' accept='image/png,image/webp,image/jpeg' disabled={uploading} onChange={e => void upload(e.target.files?.[0])} /></label>
      <label className='character-url'>Image URL<input value={characterUrl} onChange={e => setCharacterUrl(e.target.value)} placeholder='https://example.com/character.webp' /></label>
      <small>Recommended: transparent PNG/WebP, centered, with a similar portrait aspect ratio.</small>
    </section>
    <button className='admin-primary appearance-save' disabled={busy || uploading} onClick={() => void save()}>{busy ? 'SAVING…' : 'SAVE WEBSITE APPEARANCE →'}</button>
  </div>
}