import { useEffect, useMemo, useState } from 'react'
import { selectAppointmentRequests, updateAppointmentRequest } from '../lib/supabase'
import './appointment-bookings.css'

type RequestRow = Record<string, any>
const statuses = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]
const dateLabel = (value?: string) => value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const field = (label: string, value: unknown) => ({ label, value: value ? String(value) : '—' })

export default function AppointmentPanel({ token }: { token: string }) {
  const [items, setItems] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<RequestRow | null>(null)
  const [saving, setSaving] = useState(false)

  async function refresh() {
    setLoading(true); setError('')
    try { setItems(await selectAppointmentRequests(token)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load bookings') }
    finally { setLoading(false) }
  }
  useEffect(() => { void refresh() }, [token])

  const counts = useMemo(() => statuses.reduce((out, status) => {
    out[status.value] = items.filter(item => item.status === status.value).length
    return out
  }, { all: items.length } as Record<string, number>), [items])
  const filtered = useMemo(() => items.filter(item => {
    const matchesStatus = filter === 'all' || item.status === filter
    const haystack = [item.full_name, item.email, item.phone, item.whatsapp, item.company_name, item.service_type, item.project_type, item.country].join(' ').toLowerCase()
    return matchesStatus && haystack.includes(search.toLowerCase())
  }), [items, filter, search])

  async function changeStatus(row: RequestRow, status: string) {
    setSaving(true); setError('')
    try {
      const updated = await updateAppointmentRequest(String(row.id), status, token)
      setItems(current => current.map(item => item.id === row.id ? updated : item))
      setSelected(updated)
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update booking') }
    finally { setSaving(false) }
  }
  function exportCsv() {
    const columns = ['created_at','full_name','email','phone','whatsapp','company_name','country','office_address','residence_location','service_type','project_type','project_description','budget_range','preferred_date','preferred_time','meeting_type','contact_method','reference_url','status']
    const quote = (value: unknown) => '"' + String(value ?? '').replace(/"/g, '""') + '"'
    const csv = [columns.join(','), ...filtered.map(row => columns.map(key => quote(row[key])).join(','))].join('\r\n')
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'appointment-bookings.csv'; anchor.click(); URL.revokeObjectURL(url)
  }

  return <div className="booking-dashboard">
    <div className="booking-heading"><div><p className="admin-eyebrow">CLIENT INQUIRIES / PRIVATE DATABASE</p><h2>Appointment Bookings</h2><p>Website থেকে জমা হওয়া সব appointment request এখানে সংরক্ষিত থাকবে।</p></div><div className="booking-tools"><button className="admin-secondary" onClick={() => void refresh()}>↻ Refresh</button><button className="admin-primary" onClick={exportCsv} disabled={!filtered.length}>↓ Export CSV</button></div></div>
    <div className="booking-stats"><button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}><small>ALL BOOKINGS</small><strong>{counts.all}</strong></button>{statuses.map(status => <button key={status.value} className={filter === status.value ? 'selected' : ''} onClick={() => setFilter(status.value)}><small>{status.label.toUpperCase()}</small><strong>{counts[status.value] || 0}</strong></button>)}</div>
    <div className="booking-list-toolbar"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, phone, service…" /><span>{filtered.length} booking{filtered.length === 1 ? '' : 's'}</span></div>
    {error && <p className="admin-error admin-notice">{error}</p>}
    {loading ? <div className="admin-empty">LOADING APPOINTMENTS…</div> : !filtered.length ? <div className="admin-empty"><span>◇</span><h2>No bookings yet</h2><p>নতুন appointment request এলে এখানে দেখা যাবে।</p></div> :
      <div className="booking-table-wrap"><table className="booking-table"><thead><tr><th>CLIENT</th><th>SERVICE / PROJECT</th><th>SUBMITTED</th><th>STATUS</th><th></th></tr></thead><tbody>{filtered.map(row => <tr key={row.id}><td><strong>{row.full_name}</strong><small>{row.email}</small><small>{row.phone}</small></td><td><strong>{row.service_type}</strong><small>{row.project_type || row.company_name || '—'}</small></td><td>{dateLabel(row.created_at)}</td><td><span className={'booking-status status-' + row.status}>{row.status}</span></td><td><button className="booking-view" onClick={() => setSelected(row)}>View details →</button></td></tr>)}</tbody></table></div>}
    {selected && <div className="booking-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null) }}><section className="booking-detail" role="dialog" aria-modal="true" aria-label="Appointment details">
      <div className="booking-detail-head"><div><p className="admin-eyebrow">BOOKING DETAILS</p><h2>{selected.full_name}</h2><small>Submitted {dateLabel(selected.created_at)}</small></div><button onClick={() => setSelected(null)}>✕</button></div>
      <label className="booking-status-control">Booking status<select disabled={saving} value={selected.status} onChange={e => void changeStatus(selected, e.target.value)}>{statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label>
      <div className="booking-detail-grid">{[
        field('Email',selected.email),field('Phone',selected.phone),field('WhatsApp',selected.whatsapp),field('Company',selected.company_name),
        field('Country',selected.country),field('Residence location',selected.residence_location),field('Office address',selected.office_address),field('Service',selected.service_type),
        field('Project type',selected.project_type),field('Budget',selected.budget_range),field('Preferred date',selected.preferred_date),field('Preferred time',selected.preferred_time),
        field('Meeting type',selected.meeting_type),field('Contact preference',selected.contact_method),field('Reference URL',selected.reference_url)
      ].map(item => <div key={item.label}><small>{item.label}</small><p>{item.value}</p></div>)}</div>
      <div className="booking-description"><small>PROJECT DESCRIPTION</small><p>{selected.project_description || '—'}</p></div>
      <div className="booking-detail-actions"><a href={'mailto:' + encodeURIComponent(selected.email || '')}>Email client ↗</a><a href={'tel:' + encodeURIComponent(selected.phone || '')}>Call client ↗</a><button className="admin-secondary" onClick={() => setSelected(null)}>Close</button></div>
    </section></div>}
  </div>
}
