import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'
import KeyWarningBanner from '../../components/settings/KeyWarningBanner'
import SampleFallback from '../../components/shared/SampleFallback'
import { callAi } from '../../components/shared/AiCallWrapper'

const POSITIVE = ['good', 'great', 'love', 'excellent', 'amazing', 'happy', 'best', 'awesome', 'like', 'wonderful']
const NEGATIVE = ['bad', 'terrible', 'hate', 'worst', 'awful', 'sad', 'poor', 'disappointing', 'dislike', 'horrible']

function localSentiment(text) {
  const words = text.toLowerCase().split(/\W+/)
  let score = 0
  words.forEach((w) => {
    if (POSITIVE.includes(w)) score += 1
    if (NEGATIVE.includes(w)) score -= 1
  })
  if (score > 0) return { label: 'Positive', score }
  if (score < 0) return { label: 'Negative', score }
  return { label: 'Neutral', score }
}

const RULE_RESPONSES = {
  hello: "Hello! I can only respond to a few exact keywords like 'hours', 'price', or 'help'.",
  hours: 'We are open 9am–6pm, Monday to Friday.',
  price: 'Our starter plan is $10/month.',
  help: 'Please type one of: hello, hours, price.',
}

export default function Week04({ meta, progress, apiKeyState, onOpenSettings }) {
  const [sentimentInput, setSentimentInput] = useState('I really love how this app works, it is amazing!')
  const [translateInput, setTranslateInput] = useState('Good morning, how are you today?')
  const [translateOutput, setTranslateOutput] = useState('')
  const [translateLoading, setTranslateLoading] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatLog, setChatLog] = useState([])

  const sentiment = localSentiment(sentimentInput)
  const { hasAnyKey, activeProvider, currentKey } = apiKeyState

  async function runTranslation() {
    if (!hasAnyKey) return
    setTranslateLoading(true)
    try {
      const result = await callAi({
        provider: activeProvider,
        apiKey: currentKey,
        system: 'You are a translation engine. Translate the given text to Filipino (Tagalog). Reply with only the translation, nothing else.',
        prompt: translateInput,
      })
      setTranslateOutput(result)
    } catch (e) {
      setTranslateOutput(`Error: ${e.message}`)
    }
    setTranslateLoading(false)
  }

  async function sendChat() {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatLog((log) => [...log, { from: 'user', text: userMsg }])
    setChatInput('')

    const ruleReply = RULE_RESPONSES[userMsg.toLowerCase()] || "Sorry, I don't understand that exact phrase."
    setChatLog((log) => [...log, { from: 'rule', text: ruleReply }])

    if (hasAnyKey) {
      try {
        const aiReply = await callAi({
          provider: activeProvider,
          apiKey: currentKey,
          system: 'You are a friendly, concise customer support assistant. Answer in 1-2 sentences.',
          prompt: userMsg,
        })
        setChatLog((log) => [...log, { from: 'ai', text: aiReply }])
      } catch (e) {
        setChatLog((log) => [...log, { from: 'ai', text: `Error: ${e.message}` }])
      }
    }
  }

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Sentiment analysis</p>
      <div className="card mt-8">
        <textarea
          value={sentimentInput}
          onChange={(e) => setSentimentInput(e.target.value)}
          style={{ width: '100%', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 10, minHeight: 60 }}
        />
        <p className="mt-16">
          Detected tone: <strong style={{ color: sentiment.label === 'Positive' ? 'var(--success)' : sentiment.label === 'Negative' ? 'var(--danger)' : 'var(--text-dim)' }}>{sentiment.label}</strong>
          <span className="text-faint small"> (this runs a simple local keyword heuristic — connect an API key for more nuanced results)</span>
        </p>
      </div>

      <p className="eyebrow text-dim mt-24">Live translation (English → Filipino)</p>
      {!hasAnyKey && <KeyWarningBanner />}
      <div className="card mt-8">
        <textarea
          value={translateInput}
          onChange={(e) => setTranslateInput(e.target.value)}
          style={{ width: '100%', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 10, minHeight: 50 }}
        />
        {hasAnyKey ? (
          <>
            <button className="btn btn-primary btn-sm mt-16" onClick={runTranslation} disabled={translateLoading}>
              {translateLoading ? 'Translating…' : 'Translate'}
            </button>
            {translateOutput && <p className="mt-16 text-dim">{translateOutput}</p>}
          </>
        ) : (
          <SampleFallback
            sampleOutput='Sample: "Good morning, how are you today?" → "Magandang umaga, kumusta ka ngayon?"'
            onOpenSettings={onOpenSettings}
          />
        )}
      </div>

      <p className="eyebrow text-dim mt-24">Chatbot comparison — rule-based vs. AI</p>
      <div className="card mt-8">
        <p className="text-faint small">
          Try typing "hello", "hours", or "price" to see the rule-based bot succeed — then try a free-form
          question to see it fail while the AI (if connected) handles it.
        </p>
        <div className="flex-col gap-8 mt-16" style={{ maxHeight: 220, overflowY: 'auto' }}>
          {chatLog.map((m, i) => (
            <div key={i} className="small" style={{ color: m.from === 'user' ? 'var(--text)' : m.from === 'rule' ? 'var(--caution)' : 'var(--accent)' }}>
              <strong>{m.from === 'user' ? 'You' : m.from === 'rule' ? 'Rule-bot' : 'AI'}:</strong> {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-8 mt-16">
          <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message…" onKeyDown={(e) => e.key === 'Enter' && sendChat()} />
          <button className="btn btn-primary btn-sm" onClick={sendChat}>Send</button>
        </div>
        {!hasAnyKey && <p className="text-faint small mt-8">Connect an API key in Settings to see the AI's response alongside the rule-bot's.</p>}
      </div>
    </WeekLayout>
  )
}
