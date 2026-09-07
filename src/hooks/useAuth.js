import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabaseClient'
import { buildFullName } from '../lib/formatName'

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

  const signUp = useCallback(
    async (email, password, { firstName, lastName, middleInitial, section, agreedToTerms }) => {
      const fullName = buildFullName(firstName, lastName, middleInitial)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            middle_initial: middleInitial || null,
            full_name: fullName,
            section,
            terms_accepted: !!agreedToTerms,
          },
        },
      })
      // If email confirmation is turned off in Supabase, signUp already
      // returns a live session — the person is logged in immediately and
      // there's no "check your email" step to show.
      return { error, session: data?.session ?? null }
    },
    []
  )

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])

  const resendConfirmation = useCallback(async (email) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email })
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
    resendConfirmation,
  }
}
