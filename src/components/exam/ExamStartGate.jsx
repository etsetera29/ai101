import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export async function enterFullscreen() {
  const el = document.documentElement
  const request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen
  if (!request) return false
  try {
    await request.call(el)
    return true
  } catch {
    return false
  }
}

export default function ExamStartGate({ meta, totalQuestions, onStart }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  async function handleStart() {
    const ok = await enterFullscreen()
    if (!ok) {
      setError('This browser blocked fullscreen. Please allow it (or try a different browser) and try again.')
      return
    }
    setError('')
    onStart()
  }

  return (
    <div className="container">
      <div className="lock-screen" style={{ maxWidth: 560 }}>
        <div className="lock-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <h2 style={{ margin: '0 0 10px' }}>{meta.title} — before you start</h2>
        <p className="text-dim">This exam runs in fullscreen with a few academic-integrity checks:</p>
        <ul className="missing-list" style={{ textAlign: 'left' }}>
          <li>Runs in fullscreen — exiting fullscreen skips your current question, marked wrong.</li>
          <li>Switching tabs or windows instantly skips your current question, marked wrong.</li>
          <li>30 seconds of inactivity shows one warning; a second time on the same question skips it.</li>
          <li>There's no "Previous" button — once you move on, that question is locked in.</li>
          <li>{totalQuestions} questions total. Good luck!</li>
        </ul>
        {error && (
          <p style={{ color: 'var(--danger)', fontSize: '0.88rem' }}>{error}</p>
        )}
        <div className="flex gap-12 mt-24" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>Not now</button>
          <button className="btn btn-primary" onClick={handleStart}>Start exam in fullscreen</button>
        </div>
      </div>
    </div>
  )
}
