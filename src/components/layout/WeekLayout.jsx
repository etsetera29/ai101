import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import weekMeta from '../../data/weekMeta.json'
import FinishedLessonButton from '../shared/FinishedLessonButton'

export default function WeekLayout({ meta, progress, children, showReflection = true }) {
  const navigate = useNavigate()
  const [reflection, setReflection] = useState(() => localStorage.getItem(`ai101-reflection-${meta.id}`) || '')
  const idx = weekMeta.findIndex((w) => w.id === meta.id)
  const next = weekMeta[idx + 1]

  const slug = meta.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  return (
    <div className="container">
      <div className="week-terminal-header font-mono">
        <span className="text-faint">field-log</span>
        <span className="text-faint"> ~ </span>
        <span className="path">week{meta.number.replace('–', '-')}/{slug}</span>
        <span className="cursor" />
      </div>

      <h1 className="week-title">{meta.title}</h1>
      {meta.guidingQuestion && <p className="week-question">{meta.guidingQuestion}</p>}

      <div className="simulation-block">{children}</div>

      {showReflection && (
        <div className="reflection-box">
          <p className="eyebrow text-dim">Reflection</p>
          <p className="small text-faint mt-8" style={{ margin: '8px 0 0' }}>
            In a sentence or two — what's one thing from this lesson you could apply right away?
          </p>
          <textarea
            value={reflection}
            onChange={(e) => {
              setReflection(e.target.value)
              localStorage.setItem(`ai101-reflection-${meta.id}`, e.target.value)
            }}
            placeholder="Type your reflection here — it's saved automatically on this device."
          />
        </div>
      )}

      <div className="week-footer">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>← Back to log</button>
        <FinishedLessonButton
          weekId={meta.id}
          isFinished={progress.isFinished(meta.id)}
          onFinish={progress.markFinished}
          nextPath={next?.path}
          nextLabel={next ? `Continue to ${next.type === 'exam' ? next.title : 'Week ' + next.number} →` : undefined}
        />
      </div>
    </div>
  )
}
