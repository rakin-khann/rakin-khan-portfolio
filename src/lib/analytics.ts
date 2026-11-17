import { recordAnalyticsEvent } from './supabase'

const SESSION_KEY = 'rk_analytics_session'
function sessionId() {
  try {
    let value = sessionStorage.getItem(SESSION_KEY)
    if (!value) {
      value = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0
            return (c === 'x' ? r : (r & 3 | 8)).toString(16)
          })
      sessionStorage.setItem(SESSION_KEY, value)
    }
    return value
  } catch {
    return 'anonymous-session-' + Math.random().toString(36).slice(2, 20)
  }
}

export function trackEvent(eventName: string, target?: string) {
  const safeTarget = target ? target.slice(0, 160) : undefined
  void recordAnalyticsEvent({
    session_id: sessionId(),
    event_name: eventName,
    page_path: window.location.pathname.slice(0, 300) || '/',
    target: safeTarget,
    referrer_host: document.referrer ? (() => {
      try { return new URL(document.referrer).hostname.slice(0, 160) } catch { return null }
    })() : null,
  }).catch(() => {})
}

export function startAnalytics() {
  if (window.location.pathname.replace(/\/$/, '') === '/admin') return () => {}
  trackEvent('page_view')
  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target.closest('a,button,[role="button"]') : null
    if (!target) return
    const label = (target.getAttribute('aria-label') || target.textContent || target.getAttribute('href') || target.tagName).trim()
    trackEvent('click', label.replace(/\s+/g, ' ').slice(0, 160))
  }
  document.addEventListener('click', onClick, { passive: true })
  let engaged = false
  const markEngaged = () => {
    if (engaged) return
    engaged = true
    trackEvent('engagement', 'engaged-session')
  }
  const timer = window.setTimeout(markEngaged, 10000)
  const onScroll = () => { if (window.scrollY > 120) markEngaged() }
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    document.removeEventListener('click', onClick)
    window.removeEventListener('scroll', onScroll)
    window.clearTimeout(timer)
  }
}
