// Routes a prompt to whichever provider the student has configured.
// Claude/OpenAI: browser -> our relay (api/*-relay.js, no logging) -> provider
// Groq/Gemini: browser -> provider, directly, our servers never see it at all

export async function callAi({ provider, apiKey, prompt, system }) {
  if (!apiKey) {
    throw new Error('No API key set for this provider yet.')
  }

  if (provider === 'claude') {
    const res = await fetch('/api/claude-relay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, prompt, system }),
    })
    if (!res.ok) throw new Error(`Claude relay error (${res.status})`)
    const data = await res.json()
    return data.text
  }

  if (provider === 'openai') {
    const res = await fetch('/api/openai-relay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, prompt, system }),
    })
    if (!res.ok) throw new Error(`OpenAI relay error (${res.status})`)
    const data = await res.json()
    return data.text
  }

  if (provider === 'groq') {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    })
    if (!res.ok) throw new Error(`Groq error (${res.status})`)
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  }

  if (provider === 'gemini') {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: system ? `${system}\n\n${prompt}` : prompt }] }],
        }),
      }
    )
    if (!res.ok) throw new Error(`Gemini error (${res.status})`)
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  }

  throw new Error(`Unknown provider: ${provider}`)
}
