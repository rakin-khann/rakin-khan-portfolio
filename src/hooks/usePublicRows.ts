import { useEffect, useState } from 'react'
import { selectPublicRows } from '../lib/supabase'

/** Loads published portfolio content; static design content remains the fallback. */
export function usePublicRows(table: string) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  useEffect(() => {
    let active = true
    selectPublicRows(table).then(data => {
      if (active) setRows(data.filter(row => row.is_published !== false))
    }).catch(() => {
      // Keep the original designed content visible if the CMS is not configured yet.
    })
    return () => { active = false }
  }, [table])
  return rows
}
