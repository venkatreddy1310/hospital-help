import type { AccountUser } from '../types/account'

const SESSION_KEY = 'medipulse.demo.auth.session.v1'
const ACCOUNTS_KEY = 'medipulse.demo.auth.accounts.v1'
const SIGNED_OUT_KEY = 'medipulse.demo.auth.signed-out.v1'

export const DEMO_ACCOUNT_ID = 'demo-account'
export const DEMO_ACCOUNT_EMAIL = 'demo@medipulse.local'
export const DEMO_ACCOUNT_NAME = 'Demo Patient'

interface DemoSessionRecord {
  userId: string
  email: string
  displayName: string
  createdAt: string
}

interface DemoAccountRecord {
  email: string
  displayName: string
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function hashEmail(email: string): string {
  let hash = 0
  for (const character of email) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0
  }
  return Math.abs(hash).toString(36)
}

function demoUserIdForEmail(email: string): string {
  const normalized = normalizeEmail(email)
  if (normalized === DEMO_ACCOUNT_EMAIL) return DEMO_ACCOUNT_ID
  return `demo-${hashEmail(normalized)}`
}

function readAccounts(): Record<string, DemoAccountRecord> {
  const storage = getLocalStorage()
  if (!storage) return {}

  try {
    const parsed: unknown = JSON.parse(storage.getItem(ACCOUNTS_KEY) ?? '{}')
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, DemoAccountRecord>)
      : {}
  } catch {
    return {}
  }
}

function saveAccount(email: string, displayName: string): void {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    const accounts = readAccounts()
    accounts[normalizeEmail(email)] = {
      email: normalizeEmail(email),
      displayName,
    }
    storage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  } catch {
    // Demo metadata is optional when storage is unavailable.
  }
}

function readSession(): DemoSessionRecord | null {
  const storage = getLocalStorage()
  if (!storage) return null

  try {
    const parsed: unknown = JSON.parse(storage.getItem(SESSION_KEY) ?? 'null')
    if (typeof parsed !== 'object' || parsed === null) return null

    const record = parsed as Partial<DemoSessionRecord>
    if (
      typeof record.userId !== 'string' ||
      typeof record.email !== 'string' ||
      typeof record.displayName !== 'string'
    ) {
      return null
    }

    return {
      userId: record.userId,
      email: record.email,
      displayName: record.displayName,
      createdAt: record.createdAt ?? new Date().toISOString(),
    }
  } catch {
    return null
  }
}

function saveSession(session: DemoSessionRecord): void {
  const storage = getLocalStorage()
  if (!storage) return

  try {
    storage.setItem(SESSION_KEY, JSON.stringify(session))
    storage.removeItem(SIGNED_OUT_KEY)
  } catch {
    // Demo sessions are a convenience, not a security boundary.
  }
}

function toUser(session: DemoSessionRecord): AccountUser {
  return {
    id: session.userId,
    email: session.email,
    displayName: session.displayName,
    role: 'patient',
    source: 'demo',
  }
}

function createSession(
  email: string,
  displayName: string,
): AccountUser {
  const session: DemoSessionRecord = {
    userId: demoUserIdForEmail(email),
    email: normalizeEmail(email),
    displayName: displayName.trim(),
    createdAt: new Date().toISOString(),
  }

  saveSession(session)
  saveAccount(session.email, session.displayName)
  return toUser(session)
}

/** Local, clearly-labeled demo session helper. Passwords are never stored. */
export const demoAuth = {
  initialize(): AccountUser | null {
    const storage = getLocalStorage()
    const existing = readSession()
    if (existing) return toUser(existing)

    if (storage?.getItem(SIGNED_OUT_KEY) === '1') return null

    return createSession(DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_NAME)
  },

  resume(): AccountUser {
    const existing = readSession()
    if (existing) return toUser(existing)
    return createSession(DEMO_ACCOUNT_EMAIL, DEMO_ACCOUNT_NAME)
  },

  signIn(email: string, displayName?: string): AccountUser {
    const normalized = normalizeEmail(email)
    const known = readAccounts()[normalized]
    const name =
      displayName?.trim() ||
      known?.displayName ||
      (normalized === DEMO_ACCOUNT_EMAIL
        ? DEMO_ACCOUNT_NAME
        : normalized.split('@')[0] || 'Demo Patient')

    return createSession(normalized, name)
  },

  signUp(email: string, displayName: string): AccountUser {
    return createSession(email, displayName)
  },

  signOut(): void {
    const storage = getLocalStorage()
    if (!storage) return

    try {
      storage.removeItem(SESSION_KEY)
      storage.setItem(SIGNED_OUT_KEY, '1')
    } catch {
      // Ignore storage failures; the in-memory session is still cleared.
    }
  },

  getDefaultUser(): AccountUser {
    return {
      id: DEMO_ACCOUNT_ID,
      email: DEMO_ACCOUNT_EMAIL,
      displayName: DEMO_ACCOUNT_NAME,
      role: 'patient',
      source: 'demo',
    }
  },
}
