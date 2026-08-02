import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'

const TIMELINE = [
  { year: '1950', label: 'Turing Test proposed', detail: 'Alan Turing asks "Can machines think?" and proposes a test of human-indistinguishable behavior.' },
  { year: '1956', label: 'Dartmouth Conference', detail: 'The term "Artificial Intelligence" is coined at a workshop organized by John McCarthy and colleagues.' },
  { year: '1970s', label: 'First AI winter', detail: 'Overpromised results lead to reduced funding and interest in AI research.' },
  { year: '1997', label: 'Deep Blue beats Kasparov', detail: 'IBM\'s chess engine defeats a reigning world champion — narrow AI excelling at one task.' },
  { year: '2012', label: 'Deep learning breakthrough', detail: 'Neural networks trained on large datasets dramatically improve image recognition.' },
  { year: '2020s', label: 'Generative AI goes mainstream', detail: 'Tools like ChatGPT and image generators put AI in everyday hands.' },
]

const TOOLS = [
  { name: 'Siri / Google Assistant', answer: 'narrow' },
  { name: 'Netflix recommendations', answer: 'narrow' },
  { name: 'Spam email filter', answer: 'narrow' },
  { name: 'A hypothetical AI reasoning across any subject like a human', answer: 'general' },
  { name: 'Chess-playing engine', answer: 'narrow' },
  { name: 'A hypothetical AI exceeding all human intelligence', answer: 'super' },
]

const CATEGORIES = [
  { id: 'narrow', label: 'Narrow AI', desc: 'One task, done well' },
  { id: 'general', label: 'General AI (AGI)', desc: 'Human-level, any task — hypothetical' },
  { id: 'super', label: 'Superintelligence', desc: 'Beyond human, any task — hypothetical' },
]

export default function Week01({ meta, progress }) {
  const [placed, setPlaced] = useState({})
  const [activeYear, setActiveYear] = useState(0)

  function place(toolIdx, categoryId) {
    setPlaced((prev) => ({ ...prev, [toolIdx]: categoryId }))
  }

  const correctCount = TOOLS.filter((t, i) => placed[i] === t.answer).length

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Timeline explorer</p>
      <div className="card mt-8">
        <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
          {TIMELINE.map((t, i) => (
            <button
              key={t.year}
              className="btn btn-sm"
              style={{
                background: i === activeYear ? 'var(--accent)' : 'var(--surface-raised)',
                color: i === activeYear ? '#fff' : 'var(--text-dim)',
                border: '1px solid var(--border)',
              }}
              onClick={() => setActiveYear(i)}
            >
              {t.year}
            </button>
          ))}
        </div>
        <h3 className="mt-16" style={{ margin: '16px 0 6px' }}>{TIMELINE[activeYear].label}</h3>
        <p className="text-dim small" style={{ margin: 0 }}>{TIMELINE[activeYear].detail}</p>
      </div>

      <p className="eyebrow text-dim mt-24">Sorting game — classify each real-world tool</p>
      <div className="card mt-8">
        <p className="text-dim small mt-8">
          Tap a category for each tool below. {correctCount}/{TOOLS.length} correctly classified.
        </p>
        <div className="flex-col gap-12 mt-16">
          {TOOLS.map((tool, i) => (
            <div key={tool.name} className="flex-between" style={{ flexWrap: 'wrap', gap: 8 }}>
              <span className="small">{tool.name}</span>
              <div className="flex gap-8">
                {CATEGORIES.map((c) => {
                  const selected = placed[i] === c.id
                  const showResult = selected
                  const correct = tool.answer === c.id
                  return (
                    <button
                      key={c.id}
                      className="btn btn-sm"
                      style={{
                        border: `1px solid ${showResult ? (correct ? 'var(--success)' : 'var(--danger)') : 'var(--border)'}`,
                        background: showResult ? (correct ? 'var(--success-soft)' : 'var(--danger-soft)') : 'var(--surface)',
                        color: 'var(--text-dim)',
                      }}
                      onClick={() => place(i, c.id)}
                    >
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WeekLayout>
  )
}
