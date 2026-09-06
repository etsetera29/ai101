import { useNavigate } from 'react-router-dom'

export default function TopBar({ onOpenSettings, auth }) {
  const navigate = useNavigate()
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <button className="brand" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="dot" />
          AI 101 · Field Log
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {auth?.user && (
            <span className="text-faint small font-mono" style={{ marginRight: 4 }}>
              {auth.user.email}
            </span>
          )}
          <button className="icon-btn" onClick={onOpenSettings}>⚙ Settings</button>
          {auth?.user && (
            <button className="icon-btn" onClick={auth.signOut}>⏻ Log out</button>
          )}
        </div>
      </div>
    </div>
  )
}
