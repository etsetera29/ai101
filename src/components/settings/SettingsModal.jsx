import ApiKeyManager from './ApiKeyManager'
import ThemeToggle from '../../theme/ThemeToggle'

export default function SettingsModal({ open, onClose, apiKeyState, progress }) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3 style={{ margin: 0 }}>Settings</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close settings">✕</button>
        </div>

        <p className="eyebrow text-faint">API keys</p>
        <ApiKeyManager apiKeyState={apiKeyState} />

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
