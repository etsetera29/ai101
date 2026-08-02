import { useState } from 'react'
import KeyWarningBanner from './KeyWarningBanner'
import ClearKeyButton from './ClearKeyButton'

export default function ApiKeyManager({ apiKeyState, compact = false }) {
  const { providers, keys, setKey, clearKey, activeProvider, setActiveProvider } = apiKeyState
  const [draft, setDraft] = useState('')
  const [reveal, setReveal] = useState(false)

  const provider = providers.find((p) => p.id === activeProvider)
  const savedKey = keys[activeProvider] || ''

  return (
    <div>
      {!compact && <KeyWarningBanner />}

      <div className="field">
        <label>AI provider</label>
        <select value={activeProvider} onChange={(e) => setActiveProvider(e.target.value)}>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} {p.freeTier ? '· free tier available' : ''}
            </option>
          ))}
        </select>
      </div>

      {savedKey ? (
        <div className="flex-between gap-12">
          <span className="small text-dim font-mono">
            {reveal ? savedKey : '•'.repeat(Math.min(savedKey.length, 28))}
          </span>
          <div className="flex gap-8">
            <button className="btn btn-ghost btn-sm" onClick={() => setReveal((v) => !v)}>
              {reveal ? 'Hide' : 'Show'}
            </button>
            <ClearKeyButton onClear={() => clearKey(activeProvider)} />
          </div>
        </div>
      ) : (
        <div className="field" style={{ marginBottom: 0 }}>
          <label>{provider?.label} API key</label>
          <div className="flex gap-8">
            <input
              type="password"
              placeholder="Paste your key here"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              className="btn btn-primary btn-sm"
              disabled={!draft.trim()}
              onClick={() => {
                setKey(activeProvider, draft.trim())
                setDraft('')
              }}
            >
              Save
            </button>
          </div>
          {provider?.needsRelay && (
            <p className="text-faint small mt-8">
              Requests to {provider.label} pass through a minimal relay (required by their API) —
              it forwards your request and doesn't log it.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
