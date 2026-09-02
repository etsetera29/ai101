import { useNavigate } from 'react-router-dom'
import WeekIcon from '../shared/WeekIcon'
import { weekTints } from '../../theme/colors'
import { EXAM_LOCKS } from '../../config/examLocks'

export default function RoadmapGrid({ weeks, isFinished, missingRequirements }) {
  const navigate = useNavigate()

  return (
    <div className="roadmap-grid">
      {weeks.map((w) => {
        const done = isFinished(w.id)
        const manuallyLocked = w.type === 'exam' && !!EXAM_LOCKS[w.id]
        const missing = missingRequirements(w.requires)
        const locked = manuallyLocked || missing.length > 0

        return (
          <button
            key={w.id}
            className={`grid-card${locked ? ' is-locked' : ''}`}
            style={{ '--tint': weekTints[w.tint] }}
            onClick={() => !locked && navigate(w.path)}
            disabled={locked}
          >
            <div className="grid-card-top">
              <span className="grid-card-num">Week {w.number}</span>
              <span style={{ color: weekTints[w.tint] }}>
                <WeekIcon tint={w.tint} size={18} />
              </span>
            </div>
            <p className="grid-card-title">{w.title}</p>
            <div className="grid-card-badges">
              {w.type === 'exam' && <span className="badge badge-exam">Exam</span>}
              {w.needsApiKey && <span className="badge badge-api">API key</span>}
              {done && <span className="badge badge-done">Done</span>}
              {manuallyLocked && <span className="badge" title="Locked by instructor">🔒 Locked</span>}
              {!manuallyLocked && locked && (
                <span className="badge" title={`Finish: ${missing.join(', ')}`}>🔒 Locked</span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
