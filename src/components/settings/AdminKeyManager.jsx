import { useState } from 'react'

export default function AdminKeyManager({ adminKeyState }) {
  const [input, setInput] = useState(adminKeyState.adminKey || '')

  function handleSave() {
    adminKeyState.setAdminKey(input)
    adminKeyState.verify(input)
  }

  return (
    <div>
      <p className="text-dim" style={{ fontSize: '0.85rem', marginTop: 0 }}>
        Instructors only. Enter the admin passphrase to unlock exporting a grading sheet for an
        entire course from your Profile page.
      </p>

      <div className="field">
        <label htmlFor="adminKeyInput">Admin passphrase</label>
        <input
          id="adminKeyInput"
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={!input || adminKeyState.verifying}
        >
          {adminKeyState.verifying ? 'Checking…' : 'Save & verify'}
        </button>
        {adminKeyState.adminKey && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setInput('')
              adminKeyState.clearAdminKey()
            }}
          >
            Clear
          </button>
        )}
      </div>

      {adminKeyState.verified && (
        <p style={{ color: 'var(--success)', fontSize: '0.85rem', marginTop: 10 }}>
          ✓ Admin access unlocked. Course export is now available on your Profile page.
        </p>
      )}
      {adminKeyState.verifyError && (
        <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: 10 }}>
          {adminKeyState.verifyError}
        </p>
      )}
    </div>
  )
}
