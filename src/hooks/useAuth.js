import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'

/**
 * Wraps Supabase Auth. `user` is null while logged out, an object once
 * logged in. `loading` covers the initial "do we already have a session"
 * check on page load so we don't flash the login form for signed-in users.
 */
export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(supabaseConfigured)

  useEffect(() => {
    if (!supabaseConfigured) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { error }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return {
    configured: supabaseConfigured,
    session,
    user: session?.user ?? null,
    loading,
    signUp,
    signIn,
    signOut,
  }
}
