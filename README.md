# AI 101 · Field Log

An interactive lesson simulator for the *Fundamentals of AI w/ Prompt Engineering* course — one simulation per week, three gated long exams, and a bring-your-own-key system for any lesson that talks to a real AI model.

## Deploying (Vercel via GitHub)

1. Unzip this folder and push it to a new GitHub repo (no `npm install` needed locally — Vercel runs it during build).
2. In Vercel: **Add New Project → Import** your repo. Framework preset should auto-detect as **Vite**. No extra config needed — `vercel.json` is already set up for SPA routing and the `/api` serverless functions.
3. Deploy. That's it.

## Local development (optional)

```
npm install
npm run dev
```

## How it's organized

- `src/weeks/` — one folder per week, each a self-contained simulation
- `src/data/weekMeta.json` — single source of truth for titles, order, lock requirements, and which weeks need an API key
- `src/data/examBanks/` — three 80-question banks; each exam attempt draws 40 at random and shuffles every option
- `src/hooks/useProgress.js` — tracks "Finished Lesson" state and exam attempts in the browser's localStorage
- `src/hooks/useApiKey.js` — stores API keys **only** in localStorage, never on any server
- `api/claude-relay.js`, `api/openai-relay.js` — minimal pass-through relays (required because those two providers block direct browser calls); they forward requests and don't log or store anything
- Groq and Gemini are called directly from the browser — no relay needed

## About the API keys

Students bring their own key from Claude, GPT, Groq, or Gemini (Groq and Gemini both have usable free tiers). Keys live only in the student's browser and are never collected, logged, or stored by this app. A warning banner appears the first time a lesson needs one.

## Adjusting exam difficulty

Each exam bank is a flat JSON array of `{ id, topic, question, options, correctIndex }`. Add or edit questions directly — the shuffle logic in `src/hooks/useShuffledExam.js` handles the rest automatically.
