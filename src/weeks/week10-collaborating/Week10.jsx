import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'
import KeyWarningBanner from '../../components/settings/KeyWarningBanner'
import SampleFallback from '../../components/shared/SampleFallback'
import { callAi } from '../../components/shared/AiCallWrapper'

const CODE_SUGGESTIONS = [
  { before: 'function total(items) {\n  // TODO: sum item prices\n}', suggestion: 'function total(items) {\n  return items.reduce((sum, i) => sum + i.price, 0);\n}', verdict: 'good', note: 'Correct and idiomatic — safe to accept.' },
  { before: 'function isAdult(age) {\n  // TODO\n}', suggestion: 'function isAdult(age) {\n  return age > 18;\n}', verdict: 'flaw', note: 'Off-by-one: most definitions treat exactly 18 as an adult too — should be >= 18. A good reason to review before accepting.' },
  { before: 'function greet(name) {\n  // TODO\n}', suggestion: 'function greet(name) {\n  console.log(`Hello, ${name.toUpperCase()}!`);\n}', verdict: 'flaw', note: 'Works, but silently assumes `name` is always a defined string — no fallback if it\'s undefined.' },
]

export default function Week10({ meta, progress, apiKeyState, onOpenSettings }) {
  const [topic, setTopic] = useState('Ideas for a student org fundraiser')
  const [ideas, setIdeas] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviewIndex, setReviewIndex] = useState(0)
  const [decisions, setDecisions] = useState({})
  const { hasAnyKey, activeProvider, currentKey } = apiKeyState

  async function brainstorm() {
    setLoading(true)
    try {
      const r = await callAi({
        provider: activeProvider,
        apiKey: currentKey,
        system: 'Brainstorm 5 concise, distinct ideas for the given topic as a numbered list. No extra commentary.',
        prompt: topic,
      })
      setIdeas(r)
    } catch (e) {
      setIdeas(`Error: ${e.message}`)
    }
    setLoading(false)
  }

  const current = CODE_SUGGESTIONS[reviewIndex]

  function decide(choice) {
    setDecisions((d) => ({ ...d, [reviewIndex]: choice }))
  }

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Brainstorm assistant</p>
      {!hasAnyKey && <KeyWarningBanner />}
      <div className="card mt-8">
        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} />
        {hasAnyKey ? (
          <>
            <button className="btn btn-primary btn-sm mt-16" disabled={loading} onClick={brainstorm}>{loading ? 'Brainstorming…' : 'Get 5 ideas'}</button>
            {ideas && <p className="small mt-16" style={{ whiteSpace: 'pre-wrap' }}>{ideas}</p>}
          </>
        ) : (
          <div className="mt-16"><SampleFallback sampleOutput={'Sample:\n1. Themed food stall night\n2. Charity fun run\n3. Talent show with entry fee\n4. Merch pre-order drive\n5. Raffle with donated prizes'} onOpenSettings={onOpenSettings} /></div>
        )}
      </div>

      <p className="eyebrow text-dim mt-24">Pair-coding: accept or reject the suggestion</p>
      <div className="card mt-8">
        <p className="text-faint small">
          An AI coding assistant filled in each TODO. You decide whether to accept, reject, or edit — that's
          the human oversight this week is about.
        </p>
        <pre style={{ background: 'var(--bg-alt)', padding: 10, borderRadius: 8, fontSize: '0.82rem', marginTop: 10, overflowX: 'auto' }}>{current.before}</pre>
        <p className="eyebrow text-faint mt-16">AI suggests:</p>
        <pre style={{ background: 'var(--bg-alt)', padding: 10, borderRadius: 8, fontSize: '0.82rem', color: 'var(--accent)', overflowX: 'auto' }}>{current.suggestion}</pre>

        {decisions[reviewIndex] ? (
          <p className="small mt-16" style={{ color: current.verdict === 'good' ? 'var(--success)' : 'var(--caution)' }}>
            You chose to {decisions[reviewIndex]}. {current.note}
          </p>
        ) : (
          <div className="flex gap-8 mt-16">
            <button className="btn btn-success btn-sm" onClick={() => decide('accept')}>Accept</button>
            <button className="btn btn-danger btn-sm" onClick={() => decide('reject')}>Reject</button>
          </div>
        )}

        <div className="flex gap-8 mt-16">
          <button className="btn btn-ghost btn-sm" disabled={reviewIndex === 0} onClick={() => setReviewIndex((i) => i - 1)}>← Prev</button>
          <button className="btn btn-ghost btn-sm" disabled={reviewIndex === CODE_SUGGESTIONS.length - 1} onClick={() => setReviewIndex((i) => i + 1)}>Next →</button>
          <span className="small text-faint" style={{ alignSelf: 'center' }}>{reviewIndex + 1}/{CODE_SUGGESTIONS.length}</span>
        </div>
      </div>
    </WeekLayout>
  )
}
