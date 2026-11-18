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
let refreshInFlight: Promise<Session> | null = null

function tokenExpiresSoon(token: string) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return false
    const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number }
    return typeof claims.exp === 'number' && claims.exp * 1000 <= Date.now() + 60_000
  } catch {
    return false
  }
}

async function refreshSession(): Promise<Session> {
  if (refreshInFlight) return refreshInFlight
  refreshInFlight = (async () => {
    const current = getSession()
    if (!current?.refresh_token) {
      saveSession(null)
      throw new Error('Admin session expired. Please sign in again.')
    }
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: current.refresh_token }),
    })
    const body = await response.text()
    const data = body ? JSON.parse(body) : null
    if (!response.ok || !data?.access_token || !data?.refresh_token) {
      saveSession(null)
      throw new Error(data?.msg || data?.message || data?.error_description || 'Admin session expired. Please sign in again.')
    }
    const next = { ...current, ...data, user: data.user || current.user } as Session
    saveSession(next)
    return next
  })()
  try { return await refreshInFlight }
  finally { refreshInFlight = null }
}

export async function getFreshAccessToken(token?: string): Promise<string> {
  const current = getSession()
  if (!current) {
    if (token) return token
    throw new Error('Admin session expired. Please sign in again.')
  }
  // Prefer the latest locally persisted token; components may still hold an older session snapshot.
  const activeToken = current.access_token || token || ''
  if (current.refresh_token && tokenExpiresSoon(activeToken)) {
    return (await refreshSession()).access_token
  }
  return activeToken
}

async function authenticatedFetch(url: string, init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers)
  headers.set('apikey', SUPABASE_KEY)
  const sentToken = token ? await getFreshAccessToken(token) : undefined
  if (sentToken) headers.set('Authorization', `Bearer ${sentToken}`)
  let response = await fetch(url, { ...init, headers })
  if (response.status === 401 && token) {
    const current = getSession()
    // Another request may already have rotated the refresh token. Reuse that
    // newer access token instead of attempting to refresh the same token twice.
    const freshToken = current?.access_token && current.access_token !== sentToken
      ? current.access_token
      : current?.refresh_token ? (await refreshSession()).access_token : null
    if (freshToken) {
      headers.set('Authorization', `Bearer ${freshToken}`)
      response = await fetch(url, { ...init, headers })
    }
  }
  return response
}

async function request(path: string, init: RequestInit = {}, token?: string) {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  const response = await authenticatedFetch(`${SUPABASE_URL}${path}`, { ...init, headers }, token)
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


async function optimizePortfolioImage(file: File): Promise<File> {
  if (file.size < 350 * 1024 || !('createImageBitmap' in window)) return file
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file) } catch { return file }
  try {
    const maxSide = 1920
    const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * ratio))
    const height = Math.max(1, Math.round(bitmap.height * ratio))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) return file
    context.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/webp', 0.82))
    if (!blob || blob.size >= file.size) return file
    const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
    return new File([blob], name, { type: 'image/webp', lastModified: file.lastModified })
  } finally { bitmap.close() }
}

