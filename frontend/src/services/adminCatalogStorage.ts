import type { AdminCatalogSnapshot } from '../types/admin'
import { parseStoredCatalog } from '../utils/catalogParsing'

export const ADMIN_CATALOG_STORAGE_KEY = 'medipulse.demo.admin-catalog.v1'

export interface AdminCatalogStorage {
  load(): AdminCatalogSnapshot | null
  save(snapshot: AdminCatalogSnapshot): void
  clear(): void
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Local demo adapter for admin-managed records.
 * Replace with a Supabase-backed implementation in a later milestone.
 */
export const adminCatalogStorage: AdminCatalogStorage = {
  load() {
    const storage = getLocalStorage()
    if (!storage) return null

    try {
      const raw = storage.getItem(ADMIN_CATALOG_STORAGE_KEY)
      if (!raw) return null

      return parseStoredCatalog(JSON.parse(raw) as unknown)
    } catch {
      return null
    }
  },

  save(snapshot) {
    const storage = getLocalStorage()
    if (!storage) return

    try {
      storage.setItem(ADMIN_CATALOG_STORAGE_KEY, JSON.stringify(snapshot))
    } catch {
      // Storage can be unavailable in private browsing or when the quota is full.
    }
  },

  clear() {
    const storage = getLocalStorage()
    if (!storage) return

    try {
      storage.removeItem(ADMIN_CATALOG_STORAGE_KEY)
    } catch {
      // Ignore storage failures; the in-memory reset still applies.
    }
  },
}
