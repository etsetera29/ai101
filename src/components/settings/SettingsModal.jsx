import { useState } from 'react'
import ApiKeyManager from './ApiKeyManager'
import AdminKeyManager from './AdminKeyManager'
import ThemeToggle from '../../theme/ThemeToggle'

export default function SettingsModal({ open, onClose, apiKeyState, adminKeyState, progress }) {
  const [section, setSection] = useState(null) // null | 'apiKeys' | 'adminKey'

  if (!open) return null

  function toggle(name) {
    setSection((prev) => (prev === name ? null : name))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 style={{ margin: 0 }}>Settings</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close settings">✕</button>
        </div>

        <div className="settings-menu">
          <button
            className={`settings-menu-item ${section === 'apiKeys' ? 'active' : ''}`}
            onClick={() => toggle('apiKeys')}
          >
            <span>🔑 API keys</span>
            <span className="chevron">{section === 'apiKeys' ? '▾' : '▸'}</span>
          </button>
          {section === 'apiKeys' && (
            <div className="settings-panel">
              <ApiKeyManager apiKeyState={apiKeyState} />
            </div>
          )}

          <button
            className={`settings-menu-item ${section === 'adminKey' ? 'active' : ''}`}
            onClick={() => toggle('adminKey')}
          >
            <span>🛡 Admin key</span>
            <span className="chevron">{section === 'adminKey' ? '▾' : '▸'}</span>
          </button>
          {section === 'adminKey' && (
            <div className="settings-panel">
              <AdminKeyManager adminKeyState={adminKeyState} />
            </div>
          )}
        </div>

        <p className="eyebrow text-faint mt-24">Accessibility</p>
        <div className="mt-8">
          <ThemeToggle />
        </div>

        <p className="eyebrow text-faint mt-24">Progress</p>
        <button
          className="btn btn-danger btn-sm mt-8"
          onClick={() => {
            if (confirm('Reset all lesson and exam progress on this device? This cannot be undone.')) {
              progress.resetProgress()
            }
          }}
        >
          Reset all progress
        </button>
      </div>
    </div>
  )
}