export async function uploadPublicAsset(file: File, token: string): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  if (!allowedTypes.includes(file.type)) throw new Error('Supported image formats: JPG, JPEG, PNG, WebP and AVIF.')
  if (file.size > 12 * 1024 * 1024) throw new Error('Image must be smaller than 12 MB.')
  const optimized = await optimizePortfolioImage(file)
  const safeName = optimized.name.replace(/[^a-zA-Z0-9._-]/g, '-')
  const path = 'uploads/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '-' + safeName
  const response = await authenticatedFetch(SUPABASE_URL + '/storage/v1/object/portfolio-assets/' + path, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + token, 'Content-Type': optimized.type, 'Cache-Control': 'public, max-age=31536000, immutable', 'x-upsert': 'true' },
    body: optimized,
  }, token)
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
  const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0]
  const endpoint = 'https://' + projectRef + '.storage.supabase.co/storage/v1/upload/resumable'
  const metadata = (key: string, value: string) => key + ' ' + btoa(unescape(encodeURIComponent(value)))
  const created = await authenticatedFetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + token,
      'Tus-Resumable': '1.0.0',
      'Upload-Length': String(file.size),
      'Upload-Metadata': [
        metadata('bucketName', 'portfolio-media'),
        metadata('objectName', path),
        metadata('contentType', file.type),
        metadata('cacheControl', '31536000'),
      ].join(','),
      'x-upsert': 'true',
    },
  }, token)
  if (!created.ok) {
    const detail = await created.text()
    throw new Error(detail || 'Could not start resumable video upload.')
  }
  const location = created.headers.get('Location')
  if (!location) throw new Error('Storage did not return a resumable upload URL.')
  let offset = 0
  const chunkSize = 6 * 1024 * 1024
  while (offset < file.size) {
    const chunk = file.slice(offset, Math.min(offset + chunkSize, file.size))
    let uploaded = false
    let lastError = 'Video upload interrupted.'
    for (let attempt = 0; attempt < 4 && !uploaded; attempt++) {
      try {
        const response = await authenticatedFetch(new URL(location, endpoint).toString(), {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: 'Bearer ' + token,
            'Tus-Resumable': '1.0.0',
            'Upload-Offset': String(offset),
            'Content-Type': 'application/offset+octet-stream',
          },
          body: chunk,
        }, token)
        if (!response.ok) {
          lastError = await response.text()
          if (response.status === 409) throw new Error(lastError || 'Upload offset conflict.')
          throw new Error(lastError || 'Video chunk upload failed.')
        }
        const nextOffset = Number(response.headers.get('Upload-Offset'))
        if (!Number.isFinite(nextOffset) || nextOffset <= offset) throw new Error('Storage returned an invalid upload offset.')
        offset = nextOffset
        uploaded = true
      } catch (error) {
        lastError = error instanceof Error ? error.message : lastError
        if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1200 * (attempt + 1)))
      }
    }
    if (!uploaded) throw new Error(lastError)
  }
  return SUPABASE_URL + '/storage/v1/object/public/portfolio-media/' + path
}
export async function selectPortfolioMedia(token: string) {
  const all: Record<string, unknown>[] = []
  const pageSize = 1000
  for (let start = 0; ; start += pageSize) {
    const rows = await request('/rest/v1/portfolio_media?select=*&order=sort_order.asc,created_at.desc', {
      headers: { Range: start + '-' + (start + pageSize - 1), 'Range-Unit': 'items' },
    }, token) as Record<string, unknown>[]
    all.push(...rows)
    if (rows.length < pageSize) break
  }
  return all
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
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(event),
  })
  if (!response.ok) throw new Error('Analytics event could not be recorded')
}
export async function selectAnalyticsEvents(token: string, days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  return request('/rest/v1/site_analytics_events?select=id,session_id,event_name,page_path,target,created_at&created_at=gte.' + encodeURIComponent(since) + '&order=created_at.desc&limit=5000', {}, token) as Promise<Array<{id:number;session_id:string;event_name:string;page_path:string;target?:string;created_at:string}>>
}

export async function selectAppointmentRequests(token: string) {
  return request('/rest/v1/appointment_requests?select=*&order=created_at.desc&limit=500', {}, token) as Promise<Record<string, unknown>[]>
}
export async function updateAppointmentRequest(id: string, status: string, token: string) {
  const rows = await request('/rest/v1/appointment_requests?id=eq.' + encodeURIComponent(id), {
    method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ status }),
  }, token) as Record<string, unknown>[]
  if (!rows.length) throw new Error('Booking was not updated. Check admin permissions.')
  return rows[0]
}

/** Fetches every published video row in bounded pages so libraries can exceed 1,000 entries. */
export async function selectPortfolioPublicRows() {
  const all: Record<string, unknown>[] = []
  const pageSize = 1000
  for (let start = 0; ; start += pageSize) {
    const rows = await request('/rest/v1/portfolio_media?select=*&is_published=eq.true&order=sort_order.asc,created_at.desc', {
      headers: { Range: start + '-' + (start + pageSize - 1), 'Range-Unit': 'items' },
    }) as Record<string, unknown>[]
    all.push(...rows)
    if (rows.length < pageSize) break
  }
  return all
}
