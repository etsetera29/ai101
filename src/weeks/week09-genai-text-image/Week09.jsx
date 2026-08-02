import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'
import KeyWarningBanner from '../../components/settings/KeyWarningBanner'
import SampleFallback from '../../components/shared/SampleFallback'
import { callAi } from '../../components/shared/AiCallWrapper'

const ARTICLE = `The city council approved a new bike lane network spanning twelve kilometers across downtown, funded jointly by national infrastructure grants and local revenue. Officials say the project, expected to finish within eighteen months, aims to reduce traffic congestion and cut commuter travel time by an estimated fifteen percent. Some local business owners have raised concerns about temporary road closures during construction, while cycling advocacy groups have praised the plan as long overdue.`

function moodPalette(prompt) {
  const p = prompt.toLowerCase()
  if (/(fire|sunset|warm|desert|autumn)/.test(p)) return ['#E8A23D', '#F0665E', '#7C6CF2']
  if (/(ocean|water|cold|winter|night|space)/.test(p)) return ['#4FB8E0', '#2FD5B8', '#7C6CF2']
  if (/(forest|nature|green|garden)/.test(p)) return ['#2FD5B8', '#7C6CF2', '#4FB8E0']
  return ['#7C6CF2', '#C77DE8', '#2FD5B8']
}

function MoodCanvas({ prompt }) {
  const colors = moodPalette(prompt)
  return (
    <svg width={280} height={160} style={{ borderRadius: 12, border: '1px solid var(--border)' }}>
      <rect width="280" height="160" fill="var(--bg-alt)" />
      <circle cx="70" cy="80" r="60" fill={colors[0]} opacity="0.55" />
      <circle cx="170" cy="60" r="50" fill={colors[1]} opacity="0.5" />
      <circle cx="200" cy="120" r="45" fill={colors[2]} opacity="0.45" />
    </svg>
  )
}

export default function Week09({ meta, progress, apiKeyState, onOpenSettings }) {
  const [textPrompt, setTextPrompt] = useState('Write a 2-sentence product tagline for a solar-powered backpack.')
  const [textOutput, setTextOutput] = useState('')
  const [imagePrompt, setImagePrompt] = useState('A quiet forest at sunrise, soft golden light')
  const [imageDescription, setImageDescription] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState({})
  const { hasAnyKey, activeProvider, currentKey } = apiKeyState

  async function run(key, fn) {
    setLoading((l) => ({ ...l, [key]: true }))
    try { await fn() } finally { setLoading((l) => ({ ...l, [key]: false })) }
  }

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Text generation</p>
      {!hasAnyKey && <KeyWarningBanner />}
      <div className="card mt-8">
        <textarea value={textPrompt} onChange={(e) => setTextPrompt(e.target.value)} style={{ width: '100%', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 10, minHeight: 60 }} />
        {hasAnyKey ? (
          <>
            <button className="btn btn-primary btn-sm mt-16" disabled={loading.text} onClick={() => run('text', async () => {
              const r = await callAi({ provider: activeProvider, apiKey: currentKey, prompt: textPrompt })
              setTextOutput(r)
            })}>{loading.text ? 'Generating…' : 'Generate'}</button>
            {textOutput && <p className="small mt-16" style={{ whiteSpace: 'pre-wrap' }}>{textOutput}</p>}
          </>
        ) : (
          <div className="mt-16"><SampleFallback sampleOutput='Sample: "Power every adventure — literally. The solar backpack that charges your gear while you explore."' onOpenSettings={onOpenSettings} /></div>
        )}
      </div>

      <p className="eyebrow text-dim mt-24">Image prompt lab</p>
      <div className="card mt-8">
        <p className="text-faint small">
          This lab doesn't call a dedicated image-generation API — it turns your prompt into a stylized mood
          palette so you can practice writing descriptive image prompts, plus (if connected) an AI description
          of what a well-crafted version of that image might look like.
        </p>
        <input type="text" value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} style={{ marginTop: 10 }} />
        <div className="mt-16"><MoodCanvas prompt={imagePrompt} /></div>
        {hasAnyKey && (
          <>
            <button className="btn btn-ghost btn-sm mt-16" disabled={loading.image} onClick={() => run('image', async () => {
              const r = await callAi({ provider: activeProvider, apiKey: currentKey, system: 'Describe, in vivid but concise language (2-3 sentences), what an image generated from this prompt would look like.', prompt: imagePrompt })
              setImageDescription(r)
            })}>{loading.image ? 'Describing…' : 'Describe the resulting image'}</button>
            {imageDescription && <p className="small mt-16 text-dim">{imageDescription}</p>}
          </>
        )}
      </div>

      <p className="eyebrow text-dim mt-24">Summarize this article</p>
      <div className="card mt-8">
        <p className="text-dim small" style={{ lineHeight: 1.6 }}>{ARTICLE}</p>
        {hasAnyKey ? (
          <>
            <button className="btn btn-primary btn-sm mt-16" disabled={loading.summary} onClick={() => run('summary', async () => {
              const r = await callAi({ provider: activeProvider, apiKey: currentKey, system: 'Summarize the given article in exactly 2 sentences.', prompt: ARTICLE })
              setSummary(r)
            })}>{loading.summary ? 'Summarizing…' : 'Summarize'}</button>
            {summary && <p className="small mt-16">{summary}</p>}
          </>
        ) : (
          <div className="mt-16"><SampleFallback sampleOutput="Sample: The city approved a 12km bike lane network to cut congestion and commute times by 15%, funded by national and local sources. It's set to finish in 18 months, with support from cyclists but concern from some businesses over construction disruption." onOpenSettings={onOpenSettings} /></div>
        )}
      </div>
    </WeekLayout>
  )
}
