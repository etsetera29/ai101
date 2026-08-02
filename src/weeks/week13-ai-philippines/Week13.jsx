import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'

const CARDS = [
  {
    title: 'Government & Policy',
    body: 'National agencies have promoted digital transformation strategies that touch on AI adoption, aiming to modernize public services, support innovation, and encourage responsible use across sectors.',
  },
  {
    title: 'Local Startups',
    body: 'A growing number of Philippine startups apply AI to fintech, agriculture, healthcare, and customer service — often building on the country\'s strong BPO and software talent base.',
  },
  {
    title: 'Education Initiatives',
    body: 'Universities and colleges are increasingly integrating AI and digital literacy — including prompt engineering — into IT and computing curricula to prepare students for an AI-integrated workforce.',
  },
  {
    title: 'BPO & Customer Service',
    body: 'Given the Philippines\' position as a global BPO hub, AI-assisted customer support tools are a natural extension of an industry that already centers on service delivery at scale.',
  },
  {
    title: 'Agriculture',
    body: 'AI-assisted tools for crop monitoring, yield prediction, and resource management are relevant given agriculture\'s significant role in the Philippine economy.',
  },
  {
    title: 'Infrastructure Challenges',
    body: 'Uneven internet connectivity and computing resources across regions remain a real constraint on how evenly AI tools and benefits can be adopted nationwide.',
  },
]

export default function Week13({ meta, progress }) {
  const [open, setOpen] = useState(0)

  return (
    <WeekLayout meta={meta} progress={progress}>
      <p className="eyebrow text-dim">Explore the local landscape</p>
      <div className="mt-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
        {CARDS.map((c, i) => (
          <button
            key={c.title}
            className="btn btn-sm"
            style={{
              background: open === i ? 'var(--accent)' : 'var(--surface)',
              color: open === i ? '#fff' : 'var(--text-dim)',
              border: '1px solid var(--border)',
              textAlign: 'left',
              justifyContent: 'flex-start',
              padding: '10px 12px',
            }}
            onClick={() => setOpen(i)}
          >
            {c.title}
          </button>
        ))}
      </div>
      <div className="card mt-16">
        <h3 style={{ margin: '0 0 10px' }}>{CARDS[open].title}</h3>
        <p className="text-dim small" style={{ lineHeight: 1.6, margin: 0 }}>{CARDS[open].body}</p>
      </div>
      <p className="text-faint small mt-16">
        Tip: pair this with a quick search for a real local AI startup or initiative to ground these ideas in
        something current — the landscape moves quickly.
      </p>
    </WeekLayout>
  )
}
