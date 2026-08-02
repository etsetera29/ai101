import { useCallback, useEffect, useState } from 'react'

// IMPORTANT: keys live ONLY in localStorage, in the student's own browser.
// They are never sent to, logged by, or stored on any server we control.
// Claude/OpenAI calls go through a pass-through relay (api/*-relay.js) that
// forwards the request in-memory and does not persist it; Groq/Gemini are
// called directly from the browser and never touch our infrastructure at all.

const STORAGE_KEY = 'ai101-api-keys-v1'

const PROVIDERS = [
  { id: 'claude', label: 'Claude (Anthropic)', freeTier: false, needsRelay: true },
  { id: 'openai', label: 'GPT (OpenAI)', freeTier: false, needsRelay: true },
  { id: 'groq', label: 'Groq', freeTier: true, needsRelay: false },
  { id: 'gemini', label: 'Gemini (Google)', freeTier: true, needsRelay: false },
]

function readKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function useApiKey() {
  const [keys, setKeys] = useState(readKeys)
  const [activeProvider, setActiveProvider] = useState(
    () => localStorage.getItem('ai101-active-provider') || 'groq'
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  }, [keys])

  useEffect(() => {
    localStorage.setItem('ai101-active-provider', activeProvider)
  }, [activeProvider])

  const setKey = useCallback((providerId, value) => {
    setKeys((prev) => ({ ...prev, [providerId]: value }))
  }, [])

  const clearKey = useCallback((providerId) => {
    setKeys((prev) => {
      const next = { ...prev }
      delete next[providerId]
      return next
    })
  }, [])

  const clearAllKeys = useCallback(() => {
    setKeys({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const hasAnyKey = Object.values(keys).some((v) => v && v.trim().length > 0)
  const currentKey = keys[activeProvider] || ''

  return {
    providers: PROVIDERS,
    keys,
    setKey,
    clearKey,
    clearAllKeys,
    hasAnyKey,
    activeProvider,
    setActiveProvider,
    currentKey,
  }
}
