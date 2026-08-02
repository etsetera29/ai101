import { useNavigate } from 'react-router-dom'
import WeekIcon from '../shared/WeekIcon'
import { weekTints } from '../../theme/colors'

export default function RoadmapPath({ weeks, isFinished, missingRequirements }) {
  const navigate = useNavigate()

  return (
    <div className="roadmap">
      <div className="roadmap-spine" />
      {weeks.map((w) => {
        const done = isFinished(w.id)
        const missing = missingRequirements(w.requires)
        const locked = missing.length > 0
        const current = !done && !locked

        let markerClass = 'roadmap-marker'
        if (done) markerClass += ' done'
        else if (current) markerClass += ' current'
        else markerClass += ' locked'
        if (w.type === 'exam') markerClass += ' exam-marker'

        return (
          <div className="roadmap-node" key={w.id}>
            <div className={markerClass}>
              {done ? '✓' : w.number}
            </div>
            <button
              className={`roadmap-card${locked ? ' is-locked' : ''}`}
              style={{ '--tint': weekTints[w.tint], textAlign: 'left', width: '100%' }}
              onClick={() => !locked && navigate(w.path)}
              disabled={locked}
            >
              <div className="flex gap-12" style={{ alignItems: 'center' }}>
                <span style={{ color: weekTints[w.tint] }}>
                  <WeekIcon tint={w.tint} />
                </span>
                <div>
                  <p className="roadmap-card-title">{w.title}</p>
                  <p className="roadmap-card-sub">
                    Week {w.number}{w.subtitle ? ` · ${w.subtitle}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-8" style={{ alignItems: 'center' }}>
                {w.type === 'exam' && <span className="badge badge-exam">Exam</span>}
                {w.needsApiKey && <span className="badge badge-api">API key</span>}
                {done && <span className="badge badge-done">Done</span>}
                {locked && (
                  <span className="badge" title={`Finish: ${missing.join(', ')}`}>🔒 Locked</span>
                )}
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}
