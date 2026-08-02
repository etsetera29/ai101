import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'
import KeyWarningBanner from '../../components/settings/KeyWarningBanner'
import SampleFallback from '../../components/shared/SampleFallback'
import { callAi } from '../../components/shared/AiCallWrapper'

function labelFor(value, low, mid, high) {
  if (value < 34) return low
  if (value < 67) return mid
  return high
}

export default function Week15({ meta, progress, apiKeyState, onOpenSettings }) {
  const [compute, setCompute] = useState(50)
  const [regulation, setRegulation] = useState(50)
  const [adoption, setAdoption] = useState(50)
  const [scenario, setScenario] = useState('')
  const [loading, setLoading] = useState(false)
  const { hasAnyKey, activeProvider, currentKey } = apiKeyState

  const computeLabel = labelFor(compute, 'slow, incremental compute growth', 'steady compute growth', 'rapid compute breakthroughs (e.g. quantum-assisted)')
  const regulationLabel = labelFor(regulation, 'minimal regulation', 'moderate, sector-specific regulation', 'strict international governance')
  const adoptionLabel = labelFor(adoption, 'cautious, slow adoption', 'steady mainstream adoption', 'near-universal rapid adoption')

  async function generate() {
    setLoading(true)
    try {
      const r = await callAi({
        provider: activeProvider,
        apiKey: currentKey,
        system: 'You write short, grounded, plausible (not sci-fi exaggerated) 4-6 sentence narratives about a possible AI future 5-10 years out, based on three input conditions. Stay realistic and balanced — mention both an opportunity and a tension/risk.',
        prompt: `Compute trend: ${computeLabel}. Regulation trend: ${regulationLabel}. Adoption trend: ${adoptionLabel}. Write the scenario.`,
      })
      setScenario(r)
    } catch (e) {
      setScenario(`Error: ${e.message}`)
    }
    setLoading(false)
  }

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Scenario builder</p>
      {!hasAnyKey && <KeyWarningBanner />}
      <div className="card mt-8">
        {[
          { label: `Compute power — ${computeLabel}`, value: compute, set: setCompute },
          { label: `Regulation — ${regulationLabel}`, value: regulation, set: setRegulation },
          { label: `Adoption speed — ${adoptionLabel}`, value: adoption, set: setAdoption },
        ].map((s) => (
          <div className="field" key={s.label}>
            <label>{s.label}</label>
            <input type="range" min="0" max="100" value={s.value} onChange={(e) => s.set(Number(e.target.value))} style={{ width: '100%' }} />
          </div>
        ))}

        {hasAnyKey ? (
          <>
            <button className="btn btn-primary btn-sm" disabled={loading} onClick={generate}>{loading ? 'Writing scenario…' : 'Generate scenario'}</button>
            {scenario && <p className="small mt-16" style={{ whiteSpace: 'pre-wrap' }}>{scenario}</p>}
          </>
        ) : (
          <SampleFallback
            sampleOutput="Sample: With steady compute growth, moderate regulation, and mainstream adoption, AI copilots become standard in most white-collar jobs by the early 2030s — boosting productivity, but also sharpening debates over which tasks should still require a human sign-off."
            onOpenSettings={onOpenSettings}
          />
        )}
      </div>
    </WeekLayout>
  )
}
