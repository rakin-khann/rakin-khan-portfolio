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
  return request(`/rest/v1/${table}?select=*&order=sort_order.asc&limit=100`) as Promise<Record<string, unknown>[]>
}
