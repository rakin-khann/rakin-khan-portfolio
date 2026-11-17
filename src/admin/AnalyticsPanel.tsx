import { useEffect, useMemo, useState } from 'react'
import { selectAnalyticsEvents } from '../lib/supabase'

type EventRow = { id: number; session_id: string; event_name: string; page_path: string; target?: string; created_at: string }
const number = (value: number) => new Intl.NumberFormat().format(value)

export default function AnalyticsPanel({ token }: { token: string }) {
  const [events, setEvents] = useState<EventRow[]>([])
  const [period, setPeriod] = useState('7')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = async () => {
    setLoading(true); setError('')
    try { setEvents(await selectAnalyticsEvents(token, Number(period))) }
    catch (e) { setError(e instanceof Error ? e.message : 'Analytics could not be loaded') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [period, token])
  const metrics = useMemo(() => {
    const sessions = new Set(events.map(e => e.session_id))
    const pages = events.filter(e => e.event_name === 'page_view').length
    const clicks = events.filter(e => e.event_name === 'click').length
    const engaged = new Set(events.filter(e => e.event_name === 'engagement').map(e => e.session_id)).size
    const plays = events.filter(e => e.event_name === 'video_play').length
    const projects = events.filter(e => e.event_name === 'project_view').length
    return { visitors: sessions.size, pages, clicks, engagement: sessions.size ? Math.round(engaged / sessions.size * 100) : 0, plays, projects }
  }, [events])
  const daily = useMemo(() => {
    const map = new Map<string, number>()
    for (const event of events) if (event.event_name === 'page_view') {
      const day = new Date(event.created_at).toLocaleDateString()
      map.set(day, (map.get(day) || 0) + 1)
    }
    return [...map.entries()].slice(-7)
  }, [events])
  const max = Math.max(1, ...daily.map(([, value]) => value))
  return <div className="analytics-panel">
    <div className="analytics-toolbar"><div><p className="admin-eyebrow">LIVE SITE MEASUREMENTS</p><h2>Traffic overview</h2><small>Privacy-conscious first-party events from your portfolio website.</small></div><div className="analytics-actions"><select value={period} onChange={e => setPeriod(e.target.value)}><option value="1">Last 24 hours</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><button className="admin-secondary" onClick={() => void load()}>↻ Refresh</button></div></div>
    {error && <p className="admin-error">{error}</p>}
    <div className="analytics-grid">
      <Metric label="Unique visitors" value={number(metrics.visitors)} hint="Distinct anonymous sessions"/>
      <Metric label="Page views" value={number(metrics.pages)} hint="Page impressions"/>
      <Metric label="Clicks" value={number(metrics.clicks)} hint="Tracked link and button clicks"/>
      <Metric label="Engagement rate" value={metrics.engagement + '%'} hint="Sessions with an engagement event"/>
      <Metric label="Video plays" value={number(metrics.plays)} hint="Portfolio video starts"/>
      <Metric label="Project views" value={number(metrics.projects)} hint="Project interactions"/>
    </div>
    <section className="analytics-card"><div className="analytics-card-head"><h3>Page views by day</h3><span>{loading ? 'UPDATING…' : 'EVENT DATA'}</span></div>{daily.length ? <div className="analytics-bars">{daily.map(([day, value]) => <div className="analytics-bar-col" key={day}><strong>{value}</strong><div className="analytics-bar-track"><i style={{height: (value / max * 100) + '%'}} /></div><small>{day}</small></div>)}</div> : <p className="analytics-empty">{loading ? 'Loading analytics…' : 'No traffic events yet. Visit the public website to start collecting analytics.'}</p>}</section>
    <section className="analytics-card"><div className="analytics-card-head"><h3>Recent activity</h3><span>{number(events.length)} EVENTS</span></div><div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th>Event</th><th>Page</th><th>Target</th><th>Time</th></tr></thead><tbody>{events.slice(0, 30).map(event => <tr key={event.id}><td>{event.event_name.replace('_', ' ').toUpperCase()}</td><td>{event.page_path}</td><td>{event.target || '—'}</td><td>{new Date(event.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></section>
    <p className="analytics-footnote">This dashboard measures visits and interactions after tracking is deployed. It does not import historic traffic or Google Search impressions. Counts are based on anonymous browser sessions and may be affected by blocked storage or ad blockers.</p>
  </div>
}
function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <article className="analytics-metric"><small>{label}</small><strong>{value}</strong><span>{hint}</span></article>
}
