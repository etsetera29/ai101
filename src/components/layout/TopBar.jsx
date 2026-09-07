import { useNavigate } from 'react-router-dom'

export default function TopBar({ onOpenSettings, onOpenProfile, auth }) {
  const navigate = useNavigate()
  const fullName = auth?.user?.user_metadata?.full_name || auth?.user?.email

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <button className="brand" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="dot" />
          AI 101 · Field Log
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {auth?.user && (
            <button className="icon-btn" onClick={onOpenProfile}>
              👤 {fullName}
            </button>
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
