import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'
import KeyWarningBanner from '../../components/settings/KeyWarningBanner'
import SampleFallback from '../../components/shared/SampleFallback'
import { callAi } from '../../components/shared/AiCallWrapper'

const SCENARIOS = [
  {
    title: 'Hiring tool',
    text: 'An AI resume screener trained on 10 years of past hires ranks candidates from certain schools consistently lower — schools the company historically just didn\'t recruit from, not ones tied to weaker performance.',
    critique: 'This reflects historical bias: the model learned "who we hired before" rather than "who performs well," penalizing candidates for a pattern that reflects past recruiting gaps rather than merit.',
  },
  {
    title: 'Facial recognition',
    text: 'A facial recognition system shows noticeably higher error rates for darker skin tones because its training images were overwhelmingly of lighter-skinned faces.',
    critique: 'This is representation bias: an unrepresentative training dataset causes the model to perform unevenly across groups — a well-documented issue in early facial recognition systems.',
  },
  {
    title: 'Loan approval',
    text: 'A loan-approval model uses zip code as an input feature, which ends up closely correlating with race due to historical housing patterns, even though race is never used directly.',
    critique: 'This is proxy discrimination: a seemingly neutral feature (zip code) can act as a stand-in for a protected characteristic, producing biased outcomes even without using that characteristic directly.',
  },
]

export default function Week08({ meta, progress, apiKeyState, onOpenSettings }) {
  const [openScenario, setOpenScenario] = useState(null)
  const [debateTopic, setDebateTopic] = useState('Should AI-generated art be considered original work?')
  const [myArgument, setMyArgument] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const { hasAnyKey, activeProvider, currentKey } = apiKeyState

  async function getCounter() {
    if (!myArgument.trim()) return
    setLoading(true)
    try {
      const result = await callAi({
        provider: activeProvider,
        apiKey: currentKey,
        system: `You are a thoughtful devil's advocate in a classroom debate on: "${debateTopic}". Respond to the student's argument with a concise, respectful counter-argument (3-4 sentences), then end with one question that pushes their thinking further.`,
        prompt: myArgument,
      })
      setReply(result)
    } catch (e) {
      setReply(`Error: ${e.message}`)
    }
    setLoading(false)
  }

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Spot the bias — scenario critique</p>
      <div className="flex-col gap-12 mt-8">
        {SCENARIOS.map((s, i) => (
          <div key={s.title} className="card">
            <p className="roadmap-card-title">{s.title}</p>
            <p className="text-dim small mt-8">{s.text}</p>
            {openScenario === i ? (
              <p className="small mt-16" style={{ color: 'var(--success)' }}>{s.critique}</p>
            ) : (
              <button className="btn btn-ghost btn-sm mt-16" onClick={() => setOpenScenario(i)}>Reveal the critique</button>
            )}
          </div>
        ))}
      </div>

      <p className="eyebrow text-dim mt-24">Debate tool — AI as devil's advocate</p>
      {!hasAnyKey && <KeyWarningBanner />}
      <div className="card mt-8">
        <div className="field">
          <label>Debate topic</label>
          <input type="text" value={debateTopic} onChange={(e) => setDebateTopic(e.target.value)} />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Your argument</label>
          <textarea
            value={myArgument}
            onChange={(e) => setMyArgument(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 10, minHeight: 70 }}
            placeholder="State your position…"
          />
        </div>
        {hasAnyKey ? (
          <>
            <button className="btn btn-primary btn-sm mt-16" onClick={getCounter} disabled={loading}>
              {loading ? 'Thinking…' : 'Get a counter-argument'}
            </button>
            {reply && <div className="mt-16" style={{ background: 'var(--bg-alt)', borderRadius: 8, padding: 10 }}><p className="small" style={{ whiteSpace: 'pre-wrap' }}>{reply}</p></div>}
          </>
        ) : (
          <div className="mt-16">
            <SampleFallback
              sampleOutput="Sample counter: “If we credit AI-generated art as fully original, we may undervalue human creative labor and blur authorship. Who deserves credit — the prompter, the model's creators, or neither? What would ‘originality’ even mean for a system trained on millions of existing works?”"
              onOpenSettings={onOpenSettings}
            />
          </div>
        )}
      </div>
    </WeekLayout>
  )
}
