import type { AccountRole, AccountUser } from '../types/account'
import { isSupabaseConfigured, supabase } from './supabaseClient'

export function getFriendlyAuthError(message: string | undefined): string {
  const value = (message ?? '').toLowerCase()

  if (value.includes('invalid login credentials')) {
    return 'Email or password is incorrect.'
  }
  if (value.includes('email not confirmed')) {
    return 'Confirm your email address before signing in.'
  }
  if (value.includes('already registered') || value.includes('already exists')) {
    return 'An account with this email already exists. Try signing in instead.'
  }
  if (value.includes('password should be') || value.includes('weak password')) {
    return 'Choose a stronger password with at least 8 characters.'
  }
  if (value.includes('rate limit') || value.includes('too many requests')) {
    return 'Too many attempts. Wait a moment and try again.'
  }
  if (value.includes('failed to fetch') || value.includes('network')) {
    return 'Could not reach the authentication service. Check your connection.'
  }

  return 'Authentication could not be completed. Please try again.'
}

async function getRole(userId: string): Promise<AccountRole> {
  if (!supabase) return 'patient'

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle<{ role: string }>()

  if (error || !data) return 'patient'
  return data.role === 'admin' ? 'admin' : 'patient'
}

export async function mapSupabaseUser(user: {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}): Promise<AccountUser> {
  const metadataName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : ''

  return {
    id: user.id,
    email: user.email ?? '',
    displayName: metadataName || user.email?.split('@')[0] || 'Patient',
    role: await getRole(user.id),
    source: 'supabase',
  }
}

export const supabaseAuth = {
  isConfigured: isSupabaseConfigured,

  async getCurrentUser(): Promise<AccountUser | null> {
    if (!supabase) return null

    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session?.user) return null

    return mapSupabaseUser(data.session.user)
  },

  async signIn(email: string, password: string): Promise<{ user?: AccountUser; error?: string }> {
    if (!supabase) return { error: 'Supabase authentication is not configured.' }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) return { error: getFriendlyAuthError(error.message) }
    if (!data.user) return { error: 'Sign-in did not return a user session.' }

    return { user: await mapSupabaseUser(data.user) }
  },

  async signUp(input: {
    fullName: string
    email: string
    password: string
  }): Promise<{
    user?: AccountUser
    error?: string
    needsEmailConfirmation?: boolean
  }> {
    if (!supabase) return { error: 'Supabase authentication is not configured.' }

    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: { full_name: input.fullName.trim() },
        emailRedirectTo: `${window.location.origin}/account`,
      },
    })

    if (error) return { error: getFriendlyAuthError(error.message) }

    if (!data.session?.user) {
      return {
        needsEmailConfirmation: true,
        user: {
          id: data.user?.id ?? 'pending',
          email: input.email.trim(),
          displayName: input.fullName.trim(),
          role: 'patient',
          source: 'supabase',
        },
      }
    }

    return { user: await mapSupabaseUser(data.session.user) }
  },

  async signOut(): Promise<string | null> {
    if (!supabase) return null
    const { error } = await supabase.auth.signOut()
    return error ? getFriendlyAuthError(error.message) : null
  },

  async requestPasswordReset(email: string): Promise<string | null> {
    if (!supabase) return 'Supabase authentication is not configured.'

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return error ? getFriendlyAuthError(error.message) : null
  },

  async updatePassword(password: string): Promise<string | null> {
    if (!supabase) return 'Supabase authentication is not configured.'

    const { error } = await supabase.auth.updateUser({ password })
    return error ? getFriendlyAuthError(error.message) : null
  },

  onAuthStateChange(
    callback: (user: AccountUser | null) => void,
  ): () => void {
    if (!supabase) return () => undefined

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        callback(null)
        return
      }

      void mapSupabaseUser(session.user).then(callback)
    })

    return () => data.subscription.unsubscribe()
  },
}
