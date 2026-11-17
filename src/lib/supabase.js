import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the deployment environment.')
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder-publishable-key',
)

/** Fetch rows used by the public portfolio CMS. RLS controls which rows are visible. */
export async function selectPublicRows(table) {
  const { data, error } = await supabase.from(table).select('*')
  if (error) throw error
  return data ?? []
}
