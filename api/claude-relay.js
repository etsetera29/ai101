// Pass-through relay for the Claude API.
//
// Why this exists: Anthropic's API doesn't allow direct browser calls (no
// CORS support), so a request has to pass through *some* server to reach it.
// This function does the minimum possible: it forwards the request body to
// Anthropic and returns the response. It does not write to a database, does
// not log the API key or prompt content, and holds nothing in memory once
// the response is sent. Vercel's own platform request logs may capture
// metadata (timestamps, status codes) the same way they do for any request,
// but the key and prompt are never persisted by this application.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { apiKey, prompt, system } = req.body || {}

  if (!apiKey || !prompt) {
    return res.status(400).json({ error: 'Missing apiKey or prompt' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: system || undefined,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({ error: errText })
    }

    const data = await response.json()
    const text = data.content?.find((b) => b.type === 'text')?.text ?? ''
    return res.status(200).json({ text })
  } catch (err) {
    return res.status(500).json({ error: 'Relay request failed' })
  }
}
