import { useState } from 'react'
import { isPasswordValid } from '../../lib/formatName'

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
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleInitial, setMiddleInitial] = useState('')
  const [section, setSection] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('')
  const [resendBusy, setResendBusy] = useState(false)

  const passwordOk = isPasswordValid(password)
  const canSubmitRegister = passwordOk && agreedToTerms

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
    setUnconfirmedEmail('')
    setBusy(true)

    if (mode === 'register') {
      if (!isPasswordValid(password)) {
        setBusy(false)
        setError('Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.')
        return
      }
      if (!agreedToTerms) {
        setBusy(false)
        setError('Please review and agree to the Terms & Conditions to create an account.')
        return
      }

      const { error: err } = await auth.signUp(email.trim(), password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleInitial: middleInitial.trim(),
        section,
        agreedToTerms,
      })
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
    if (err) {
      const isUnconfirmed =
        err.code === 'email_not_confirmed' || /email.*not.*confirm/i.test(err.message || '')
      if (isUnconfirmed) {
        setUnconfirmedEmail(email.trim())
        setError('Your email address isn\u2019t confirmed yet. Check your inbox for the confirmation link before logging in.')
      } else {
        setError(err.message)
      }
    }
  }

  async function handleResendConfirmation() {
    setError('')
    setInfo('')
    setResendBusy(true)
    const { error: err } = await auth.resendConfirmation(unconfirmedEmail)
    setResendBusy(false)
    if (err) {
      setError(err.message)
    } else {
      setInfo('Confirmation email resent. Check your inbox (and spam folder).')
    }
  }

  return (
    <>
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
              <div className="field-row">
                <div className="field">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                  />
                </div>
                <div className="field">
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div className="field field-narrow">
                  <label htmlFor="middleInitial">M.I.</label>
                  <input
                    id="middleInitial"
                    type="text"
                    value={middleInitial}
                    onChange={(e) => setMiddleInitial(e.target.value.slice(0, 1))}
                    maxLength={1}
                    autoComplete="additional-name"
                  />
                </div>
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
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setPasswordTouched(true)}
                required
                minLength={8}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: 'var(--text-faint)',
                  display: 'flex',
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {mode === 'register' && (
              <p className={`field-hint${passwordTouched && !passwordOk ? ' is-invalid' : ''}${passwordOk ? ' is-valid' : ''}`}>
                At least 8 characters, with an uppercase letter, a lowercase letter, and a number.
              </p>
            )}
          </div>

          {mode === 'register' && (
            <div className="field">
              <label>Terms &amp; Conditions</label>
              <p className="text-faint" style={{ fontSize: '0.82rem', margin: '4px 0 10px' }}>
                Please{' '}
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setShowTerms(true)}
                  style={{ fontSize: 'inherit' }}
                >
                  read the Terms &amp; Conditions
                </button>{' '}
                before signing up.
              </p>
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                />
                <span>I have read and agree to the Terms &amp; Conditions.</span>
              </label>
            </div>
          )}

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: -6 }}>{error}</p>
          )}
          {unconfirmedEmail && (
            <button
              type="button"
              className="btn-link"
              onClick={handleResendConfirmation}
              disabled={resendBusy}
              style={{ fontSize: '0.85rem', marginTop: -10, marginBottom: 4, display: 'block' }}
            >
              {resendBusy ? 'Resending…' : 'Resend confirmation email'}
            </button>
          )}
          {info && (
            <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: -6 }}>{info}</p>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={busy || (mode === 'register' && !canSubmitRegister)}
          >
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="text-faint" style={{ fontSize: '0.85rem', marginTop: 18, textAlign: 'center' }}>
          {mode === 'login' ? (
            <>
              No account yet?{' '}
              <button className="btn-link" onClick={() => { setMode('register'); setError(''); setInfo(''); setUnconfirmedEmail('') }}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="btn-link" onClick={() => { setMode('login'); setError(''); setInfo(''); setUnconfirmedEmail('') }}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>

    {showTerms && (
      <div className="modal-overlay" onClick={() => setShowTerms(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <h3 style={{ margin: 0 }}>Terms &amp; Conditions</h3>
            <button
              className="modal-close"
              onClick={() => setShowTerms(false)}
              aria-label="Close terms and conditions"
            >
              ✕
            </button>
          </div>

          <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-dim)' }}>
            <p>
              By creating an account, you agree that AI 101 · Field Log may collect and store your
              name, email address, section, and quiz/exam scores, and may use this information to:
            </p>
            <ul style={{ paddingLeft: 18 }}>
              <li>generate and export grading sheets for your instructor;</li>
              <li>send you confirmation and account-related emails; and</li>
              <li>record and report your scores for course and school purposes.</li>
            </ul>
            <p style={{ marginBottom: 0 }}>
              Your information is used only for these academic purposes and is not shared outside
              of this course.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-block mt-24"
            onClick={() => {
              setAgreedToTerms(true)
              setShowTerms(false)
            }}
          >
            I agree
          </button>
        </div>
      </div>
    )}
    </>
  )
}
