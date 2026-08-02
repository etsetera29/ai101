import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'

const STATEMENTS = [
  { text: 'The Philippines consists of over 7,000 islands.', real: true },
  { text: 'The first AI winner of the Nobel Prize in Literature was announced in 2019.', real: false },
  { text: 'Water boils at 100°C at standard sea-level atmospheric pressure.', real: true },
  { text: 'The Great Wall of China is visible to the naked eye from the Moon.', real: false, note: 'A persistent myth — it is not actually visible from the Moon without aid.' },
  { text: 'Manila is the capital of the Philippines.', real: true },
  { text: 'A study found that the average person uses only 10% of their brain.', real: false, note: 'A popular myth; brain imaging shows most of the brain is active over a day.' },
]

const DEEPFAKE_QUIZ = [
  {
    q: 'A video shows a public figure saying something shocking, but their mouth movements look slightly out of sync with the audio. What\'s the safest first step?',
    options: ['Share it immediately since it looks real', 'Check trusted fact-checking sources before believing or sharing it', 'Assume it must be true because it\'s on video', 'Ignore the mismatch — video is always reliable'],
    correct: 1,
  },
  {
    q: 'Which is a common technical sign that an image might be AI-generated?',
    options: ['Perfectly natural hands and fingers in every case', 'Inconsistent lighting, warped backgrounds, or unnatural details (e.g., odd hands, blended jewelry)', 'The image being in color', 'The image having a visible watermark from a camera brand'],
    correct: 1,
  },
  {
    q: 'Why is media literacy considered a defense against deepfakes, rather than a specific piece of software?',
    options: ['Because no detection tool is perfect, so critical evaluation habits help across all situations', 'Because software is never useful against deepfakes', 'Because deepfakes are always obvious to everyone', 'Because media literacy replaces the need for verification entirely'],
    correct: 0,
  },
]

export default function Week11({ meta, progress }) {
  const [revealed, setRevealed] = useState({})
  const [quizAnswers, setQuizAnswers] = useState({})

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Spot the hallucination</p>
      <p className="text-faint small mt-8">Some of these statements are true, some are fabricated-sounding claims. Guess before revealing.</p>
      <div className="flex-col gap-12 mt-16">
        {STATEMENTS.map((s, i) => (
          <div key={i} className="card">
            <p className="small">{s.text}</p>
            {revealed[i] === undefined ? (
              <div className="flex gap-8 mt-16">
                <button className="btn btn-sm" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }} onClick={() => setRevealed((r) => ({ ...r, [i]: 'real' }))}>Real</button>
                <button className="btn btn-sm" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }} onClick={() => setRevealed((r) => ({ ...r, [i]: 'fake' }))}>Fabricated</button>
              </div>
            ) : (
              <p className="small mt-16" style={{ color: (revealed[i] === 'real') === s.real ? 'var(--success)' : 'var(--danger)' }}>
                {s.real ? '✓ This is real.' : '✗ This is a fabrication/myth.'} {s.note || ''}
                {(revealed[i] === 'real') === s.real ? ' You guessed right.' : ' Your guess was off — worth double-checking claims like this.'}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="eyebrow text-dim mt-24">Deepfake awareness quiz</p>
      <div className="flex-col gap-12 mt-16">
        {DEEPFAKE_QUIZ.map((q, i) => (
          <div key={i} className="card">
            <p className="small">{q.q}</p>
            <div className="flex-col gap-8 mt-16">
              {q.options.map((opt, oi) => {
                const chosen = quizAnswers[i]
                const isSelected = chosen === oi
                const showCorrect = chosen !== undefined && oi === q.correct
                return (
                  <button
                    key={oi}
                    className="option-item"
                    style={{
                      borderColor: showCorrect ? 'var(--success)' : isSelected ? 'var(--danger)' : 'var(--border)',
                      background: showCorrect ? 'var(--success-soft)' : isSelected ? 'var(--danger-soft)' : 'var(--surface)',
                    }}
                    onClick={() => setQuizAnswers((a) => ({ ...a, [i]: oi }))}
                  >
                    <span className="small">{opt}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </WeekLayout>
  )
}
