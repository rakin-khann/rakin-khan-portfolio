import { FormEvent, useEffect, useMemo, useState } from 'react'
import { getSession, getCurrentUser, isAdmin, signIn, signOut, selectRows, saveRow, deleteRow, uploadPublicAsset, type Session } from '../lib/supabase'
import './admin.css'
import AppearancePanel from './AppearancePanel'

type Field = { key: string; label: string; type?: 'text' | 'textarea' | 'url' | 'number' | 'image' | 'date' | 'boolean' | 'gallery'; hint?: string; required?: boolean }
type Section = { id: string; label: string; icon: string; key: string; readOnly?: boolean; fields?: Field[] }
const common: Field[] = [{ key: 'sort_order', label: 'Display order', type: 'number' }, { key: 'is_published', label: 'Show on website', type: 'boolean' }]
const SECTIONS: Section[] = [
  { id: 'profiles', label: 'Profile & About', icon: '◉', key: 'id', fields: [
    { key: 'name', label: 'Your name', required: true }, { key: 'headline', label: 'Professional title' }, { key: 'tagline', label: 'Hero tagline' },
    { key: 'bio', label: 'About description', type: 'textarea' }, { key: 'location', label: 'Location' }, { key: 'email', label: 'Email', type: 'text' },
    { key: 'phone', label: 'Phone / WhatsApp' }, { key: 'avatar_url', label: 'Profile image', type: 'image' }, { key: 'cv_url', label: 'CV / Resume URL', type: 'url' }, { key: 'is_published', label: 'Show on website', type: 'boolean' },
  ] },
  { id: 'projects', label: 'Portfolio projects', icon: '▧', key: 'id', fields: [
    { key: 'title', label: 'Project title', required: true }, { key: 'category', label: 'Category' }, { key: 'description', label: 'Project description', type: 'textarea' },
    { key: 'cover_image_url', label: 'Cover image', type: 'image' }, { key: 'gallery', label: 'Gallery image URLs (one per line)', type: 'gallery', hint: 'Optional: paste one image URL per line.' },
    { key: 'project_url', label: 'Project / Live URL', type: 'url' }, ...common,
  ] },
  { id: 'services', label: 'Services', icon: '✳', key: 'id', fields: [
    { key: 'title', label: 'Service title', required: true }, { key: 'short_description', label: 'Short description', type: 'textarea' },
    { key: 'description', label: 'Full description', type: 'textarea' }, { key: 'icon', label: 'Icon name', hint: 'Example: pen, camera, video, code' }, ...common,
  ] },
  { id: 'skills', label: 'Skills', icon: '◈', key: 'id', fields: [
    { key: 'name', label: 'Skill name', required: true }, { key: 'category', label: 'Category' }, { key: 'proficiency', label: 'Proficiency (%)', type: 'number' }, ...common,
  ] },
  { id: 'experiences', label: 'Experience', icon: '▤', key: 'id', fields: [
    { key: 'role', label: 'Job title / Role', required: true }, { key: 'company', label: 'Company', required: true }, { key: 'employment_type', label: 'Employment type' },
    { key: 'location', label: 'Location' }, { key: 'start_date', label: 'Start date', type: 'date' }, { key: 'end_date', label: 'End date', type: 'date' },
    { key: 'description', label: 'Description', type: 'textarea' }, ...common,
  ] },
  { id: 'education', label: 'Education', icon: '⌂', key: 'id', fields: [
    { key: 'institution', label: 'Institution', required: true }, { key: 'qualification', label: 'Qualification' }, { key: 'field_of_study', label: 'Field of study' },
    { key: 'start_date', label: 'Start date', type: 'date' }, { key: 'end_date', label: 'End date', type: 'date' }, { key: 'description', label: 'Description', type: 'textarea' }, ...common,
  ] },
  { id: 'social_links', label: 'Social links', icon: '◎', key: 'id', fields: [
    { key: 'platform', label: 'Platform name', required: true }, { key: 'url', label: 'Profile URL', type: 'url', required: true }, { key: 'icon', label: 'Icon name', hint: 'Example: instagram, facebook, youtube, behance' }, ...common,
  ] },
  { id: 'testimonials', label: 'Testimonials', icon: '❝', key: 'id', fields: [
    { key: 'client_name', label: 'Client name', required: true }, { key: 'client_role', label: 'Client role' }, { key: 'company', label: 'Company' },
    { key: 'quote', label: 'Client feedback', type: 'textarea', required: true }, { key: 'avatar_url', label: 'Client photo', type: 'image' }, ...common,
  ] },
  { id: 'contact_messages', label: 'Messages', icon: '✉', key: 'id', readOnly: true },
  { id: 'site_settings', label: 'Appearance & character', icon: '⚙', key: 'key' },
]
const EXAMPLES: Record<string, Record<string, unknown>> = {
  profiles: { name: 'Rakin Khan', headline: 'Graphic Designer & Digital Creative', tagline: '', bio: '', location: 'Dhaka, Bangladesh', email: 'rakinfiverr@gmail.com', phone: '', avatar_url: '', cv_url: '', is_published: true },
  projects: { title: '', slug: '', description: '', category: '', cover_image_url: '', gallery: [], project_url: '', sort_order: 0, is_published: true },
  services: { title: '', slug: '', short_description: '', description: '', icon: 'pen', sort_order: 0, is_published: true },
  skills: { name: '', category: 'Design', proficiency: 80, sort_order: 0, is_published: true },
  experiences: { company: '', role: '', employment_type: '', location: '', start_date: '', end_date: '', description: '', sort_order: 0, is_published: true },
  education: { institution: '', qualification: '', field_of_study: '', start_date: '', end_date: '', description: '', sort_order: 0, is_published: true },
  social_links: { platform: 'Instagram', url: '', icon: 'instagram', sort_order: 0, is_published: true },
  testimonials: { client_name: '', client_role: '', company: '', quote: '', avatar_url: '', sort_order: 0, is_published: true },
}
const titleOf = (row: Record<string, unknown>) => String(row.title || row.name || row.platform || row.company || row.client_name || row.institution || row.role || row.key || row.subject || 'Record')

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(getSession())
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [email, setEmail] = useState('rakinfiverr@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [section, setSection] = useState('profiles')
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [draft, setDraft] = useState<Record<string, unknown>>({})
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const active = SECTIONS.find(item => item.id === section) || SECTIONS[0]

  async function verify(current: Session) {
    try { const user = await getCurrentUser(current.access_token); const admin = await isAdmin(user.id, current.access_token); setAllowed(admin); if (!admin) setError('এই অ্যাকাউন্টটি Admin হিসেবে অনুমোদিত নয়।') }
    catch { signOut(); setSession(null); setAllowed(false) }
    finally { setReady(true) }
  }
  useEffect(() => { if (session) void verify(session); else setReady(true) }, [])
  async function loadRows() {
    if (!session || !allowed) return
    setLoading(true); setError('')
    try { setRows(await selectRows(section, session.access_token)) }
    catch (e) { setError(e instanceof Error ? e.message : 'ডেটা লোড করা যায়নি') }
    finally { setLoading(false) }
  }
  useEffect(() => { void loadRows() }, [section, allowed, session])
  const filtered = useMemo(() => rows.filter(row => JSON.stringify(row).toLowerCase().includes(query.toLowerCase())), [rows, query])
  async function handleLogin(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('')
    try { const next = await signIn(email.trim(), password); setSession(next); const user = await getCurrentUser(next.access_token); const admin = await isAdmin(user.id, next.access_token); if (!admin) { signOut(); setSession(null); throw new Error('এই ইমেইলটি Admin তালিকায় নেই।') }; setAllowed(true) }
    catch (e) { setError(e instanceof Error ? e.message : 'Login failed') }
    finally { setBusy(false) }
  }
  function openEditor(row?: Record<string, unknown>) {
    const value = row ? { ...row } : { ...(EXAMPLES[section] || {}) }
    if (Array.isArray(value.gallery)) value.gallery = (value.gallery as string[]).join('\n')
    setEditing(row || null); setDraft(value); setError(''); setNotice('')
  }
  function update(key: string, value: unknown) { setDraft(current => ({ ...current, [key]: value })) }
  async function uploadField(key: string, file?: File) {
    if (!file || !session) return
    setUploading(key); setError('')
    try { update(key, await uploadPublicAsset(file, session.access_token)); setNotice('ছবি আপলোড হয়েছে। Save Changes চাপলে ওয়েবসাইটে প্রকাশিত হবে।') }
    catch (e) { setError(e instanceof Error ? e.message : 'Image upload failed') }
    finally { setUploading(null) }
  }
  async function handleSave(event: FormEvent) {
    event.preventDefault(); if (!session) return
    setBusy(true); setError(''); setNotice('')
    try {
      const value = { ...draft }
      if (section === 'projects' || section === 'services') {
        const title = String(value.title || '')
        value.slug = String(value.slug || title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item')
      }
      if (typeof value.gallery === 'string') value.gallery = value.gallery.split('\n').map((item: string) => item.trim()).filter(Boolean)
      if (['skills'].includes(section) && value.proficiency !== '') value.proficiency = Number(value.proficiency)
      if (value.sort_order !== undefined && value.sort_order !== '') value.sort_order = Number(value.sort_order)
      await saveRow(section, value, session.access_token, active.key)
      setEditing(null); setDraft({}); setNotice('সফলভাবে Save হয়েছে। Live website-এ পরিবর্তন দেখা যাবে।'); await loadRows()
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed') }
    finally { setBusy(false) }
  }
  async function handleDelete(row: Record<string, unknown>) {
    if (!session || !window.confirm('এই রেকর্ডটি স্থায়ীভাবে মুছে ফেলতে চাও?')) return
    setBusy(true); setError('')
    try { await deleteRow(section, row, session.access_token, active.key); await loadRows(); setNotice('রেকর্ডটি মুছে ফেলা হয়েছে।') }
    catch (e) { setError(e instanceof Error ? e.message : 'Delete failed') }
    finally { setBusy(false) }
  }
  if (!ready) return <div className="admin-loading">ADMIN / VERIFYING ACCESS…</div>
  if (!session || !allowed) return <main className="admin-login-wrap"><form className="admin-login" onSubmit={handleLogin}>
    <a href="/" className="admin-back">← BACK TO WEBSITE</a><div className="admin-mark">RK<span> / ADMIN</span></div><p className="admin-eyebrow">SECURE CONTROL ROOM</p><h1>Welcome <em>Back.</em></h1><p className="admin-muted">Sign in with your authorized administrator account.</p>
    <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></label>
    {error && <p className="admin-error">{error}</p>}<button className="admin-primary" disabled={busy}>{busy ? 'VERIFYING…' : 'SIGN IN →'}</button>
  </form></main>
  return <div className="admin-shell">
    <aside className="admin-sidebar"><a href="/" className="admin-brand">RK<span> / CONTROL</span></a><p className="admin-side-label">WORKSPACE</p>
      <nav>{SECTIONS.map(item => <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => { setSection(item.id); setEditing(null); setDraft({}); setNotice('') }}><span>{item.icon}</span>{item.label}</button>)}</nav>
      <div className="admin-side-bottom"><small>SIGNED IN AS</small><strong>{session.user.email}</strong><button onClick={() => { signOut(); setSession(null); setAllowed(false) }}>↗ Sign out</button><a href="/">← View website</a></div>
    </aside>
    <main className="admin-main"><header className="admin-topbar"><div><p className="admin-eyebrow">RAKIN KHAN / ADMINISTRATION</p><h1>{active.label}</h1></div><span className="admin-status">● SECURE SESSION</span></header>
      <section className="admin-content">
        {section !== 'site_settings' && <div className="admin-toolbar"><input aria-label="Search records" placeholder="Search records…" value={query} onChange={e => setQuery(e.target.value)} /><div><button className="admin-secondary" onClick={() => void loadRows()}>↻ Refresh</button>{!active.readOnly && <button className="admin-primary" onClick={() => openEditor()}>＋ Add new</button>}</div></div>}
        {error && <p className="admin-error admin-notice">{error}</p>}{notice && <p className="admin-success admin-notice">{notice}</p>}
        {section === 'site_settings' ? <AppearancePanel session={session} rows={rows} reload={loadRows} setError={setError} /> : editing !== null || Object.keys(draft).length > 0 ? (
          <form className="admin-editor visual-editor" onSubmit={handleSave}><div className="admin-editor-head"><div><p className="admin-eyebrow">CONTENT EDITOR</p><h2>{editing ? 'Edit content' : 'Add new content'}</h2></div><button type="button" onClick={() => { setEditing(null); setDraft({}) }}>✕ Close</button></div>
            <p className="editor-help">নিচের ফিল্ডগুলো পূরণ করো। কোনো কোড লিখতে হবে না। Save করলে কনটেন্ট ওয়েবসাইটে দেখাবে।</p>
            <div className="editor-fields">{(active.fields || []).map(field => <label className={field.type === 'textarea' || field.type === 'gallery' ? 'editor-field full' : 'editor-field'} key={field.key}>
              <span>{field.label}{field.required && <b> *</b>}</span>
              {field.type === 'textarea' || field.type === 'gallery' ? <textarea required={field.required} rows={field.type === 'gallery' ? 4 : 5} value={String(draft[field.key] ?? '')} onChange={e => update(field.key, e.target.value)} placeholder={field.hint || 'এখানে লিখো…'} /> :
              field.type === 'boolean' ? <span className="editor-toggle"><input type="checkbox" checked={Boolean(draft[field.key])} onChange={e => update(field.key, e.target.checked)} /> <small>{draft[field.key] ? 'Published / Visible' : 'Hidden / Draft'}</small></span> :
              field.type === 'image' ? <><input type="url" value={String(draft[field.key] || '')} onChange={e => update(field.key, e.target.value)} placeholder="Image URL অথবা নিচে Upload করো" /><input className="editor-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading === field.key} onChange={e => void uploadField(field.key, e.target.files?.[0])} /><small>{uploading === field.key ? 'Uploading image…' : field.hint || 'ছবি Upload করো অথবা URL paste করো।'}</small>{Boolean(draft[field.key]) && <img className="editor-image-preview" src={String(draft[field.key])} alt="Upload preview" />}</> :
              <input type={field.type || 'text'} required={field.required} value={String(draft[field.key] ?? '')} onChange={e => update(field.key, field.type === 'number' ? e.target.value : e.target.value)} placeholder={field.hint || 'এখানে লিখো…'} />}
              {field.hint && field.type !== 'gallery' && field.type !== 'image' && <small>{field.hint}</small>}
            </label>)}</div>
            <div className="editor-actions"><button type="button" className="admin-secondary" onClick={() => { setEditing(null); setDraft({}) }}>Cancel</button><button className="admin-primary" disabled={busy || Boolean(uploading)}>{busy ? 'SAVING…' : 'SAVE CHANGES →'}</button></div>
          </form>
        ) : loading ? <div className="admin-empty">LOADING RECORDS…</div> : filtered.length === 0 ? <div className="admin-empty"><span>◇</span><h2>No records found</h2><p>Add a new record or change your search.</p></div> :
          <div className="admin-records">{filtered.map((row, index) => <article className="admin-record" key={String(row[active.key] ?? index)}><div><strong>{titleOf(row)}</strong><small>{String(row.category || row.email || row.role || row.created_at || row.key || '')}</small><p>{String(row.short_description || row.description || row.quote || row.message || row.headline || '')}</p><span className={row.is_published === true ? 'admin-pill published' : 'admin-pill'}>{row.is_published === true ? 'PUBLISHED' : active.readOnly ? 'MESSAGE' : 'DRAFT / PRIVATE'}</span></div><div className="admin-record-actions"><button onClick={() => openEditor(row)}>Edit</button>{!active.readOnly && <button className="danger" onClick={() => void handleDelete(row)}>Delete</button>}</div></article>)}</div>}
      </section>
    </main>
  </div>
}
