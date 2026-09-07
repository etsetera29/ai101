import { useState } from 'react'

const SECTIONS = [
  'BSIT-1A-NE',
  'BSIT-1B-NE',
  'BSIT-1C-NE',
  'BSIT-1D-NE',
  'BSIT-1E-NE',
  'BSIT-1A-SE',
  'BSCS-1A',
]

export default function AuthGate({ auth }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [section, setSection] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  if (!auth.configured) {
    return (
      <div className="container" style={{ paddingTop: 80 }}>
        <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ marginTop: 0 }}>Almost there</h2>
          <p className="text-dim">
            Accounts aren't configured yet on this deployment. Set{' '}
            <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your
            environment variables (and in Vercel's project settings), then redeploy.
          </p>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)

    if (mode === 'register') {
      const { error: err } = await auth.signUp(email.trim(), password, fullName.trim(), section)
      setBusy(false)
      if (err) {
        setError(err.message)
      } else {
        setInfo('Account created! Check your email to confirm, then log in.')
        setMode('login')
      }
      return
    }

    const { error: err } = await auth.signIn(email.trim(), password)
    setBusy(false)
    if (err) setError(err.message)
  }

  return (
    <div className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
      <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
        <span className="eyebrow" style={{ color: 'var(--accent)' }}>AI 101 · Field Log</span>
        <h2 style={{ marginTop: 6 }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="text-dim" style={{ marginTop: -6, marginBottom: 22, fontSize: '0.88rem' }}>
          {mode === 'login'
            ? 'Log in to pick up your saved progress and exam scores.'
            : 'Your lesson progress and exam scores will be saved to this account.'}
        </p>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="field">
                <label htmlFor="section">Course &amp; section</label>
                <select
                  id="section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  required
                >
                  <option value="" disabled>Select your section…</option>
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: -6 }}>{error}</p>
          )}
          {info && (
            <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: -6 }}>{info}</p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="text-faint" style={{ fontSize: '0.85rem', marginTop: 18, textAlign: 'center' }}>
          {mode === 'login' ? (
            <>
              No account yet?{' '}
              <button className="btn-link" onClick={() => { setMode('register'); setError(''); setInfo('') }}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="btn-link" onClick={() => { setMode('login'); setError(''); setInfo('') }}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
