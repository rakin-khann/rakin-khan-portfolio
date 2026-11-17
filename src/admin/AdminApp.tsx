import { FormEvent, useEffect, useMemo, useState } from 'react'
import { getSession, getCurrentUser, isAdmin, signIn, signOut, selectRows, saveRow, deleteRow, type Session } from '../lib/supabase'
import './admin.css'

const SECTIONS: { id: string; label: string; icon: string; key: string; readOnly?: boolean }[] = [
  { id: 'profiles', label: 'Profile', icon: '◉', key: 'id' },
  { id: 'projects', label: 'Portfolio projects', icon: '▧', key: 'id' },
  { id: 'services', label: 'Services', icon: '✳', key: 'id' },
  { id: 'skills', label: 'Skills', icon: '◈', key: 'id' },
  { id: 'experiences', label: 'Experience', icon: '▤', key: 'id' },
  { id: 'education', label: 'Education', icon: '⌂', key: 'id' },
  { id: 'social_links', label: 'Social links', icon: '◎', key: 'id' },
  { id: 'testimonials', label: 'Testimonials', icon: '❝', key: 'id' },
  { id: 'contact_messages', label: 'Messages', icon: '✉', key: 'id', readOnly: true },
  { id: 'site_settings', label: 'Site settings', icon: '⚙', key: 'key' },
]

