// Routes a prompt to whichever provider the student has configured.
// Claude/OpenAI: browser -> our relay (api/*-relay.js, no logging) -> provider
// Groq/Gemini: browser -> provider, directly, our servers never see it at all

// Pulls a human-readable message out of a failed response instead of just
// the status code, so a future model deprecation (like the Aug 2026 Groq
// llama-3.1-8b-instant / llama-3.3-70b-versatile shutdown, or Gemini 1.5's
// shutdown earlier in 2026) shows up as a clear "model not found"-style
// message in the UI instead of a bare "(404)" that sends everyone digging
// through devtools.
async function readErrorDetail(res) {
  try {
    const data = await res.clone().json()
    return data?.error?.message || data?.error?.toString?.() || JSON.stringify(data)
  } catch {
    try {
      const text = await res.text()
      return text.slice(0, 300)
    } catch {
      return null
    }
  }
}

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
    if (!res.ok) {
      const detail = await readErrorDetail(res)
      throw new Error(`Claude relay error (${res.status})${detail ? `: ${detail}` : ''}`)
    }
    const data = await res.json()
    return data.text
  }

  if (provider === 'openai') {
    const res = await fetch('/api/openai-relay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, prompt, system }),
    })
    if (!res.ok) {
      const detail = await readErrorDetail(res)
      throw new Error(`OpenAI relay error (${res.status})${detail ? `: ${detail}` : ''}`)
    }
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
        // openai/gpt-oss-20b — Groq's own recommended replacement for
        // llama-3.1-8b-instant, which it decommissioned on 2026-08-16.
        // See https://console.groq.com/docs/deprecations
        model: 'openai/gpt-oss-20b',
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    })
    if (!res.ok) {
      const detail = await readErrorDetail(res)
      throw new Error(`Groq error (${res.status})${detail ? `: ${detail}` : ''}`)
    }
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  }

  if (provider === 'gemini') {
    const res = await fetch(
      // gemini-3.6-flash — current stable GA model, no retirement date
      // announced as of this writing. gemini-1.5-flash (previously used
      // here) was fully shut down by Google earlier in 2026 and returned
      // 404 for every request.
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: system ? `${system}\n\n${prompt}` : prompt }] }],
        }),
      }
    )
    if (!res.ok) {
      const detail = await readErrorDetail(res)
      throw new Error(`Gemini error (${res.status})${detail ? `: ${detail}` : ''}`)
    }
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  }

  throw new Error(`Unknown provider: ${provider}`)
}
