import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { demoAuth } from '../services/demoAuth'
import { isSupabaseConfigured } from '../services/supabaseClient'
import { supabaseAuth } from '../services/supabaseAuth'
import type { AccountUser, AuthStatus } from '../types/account'
import { AuthContext, type AuthActionResult, type AuthContextValue } from './authStore'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface AuthState {
  user: AccountUser | null
  status: AuthStatus
}

function getInitialAuthState(): AuthState {
  if (isSupabaseConfigured) {
    return { user: null, status: 'initializing' }
  }

  const demoUser = demoAuth.initialize()
  return { user: demoUser, status: demoUser ? 'signed-in' : 'signed-out' }
}

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Enter your email address.'
  if (!EMAIL_PATTERN.test(email.trim())) return 'Enter a valid email address.'
  return null
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Use at least 8 characters for your password.'
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ user, status }, setAuthState] = useState<AuthState>(getInitialAuthState)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let active = true
    const unsubscribe = supabaseAuth.onAuthStateChange((nextUser) => {
      if (!active) return
      setAuthState({
        user: nextUser,
        status: nextUser ? 'signed-in' : 'signed-out',
      })
    })

    void supabaseAuth.getCurrentUser().then((currentUser) => {
      if (!active) return
      setAuthState({
        user: currentUser,
        status: currentUser ? 'signed-in' : 'signed-out',
      })
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthActionResult> => {
      const emailError = validateEmail(email)
      if (emailError) return { error: emailError }

      const passwordError = validatePassword(password)
      if (passwordError) return { error: passwordError }

      if (!isSupabaseConfigured) {
        setAuthState({ user: demoAuth.signIn(email), status: 'signed-in' })
        return {
          message: 'Signed in to the local demo account. No password was stored or verified.',
        }
      }

      const result = await supabaseAuth.signIn(email, password)
      if (result.error || !result.user) {
        return { error: result.error ?? 'Sign-in failed. Please try again.' }
      }

      setAuthState({ user: result.user, status: 'signed-in' })
      return { message: 'Signed in successfully.' }
    },
    [],
  )

  const signUp = useCallback(
    async (input: {
      fullName: string
      email: string
      password: string
    }): Promise<AuthActionResult> => {
      if (input.fullName.trim().length < 2) {
        return { error: 'Enter your full name.' }
      }

      const emailError = validateEmail(input.email)
      if (emailError) return { error: emailError }

      const passwordError = validatePassword(input.password)
      if (passwordError) return { error: passwordError }

      if (!isSupabaseConfigured) {
        setAuthState({
          user: demoAuth.signUp(input.email, input.fullName),
          status: 'signed-in',
        })
        return {
          message:
            'Demo account created locally. Password details were not stored or verified.',
        }
      }

      const result = await supabaseAuth.signUp(input)
      if (result.error) return { error: result.error }

      if (result.needsEmailConfirmation) {
        return {
          needsEmailConfirmation: true,
          message: 'Check your email to confirm your account before signing in.',
        }
      }

      if (result.user) {
        setAuthState({ user: result.user, status: 'signed-in' })
      }

      return { message: 'Account created successfully.' }
    },
    [],
  )

  const signInAsDemo = useCallback(() => {
    setAuthState({ user: demoAuth.resume(), status: 'signed-in' })
  }, [])

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      const error = await supabaseAuth.signOut()
      if (error) return
    } else {
      demoAuth.signOut()
    }

    setAuthState({ user: null, status: 'signed-out' })
  }, [])

  const requestPasswordReset = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      const emailError = validateEmail(email)
      if (emailError) return { error: emailError }

      if (!isSupabaseConfigured) {
        return {
          message:
            'Demo reset simulated. No email was sent and no password is stored. Use any valid password to explore sign-in.',
        }
      }

      const error = await supabaseAuth.requestPasswordReset(email)
      if (error) return { error }

      return {
        message: 'If an account exists for that email, a reset link has been sent.',
      }
    },
    [],
  )

  const updatePassword = useCallback(
    async (password: string): Promise<AuthActionResult> => {
      const passwordError = validatePassword(password)
      if (passwordError) return { error: passwordError }

      if (!isSupabaseConfigured) {
        return {
          message:
            'Demo password change simulated. No password is stored in demo mode.',
        }
      }

      const error = await supabaseAuth.updatePassword(password)
      return error ? { error } : { message: 'Password updated successfully.' }
    },
    [],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isDemoMode: !isSupabaseConfigured,
      isSupabaseConfigured,
      signIn,
      signUp,
      signInAsDemo,
      signOut,
      requestPasswordReset,
      updatePassword,
    }),
    [
      user,
      status,
      signIn,
      signUp,
      signInAsDemo,
      signOut,
      requestPasswordReset,
      updatePassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