const EXAMPLES: Record<string, Record<string, unknown>> = {
  profiles: { name: 'Rakin Khan', headline: '', bio: '', location: 'Dhaka, Bangladesh', email: '', is_published: true },
  projects: { title: 'New project', slug: 'new-project', description: '', category: '', cover_image_url: '', gallery: [], project_url: '', sort_order: 0, is_published: false },
  services: { title: 'New service', slug: 'new-service', short_description: '', description: '', icon: 'pen', sort_order: 0, is_published: true },
  skills: { name: 'New skill', category: 'Design', proficiency: 80, sort_order: 0, is_published: true },
  experiences: { company: '', role: '', employment_type: '', location: '', description: '', sort_order: 0, is_published: true },
  education: { institution: '', qualification: '', field_of_study: '', description: '', sort_order: 0, is_published: true },
  social_links: { platform: 'Instagram', url: 'https://instagram.com/', icon: 'instagram', sort_order: 0, is_published: true },
  testimonials: { client_name: '', client_role: '', company: '', quote: '', avatar_url: '', sort_order: 0, is_published: false },
  site_settings: { key: 'hero_scene', value: { model_type: 'orb', model_url: null, color: '#9b7bff', scale: 1, rotation: [0, 0, 0], position: [0, 0, 0], auto_rotate: true, auto_rotate_speed: 0.35, environment: 'dhaka-inspired' } },
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(getSession())
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [email, setEmail] = useState('rakinfiverr@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [section, setSection] = useState<string>('profiles')
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [editor, setEditor] = useState('')
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [query, setQuery] = useState('')
  const active = SECTIONS.find(item => item.id === section) || SECTIONS[0]

  async function verify(current: Session) {
    try {
      const user = await getCurrentUser(current.access_token)
      const admin = await isAdmin(user.id, current.access_token)
      setAllowed(admin)
      if (!admin) setError('এই অ্যাকাউন্টটি Admin হিসেবে অনুমোদিত নয়।')
    } catch {
      signOut(); setSession(null); setAllowed(false)
    } finally { setReady(true) }
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
    try {
      const next = await signIn(email.trim(), password)
      setSession(next)
      const user = await getCurrentUser(next.access_token)
      const admin = await isAdmin(user.id, next.access_token)
      if (!admin) { signOut(); setSession(null); throw new Error('এই ইমেইলটি Admin তালিকায় নেই।') }
      setAllowed(true)
    } catch (e) { setError(e instanceof Error ? e.message : 'Login failed') }
    finally { setBusy(false) }
  }
  function openEditor(row?: Record<string, unknown>) {
    const value = row || EXAMPLES[section] || {}
    setEditing(row || null); setEditor(JSON.stringify(value, null, 2)); setError('')
  }
  async function handleSave(event: FormEvent) {
    event.preventDefault()
    if (!session) return
    setBusy(true); setError('')
    try {
      const value = JSON.parse(editor) as Record<string, unknown>
      await saveRow(section, value, session.access_token, active.key)
      setEditing(null); setEditor(''); await loadRows()
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed') }
    finally { setBusy(false) }
  }
  async function handleDelete(row: Record<string, unknown>) {
    if (!session || !window.confirm('এই রেকর্ডটি স্থায়ীভাবে মুছে ফেলতে চাও?')) return
    setBusy(true)
    try { await deleteRow(section, row, session.access_token, active.key); await loadRows() }
    catch (e) { setError(e instanceof Error ? e.message : 'Delete failed') }
    finally { setBusy(false) }
  }
  if (!ready) return <div className="admin-loading">ADMIN / VERIFYING ACCESS…</div>
  if (!session || !allowed) return (
    <main className="admin-login-wrap">
      <form className="admin-login" onSubmit={handleLogin}>
        <a href="/" className="admin-back">← BACK TO WEBSITE</a>
        <div className="admin-mark">RK<span> / ADMIN</span></div>
        <p className="admin-eyebrow">SECURE CONTROL ROOM</p>
        <h1>Welcome <em>Back.</em></h1>
        <p className="admin-muted">Sign in with your authorized administrator account.</p>
        <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" /></label>
        {error && <p className="admin-error">{error}</p>}
        <button className="admin-primary" disabled={busy}>{busy ? 'VERIFYING…' : 'SIGN IN →'}</button>
      </form>
    </main>
  )
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand">RK<span> / CONTROL</span></a>
        <p className="admin-side-label">WORKSPACE</p>
        <nav>{SECTIONS.map(item => <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => { setSection(item.id); setEditing(null) }}><span>{item.icon}</span>{item.label}</button>)}</nav>
        <div className="admin-side-bottom"><small>SIGNED IN AS</small><strong>{session.user.email}</strong><button onClick={() => { signOut(); setSession(null); setAllowed(false) }}>↗ Sign out</button><a href="/">← View website</a></div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><p className="admin-eyebrow">RAKIN KHAN / ADMINISTRATION</p><h1>{active.label}</h1></div><span className="admin-status">● SECURE SESSION</span></header>
        <section className="admin-content">
          <div className="admin-toolbar"><input aria-label="Search records" placeholder="Search records…" value={query} onChange={e => setQuery(e.target.value)} /><div><button className="admin-secondary" onClick={() => void loadRows()}>↻ Refresh</button>{!active.readOnly && <button className="admin-primary" onClick={() => openEditor()}>＋ Add new</button>}</div></div>
          {error && <p className="admin-error admin-notice">{error}</p>}
          {editing !== null || editor ? (
            <form className="admin-editor" onSubmit={handleSave}><div className="admin-editor-head"><h2>{editing ? 'Edit record' : 'Create record'}</h2><button type="button" onClick={() => { setEditing(null); setEditor('') }}>✕ Close</button></div><p>JSON record editor — change the values, then save.</p><textarea spellCheck={false} value={editor} onChange={e => setEditor(e.target.value)} rows={18} /><button className="admin-primary" disabled={busy}>{busy ? 'SAVING…' : 'SAVE CHANGES →'}</button></form>
          ) : loading ? <div className="admin-empty">LOADING RECORDS…</div> : filtered.length === 0 ? <div className="admin-empty"><span>◇</span><h2>No records found</h2><p>Add a new record or change your search.</p></div> : (
            <div className="admin-records">{filtered.map((row, index) => <article className="admin-record" key={String(row[active.key] ?? index)}><div><strong>{String(row.title || row.name || row.platform || row.company || row.client_name || row.key || row.subject || 'Record')}</strong><small>{String(row.category || row.email || row.role || row.created_at || row.key || '')}</small><p>{String(row.short_description || row.description || row.quote || row.message || row.headline || '')}</p><span className={row.is_published === true ? 'admin-pill published' : 'admin-pill'}>{row.is_published === true ? 'PUBLISHED' : active.readOnly ? 'MESSAGE' : 'DRAFT / PRIVATE'}</span></div><div className="admin-record-actions"><button onClick={() => openEditor(row)}>Edit</button>{!active.readOnly && <button className="danger" onClick={() => void handleDelete(row)}>Delete</button>}</div></article>)}</div>
          )}
        </section>
      </main>
    </div>
  )
}
