import { useNavigate } from 'react-router-dom'

export default function TopBar({ onOpenSettings }) {
  const navigate = useNavigate()
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <button className="brand" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="dot" />
          AI 101 · Field Log
        </button>
        <button className="icon-btn" onClick={onOpenSettings}>⚙ Settings</button>
      </div>
    </div>
  )
}
