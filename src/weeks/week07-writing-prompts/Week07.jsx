import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'
import KeyWarningBanner from '../../components/settings/KeyWarningBanner'
import SampleFallback from '../../components/shared/SampleFallback'
import { callAi } from '../../components/shared/AiCallWrapper'

const TEMPLATES = {
  instructional: 'Summarize this paragraph in exactly 3 bullet points, in plain English:\n\n"Photosynthesis is the process plants use to convert light energy into chemical energy stored in glucose, releasing oxygen as a byproduct."',
  conversational: "Hey! Can you help me understand this paragraph better and maybe break it down for me? \"Photosynthesis is the process plants use to convert light energy into chemical energy stored in glucose, releasing oxygen as a byproduct.\"",
  fewshot: 'Follow this style:\nInput: "Water boils at 100°C at sea level." → Output: "🌡️ Water boils at 100°C (sea level)."\n\nNow do the same for: "Photosynthesis converts light energy into chemical energy stored in glucose."',
}

export default function Week07({ meta, progress, apiKeyState, onOpenSettings }) {
  const [promptA, setPromptA] = useState(TEMPLATES.instructional)
  const [promptB, setPromptB] = useState(TEMPLATES.conversational)
  const [outputA, setOutputA] = useState('')
  const [outputB, setOutputB] = useState('')
  const [loading, setLoading] = useState(false)
  const { hasAnyKey, activeProvider, currentKey } = apiKeyState

  async function runDuel() {
    setLoading(true)
    setOutputA(''); setOutputB('')
    try {
      const [a, b] = await Promise.all([
        callAi({ provider: activeProvider, apiKey: currentKey, prompt: promptA }),
        callAi({ provider: activeProvider, apiKey: currentKey, prompt: promptB }),
      ])
      setOutputA(a); setOutputB(b)
    } catch (e) {
      setOutputA(`Error: ${e.message}`)
    }
    setLoading(false)
  }

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Prompt duel</p>
      {!hasAnyKey && <KeyWarningBanner />}
      <div className="flex gap-8 mt-8" style={{ flexWrap: 'wrap' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setPromptA(TEMPLATES.instructional)}>Load instructional</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setPromptA(TEMPLATES.fewshot)}>Load few-shot</button>
        <button className="btn btn-ghost btn-sm" onClick={() => setPromptB(TEMPLATES.conversational)}>Load conversational →B</button>
      </div>

      <div className="mt-16" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div className="card">
          <p className="eyebrow text-faint">Prompt A</p>
          <textarea value={promptA} onChange={(e) => setPromptA(e.target.value)} style={{ width: '100%', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 10, minHeight: 90, marginTop: 8 }} />
          {outputA && <div className="mt-16" style={{ background: 'var(--bg-alt)', borderRadius: 8, padding: 10 }}><p className="small" style={{ whiteSpace: 'pre-wrap' }}>{outputA}</p></div>}
        </div>
        <div className="card">
          <p className="eyebrow text-faint">Prompt B</p>
          <textarea value={promptB} onChange={(e) => setPromptB(e.target.value)} style={{ width: '100%', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 10, minHeight: 90, marginTop: 8 }} />
          {outputB && <div className="mt-16" style={{ background: 'var(--bg-alt)', borderRadius: 8, padding: 10 }}><p className="small" style={{ whiteSpace: 'pre-wrap' }}>{outputB}</p></div>}
        </div>
      </div>

      {hasAnyKey ? (
        <button className="btn btn-primary mt-16" onClick={runDuel} disabled={loading}>
          {loading ? 'Running both…' : 'Run the duel'}
        </button>
      ) : (
        <div className="mt-16">
          <SampleFallback
            sampleOutput="Sample: the instructional prompt tends to return a clean 3-bullet summary; the conversational one often returns a more meandering, chattier explanation of the same content."
            onOpenSettings={onOpenSettings}
          />
        </div>
      )}
    </WeekLayout>
  )
}
