import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'
import KeyWarningBanner from '../../components/settings/KeyWarningBanner'
import SampleFallback from '../../components/shared/SampleFallback'
import { callAi } from '../../components/shared/AiCallWrapper'

function heuristicScore(prompt) {
  const length = prompt.trim().split(/\s+/).length
  const hasFormat = /(bullet|list|words|sentences|paragraph|table|steps)/i.test(prompt)
  const hasAudience = /(for|audience|beginner|expert|student|kid|professional)/i.test(prompt)
  const hasTask = /(write|explain|summarize|create|translate|list|describe|compare)/i.test(prompt)
  let score = 40
  if (length > 6) score += 15
  if (hasFormat) score += 15
  if (hasAudience) score += 15
  if (hasTask) score += 15
  return Math.min(100, score)
}

export default function Week05({ meta, progress, apiKeyState, onOpenSettings }) {
  const [prompt, setPrompt] = useState('Explain how photosynthesis works in 3 bullet points for a 10-year-old.')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const { hasAnyKey, activeProvider, currentKey } = apiKeyState

  const score = heuristicScore(prompt)

  async function run() {
    setLoading(true)
    try {
      const result = await callAi({ provider: activeProvider, apiKey: currentKey, prompt })
      setOutput(result)
    } catch (e) {
      setOutput(`Error: ${e.message}`)
    }
    setLoading(false)
  }

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Prompt sandbox</p>
      {!hasAnyKey && <KeyWarningBanner />}
      <div className="card mt-8">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: '100%', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 10, minHeight: 80 }}
        />

        <div className="mt-16">
          <div className="flex-between small text-dim">
            <span>Prompt clarity score</span>
            <span>{score}/100</span>
          </div>
          <div className="progress-bar-track mt-8">
            <div className="progress-bar-fill" style={{ width: `${score}%`, background: score > 70 ? 'var(--success)' : score > 45 ? 'var(--caution)' : 'var(--danger)' }} />
          </div>
          <p className="text-faint small mt-8">
            Heuristic check for: a clear task verb, an audience/context, a length or format constraint, and enough detail.
          </p>
        </div>

        {hasAnyKey ? (
          <>
            <button className="btn btn-primary btn-sm mt-16" onClick={run} disabled={loading}>
              {loading ? 'Running…' : 'Run this prompt'}
            </button>
            {output && (
              <div className="mt-16" style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                <p className="eyebrow text-faint">Output</p>
                <p className="small mt-8" style={{ whiteSpace: 'pre-wrap' }}>{output}</p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-16">
            <SampleFallback
              sampleOutput="Sample: a well-scored prompt like the one above would return a clean 3-bullet, kid-friendly explanation of photosynthesis."
              onOpenSettings={onOpenSettings}
            />
          </div>
        )}
      </div>
    </WeekLayout>
  )
}
