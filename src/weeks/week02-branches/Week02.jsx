import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'
import WeekIcon from '../../components/shared/WeekIcon'

const BRANCHES = [
  { id: 'ml', name: 'Machine Learning', desc: 'Systems that learn patterns from data rather than following fixed rules.' },
  { id: 'nlp', name: 'Natural Language Processing', desc: 'Understanding and generating human language — text and speech.' },
  { id: 'cv', name: 'Computer Vision', desc: 'Interpreting visual information from images or video.' },
  { id: 'robotics', name: 'Robotics', desc: 'AI combined with physical hardware that senses and acts in the real world.' },
  { id: 'expert', name: 'Expert Systems', desc: 'Rule-based programs that emulate a human expert\'s decision-making.' },
]

const USE_CASES = [
  { case: 'Diagnosing disease from an X-ray', answer: 'cv' },
  { case: 'A tax-advice tool following accountant-style rules', answer: 'expert' },
  { case: 'A customer chatbot answering in plain English', answer: 'nlp' },
  { case: 'A recommendation engine learning from purchase history', answer: 'ml' },
  { case: 'A warehouse robot sorting packages', answer: 'robotics' },
]

export default function Week02({ meta, progress }) {
  const [openCard, setOpenCard] = useState('ml')
  const [matches, setMatches] = useState({})

  const correctCount = USE_CASES.filter((u, i) => matches[i] === u.answer).length

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Explore a branch</p>
      <div className="flex gap-8 mt-8" style={{ flexWrap: 'wrap' }}>
        {BRANCHES.map((b) => (
          <button
            key={b.id}
            className="btn btn-sm"
            style={{
              background: openCard === b.id ? 'var(--accent)' : 'var(--surface)',
              color: openCard === b.id ? '#fff' : 'var(--text-dim)',
              border: '1px solid var(--border)',
            }}
            onClick={() => setOpenCard(b.id)}
          >
            {b.name}
          </button>
        ))}
      </div>
      <div className="card mt-16">
        <div className="flex gap-12" style={{ alignItems: 'center' }}>
          <WeekIcon tint="foundations" size={26} />
          <h3 style={{ margin: 0 }}>{BRANCHES.find((b) => b.id === openCard).name}</h3>
        </div>
        <p className="text-dim small mt-8">{BRANCHES.find((b) => b.id === openCard).desc}</p>
      </div>

      <p className="eyebrow text-dim mt-24">Match the branch to the use case</p>
      <div className="card mt-8">
        <p className="text-dim small">{correctCount}/{USE_CASES.length} matched correctly.</p>
        <div className="flex-col gap-12 mt-16">
          {USE_CASES.map((u, i) => (
            <div key={u.case} className="flex-between" style={{ flexWrap: 'wrap', gap: 8 }}>
              <span className="small">{u.case}</span>
              <select
                value={matches[i] || ''}
                onChange={(e) => setMatches((prev) => ({ ...prev, [i]: e.target.value }))}
                style={{
                  width: 'auto',
                  borderColor: matches[i] ? (matches[i] === u.answer ? 'var(--success)' : 'var(--danger)') : 'var(--border)',
                }}
              >
                <option value="">Choose branch…</option>
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </WeekLayout>
  )
}
