import { createContext, useContext } from 'react'
import type { AccountUser, AuthStatus } from '../types/account'

export interface AuthActionResult {
  error?: string
  message?: string
  needsEmailConfirmation?: boolean
}

export interface AuthContextValue {
  user: AccountUser | null
  status: AuthStatus
  isDemoMode: boolean
  isSupabaseConfigured: boolean
  signIn: (email: string, password: string) => Promise<AuthActionResult>
  signUp: (input: {
    fullName: string
    email: string
    password: string
  }) => Promise<AuthActionResult>
  signInAsDemo: () => void
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<AuthActionResult>
  updatePassword: (password: string) => Promise<AuthActionResult>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
