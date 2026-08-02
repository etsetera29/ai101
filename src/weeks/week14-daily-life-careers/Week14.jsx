import { useMemo, useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'

const CONTENT = [
  { title: 'Intro to Machine Learning', tags: ['tech', 'learning'] },
  { title: 'True Crime Weekly', tags: ['drama', 'audio'] },
  { title: 'Cooking with AI Assistants', tags: ['tech', 'lifestyle'] },
  { title: 'Indie Sci-Fi Shorts', tags: ['drama', 'scifi'] },
  { title: 'Prompt Engineering 101', tags: ['tech', 'learning'] },
  { title: 'World Music Discovery', tags: ['audio', 'lifestyle'] },
  { title: 'AI Ethics Roundtable', tags: ['tech', 'learning', 'drama'] },
  { title: 'Space Documentaries', tags: ['scifi', 'learning'] },
]

const PREFS = ['tech', 'drama', 'scifi', 'learning', 'audio', 'lifestyle']

const CAREERS = [
  { interest: 'I like writing and explaining things clearly', career: 'AI content strategist / conversational AI designer' },
  { interest: 'I enjoy debating what\'s fair and thinking about consequences', career: 'AI ethics consultant / policy analyst' },
  { interest: 'I like building and fixing things', career: 'Machine learning engineer / AI systems developer' },
  { interest: 'I enjoy explaining complex ideas to non-experts', career: 'AI product manager / trainer' },
  { interest: 'I like working with data and patterns', career: 'Data analyst with AI tooling specialization' },
]

export default function Week14({ meta, progress }) {
  const [selected, setSelected] = useState(['tech', 'learning'])
  const [careerPick, setCareerPick] = useState(null)

  function toggle(p) {
    setSelected((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]))
  }

  const recommended = useMemo(() => {
    return CONTENT
      .map((c) => ({ ...c, score: c.tags.filter((t) => selected.includes(t)).length }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
  }, [selected])

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Recommendation engine demo</p>
      <div className="card mt-8">
        <p className="text-faint small">Pick a few interests and watch the "recommended for you" list update live — this is the same basic idea behind streaming and shopping recommendations.</p>
        <div className="flex gap-8 mt-16" style={{ flexWrap: 'wrap' }}>
          {PREFS.map((p) => (
            <button
              key={p}
              className="btn btn-sm"
              style={{
                background: selected.includes(p) ? 'var(--accent)' : 'var(--surface)',
                color: selected.includes(p) ? '#fff' : 'var(--text-dim)',
                border: '1px solid var(--border)',
                textTransform: 'capitalize',
              }}
              onClick={() => toggle(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-16 flex-col gap-8">
          {recommended.length === 0 && <p className="text-faint small">No matches — pick at least one interest.</p>}
          {recommended.map((c) => (
            <div key={c.title} className="flex-between small" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{c.title}</span>
              <span className="badge">{c.score} match{c.score > 1 ? 'es' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="eyebrow text-dim mt-24">Careers explorer</p>
      <div className="card mt-8">
        <p className="text-faint small">Tap what sounds most like you.</p>
        <div className="flex-col gap-8 mt-16">
          {CAREERS.map((c, i) => (
            <button
              key={i}
              className="option-item"
              style={{ borderColor: careerPick === i ? 'var(--accent)' : 'var(--border)', background: careerPick === i ? 'var(--accent-soft)' : 'var(--surface)' }}
              onClick={() => setCareerPick(i)}
            >
              <span className="small">{c.interest}</span>
            </button>
          ))}
        </div>
        {careerPick !== null && (
          <p className="small mt-16" style={{ color: 'var(--success)' }}>
            A path worth exploring: <strong>{CAREERS[careerPick].career}</strong>
          </p>
        )}
      </div>
    </WeekLayout>
  )
}
