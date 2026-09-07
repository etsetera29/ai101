import { useCallback, useState } from 'react'

const STORAGE_KEY = 'ai101-admin-key-v1'

export function useAdminKey() {
  const [adminKey, setAdminKeyState] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [verified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  const setAdminKey = useCallback((value) => {
    setAdminKeyState(value)
    setVerified(false)
    setVerifyError('')
    if (value) localStorage.setItem(STORAGE_KEY, value)
    else localStorage.removeItem(STORAGE_KEY)
  }, [])

  const clearAdminKey = useCallback(() => setAdminKey(''), [setAdminKey])

  const verify = useCallback(async (keyOverride) => {
    const key = keyOverride ?? adminKey
    if (!key) return
    setVerifying(true)
    setVerifyError('')
    try {
      const res = await fetch('/api/admin-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: key, action: 'verify' }),
      })
      const data = await res.json()
      if (res.ok && data.ok) {
        setVerified(true)
      } else {
        setVerified(false)
        setVerifyError(data.error || 'Invalid admin key.')
      }
    } catch {
      setVerified(false)
      setVerifyError('Could not reach the server. Try again.')
    } finally {
      setVerifying(false)
    }
  }, [adminKey])

  return { adminKey, setAdminKey, clearAdminKey, verified, verifying, verifyError, verify }
}
