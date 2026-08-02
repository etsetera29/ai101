import { useNavigate } from 'react-router-dom'
import weekMeta from '../../data/weekMeta.json'

export default function ExamLockScreen({ meta, missing }) {
  const navigate = useNavigate()
  const missingTitles = missing.map((id) => weekMeta.find((w) => w.id === id)?.title || id)

  return (
    <div className="container">
      <div className="lock-screen">
        <div className="lock-icon">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </div>
        <h2 style={{ margin: '0 0 10px' }}>{meta.title} is locked</h2>
        <p className="text-dim">
          Finish every lesson it covers first — click "Mark this lesson finished" at the bottom
          of each one.
        </p>
        <ul className="missing-list">
          {missingTitles.map((t) => (
            <li key={t}>◻ {t}</li>
          ))}
        </ul>
        <button className="btn btn-primary mt-24" onClick={() => navigate('/')}>
          Back to the log
        </button>
      </div>
    </div>
  )
}
