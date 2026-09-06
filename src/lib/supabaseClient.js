import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey)

if (!supabaseConfigured) {
  // Loud in dev, harmless in prod — the AuthGate shows a friendly setup
  // message instead of a blank screen if this fires.
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. ' +
      'Accounts and saved progress will not work until they are configured.'
  )
}

export const supabase = supabaseConfigured
  ? createClient(url, anonKey)
  : null
