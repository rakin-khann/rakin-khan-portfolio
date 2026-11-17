const SUPABASE_URL = 'https://ycfisgnmholndarlxvhv.supabase.co'
const SUPABASE_KEY = 'sb_publishable_VWbu25WPHH-IDdlAD8YUVA_HymuCAcF'

export type Session = { access_token: string; refresh_token?: string; user: { id: string; email?: string } }
const SESSION_KEY = 'rakin_admin_session'

export function getSession(): Session | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as Session | null }
  catch { return null }
}
function saveSession(session: Session | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  else localStorage.removeItem(SESSION_KEY)
}
async function request(path: string, init: RequestInit = {}, token?: string) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  })
  const body = await response.text()
  const data = body ? JSON.parse(body) : null
  if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || data?.details || 'Request failed')
  return data
}
export async function signIn(email: string, password: string): Promise<Session> {
  const session = await request('/auth/v1/token?grant_type=password', {
    method: 'POST', body: JSON.stringify({ email, password }),
  }) as Session
  saveSession(session)
  return session
}
export function signOut() { saveSession(null) }
export async function getCurrentUser(token: string) {
  return request('/auth/v1/user', {}, token) as Promise<{ id: string; email?: string }>
}
export async function isAdmin(userId: string, token: string) {
  const rows = await request(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(userId)}&select=user_id`, {}, token) as unknown[]
  return rows.length > 0
}
export async function selectRows(table: string, token: string) {
  return request(`/rest/v1/${table}?select=*&limit=200`, {}, token) as Promise<Record<string, unknown>[]>
}
export async function saveRow(table: string, row: Record<string, unknown>, token: string, primaryKey: string) {
  const key = row[primaryKey]
  if (key) {
    const result = await request(`/rest/v1/${table}?${primaryKey}=eq.${encodeURIComponent(String(key))}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row),
    }, token) as unknown[]
    if (result.length) return result[0]
  }
  const result = await request(`/rest/v1/${table}`, {
    method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row),
  }, token) as unknown[]
  return result[0]
}
export async function deleteRow(table: string, row: Record<string, unknown>, token: string, primaryKey: string) {
  const key = row[primaryKey]
  if (!key) throw new Error('This record has no primary key')
  await request(`/rest/v1/${table}?${primaryKey}=eq.${encodeURIComponent(String(key))}`, { method: 'DELETE' }, token)
}
export async function selectPublicRows(table: string) {
  return request(`/rest/v1/${table}?select=*&limit=100`) as Promise<Record<string, unknown>[]>
}


export async function uploadPublicAsset(file: File, token: string): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  if (!allowedTypes.includes(file.type)) throw new Error('Supported image formats: JPG, JPEG, PNG, WebP and AVIF.')
  if (file.size > 12 * 1024 * 1024) throw new Error('Image must be smaller than 12 MB.')
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const path = 'uploads/' + Date.now() + '-' + safeName
  const response = await fetch(SUPABASE_URL + '/storage/v1/object/portfolio-assets/' + path, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + token, 'Content-Type': file.type, 'x-upsert': 'true' },
    body: file,
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.message || result.error || 'Image upload failed')
  return SUPABASE_URL + '/storage/v1/object/public/portfolio-assets/' + path
}

export async function uploadPortfolioVideo(file: File, token: string, quality: string): Promise<string> {
  const allowed = ['video/mp4', 'video/webm']
  if (!allowed.includes(file.type)) throw new Error('Video format must be MP4 or WebM.')
  if (file.size > 500 * 1024 * 1024) throw new Error('Each video version must be 500 MB or smaller.')
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const path = 'videos/' + Date.now() + '-' + quality + 'p-' + safeName
  const response = await fetch(SUPABASE_URL + '/storage/v1/object/portfolio-media/' + path, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + token, 'Content-Type': file.type, 'x-upsert': 'true' },
    body: file,
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.message || result.error || 'Video upload failed')
  return SUPABASE_URL + '/storage/v1/object/public/portfolio-media/' + path
}

export async function selectPortfolioMedia(token: string) {
  return request('/rest/v1/portfolio_media?select=*&order=sort_order.asc,created_at.desc&limit=200', {}, token) as Promise<Record<string, unknown>[]>
}
export async function savePortfolioMedia(row: Record<string, unknown>, token: string) {
  const id = row.id
  const result = await request(id ? '/rest/v1/portfolio_media?id=eq.' + encodeURIComponent(String(id)) : '/rest/v1/portfolio_media', {
    method: id ? 'PATCH' : 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  }, token) as unknown[]
  if (!result.length) throw new Error('Could not save video project. Check admin permissions.')
  return result[0]
}
export async function deletePortfolioMedia(id: string, token: string) {
  await request('/rest/v1/portfolio_media?id=eq.' + encodeURIComponent(id), { method: 'DELETE' }, token)
}
export async function recordAnalyticsEvent(event: {
  session_id: string; event_name: string; page_path: string; target?: string | null; referrer_host?: string | null
}) {
  const response = await fetch(SUPABASE_URL + '/rest/v1/site_analytics_events', {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(event),
  })
  if (!response.ok) throw new Error('Analytics event could not be recorded')
}
export async function selectAnalyticsEvents(token: string, days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  return request('/rest/v1/site_analytics_events?select=id,session_id,event_name,page_path,target,created_at&created_at=gte.' + encodeURIComponent(since) + '&order=created_at.desc&limit=5000', {}, token) as Promise<Array<{id:number;session_id:string;event_name:string;page_path:string;target?:string;created_at:string}>>
}
