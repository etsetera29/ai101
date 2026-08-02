// Pass-through relay for the OpenAI API. See claude-relay.js for the
// rationale — same no-log, forward-only behavior.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { apiKey, prompt, system } = req.body || {}

  if (!apiKey || !prompt) {
    return res.status(400).json({ error: 'Missing apiKey or prompt' })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({ error: errText })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    return res.status(200).json({ text })
  } catch (err) {
    return res.status(500).json({ error: 'Relay request failed' })
  }
}
