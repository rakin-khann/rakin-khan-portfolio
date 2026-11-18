import { useEffect, useState } from 'react'
import { selectPublicRows, selectPortfolioPublicRows } from '../lib/supabase'

type CacheEntry = { expiresAt: number; promise: Promise<Record<string, unknown>[]> }
const publicRowsCache = new Map<string, CacheEntry>()

function loadPublicRows(table: string) {
  const cached = publicRowsCache.get(table)
  if (cached && cached.expiresAt > Date.now()) return cached.promise
  const promise = (table === 'portfolio_media' ? selectPortfolioPublicRows() : selectPublicRows(table)).catch(error => {
    publicRowsCache.delete(table)
    throw error
  })
  publicRowsCache.set(table, { expiresAt: Date.now() + 20_000, promise })
  return promise
}

/** Loads published portfolio content and shares short-lived requests between components. */
export function usePublicRows(table: string) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([])
  useEffect(() => {
    let active = true
    loadPublicRows(table).then(data => {
      if (active) {
        const published = data.filter(row => row.is_published !== false)
        published.sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
        setRows(published)
      }
    }).catch(() => {
      // Keep the original designed content visible if the CMS is not configured yet.
    })
    return () => { active = false }
  }, [table])
  return rows
}
