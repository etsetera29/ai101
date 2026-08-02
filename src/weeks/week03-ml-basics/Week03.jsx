import { useMemo, useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'

const W = 320
const H = 200

// ---------- Supervised ----------
function SupervisedPanel() {
  const [points, setPoints] = useState([])
  const [label, setLabel] = useState('A')
  const [fitted, setFitted] = useState(false)

  function addPoint(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setPoints((p) => [...p, { x, y, label }])
    setFitted(false)
  }

  const centroids = useMemo(() => {
    const a = points.filter((p) => p.label === 'A')
    const b = points.filter((p) => p.label === 'B')
    const avg = (arr) =>
      arr.length ? { x: arr.reduce((s, p) => s + p.x, 0) / arr.length, y: arr.reduce((s, p) => s + p.y, 0) / arr.length } : null
    return { a: avg(a), b: avg(b) }
  }, [points])

  const boundaryLine = useMemo(() => {
    if (!fitted || !centroids.a || !centroids.b) return null
    const mx = (centroids.a.x + centroids.b.x) / 2
    const my = (centroids.a.y + centroids.b.y) / 2
    const dx = centroids.b.x - centroids.a.x
    const dy = centroids.b.y - centroids.a.y
    // perpendicular direction
    const len = Math.hypot(dx, dy) || 1
    const px = -dy / len
    const py = dx / len
    const scale = 300
    return { x1: mx - px * scale, y1: my - py * scale, x2: mx + px * scale, y2: my + py * scale }
  }, [fitted, centroids])

  return (
    <div>
      <div className="flex gap-8" style={{ alignItems: 'center' }}>
        <span className="small text-dim">Labeling as:</span>
        <button className="btn btn-sm" style={{ background: label === 'A' ? '#7C6CF2' : 'var(--surface)', color: label === 'A' ? '#fff' : 'var(--text-dim)', border: '1px solid var(--border)' }} onClick={() => setLabel('A')}>Class A</button>
        <button className="btn btn-sm" style={{ background: label === 'B' ? '#2FD5B8' : 'var(--surface)', color: label === 'B' ? '#06201A' : 'var(--text-dim)', border: '1px solid var(--border)' }} onClick={() => setLabel('B')}>Class B</button>
        <button className="btn btn-ghost btn-sm" onClick={() => { setPoints([]); setFitted(false) }}>Clear</button>
      </div>
      <p className="text-faint small mt-8">Click inside the box to add labeled points, then fit a boundary.</p>
      <svg
        width={W} height={H}
        style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'crosshair', marginTop: 8 }}
        onClick={addPoint}
      >
        {boundaryLine && (
          <line x1={boundaryLine.x1} y1={boundaryLine.y1} x2={boundaryLine.x2} y2={boundaryLine.y2} stroke="#E8A23D" strokeWidth="2" strokeDasharray="6 4" />
        )}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill={p.label === 'A' ? '#7C6CF2' : '#2FD5B8'} />
        ))}
      </svg>
      <div className="mt-16">
        <button className="btn btn-primary btn-sm" disabled={points.filter(p=>p.label==='A').length < 2 || points.filter(p=>p.label==='B').length < 2} onClick={() => setFitted(true)}>
          Fit boundary from labeled points
        </button>
      </div>
    </div>
  )
}

// ---------- Unsupervised ----------
function UnsupervisedPanel() {
  const [points, setPoints] = useState([])
  const [clustered, setClustered] = useState(null)

  function addPoint(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setPoints((p) => [...p, { x, y }])
    setClustered(null)
  }

  function runKMeans() {
    if (points.length < 2) return
    let centers = [points[0], points[Math.floor(points.length / 2)]]
    let assignments = points.map(() => 0)
    for (let iter = 0; iter < 8; iter++) {
      assignments = points.map((p) => {
        const d0 = Math.hypot(p.x - centers[0].x, p.y - centers[0].y)
        const d1 = Math.hypot(p.x - centers[1].x, p.y - centers[1].y)
        return d0 <= d1 ? 0 : 1
      })
      for (let k = 0; k < 2; k++) {
        const group = points.filter((_, i) => assignments[i] === k)
        if (group.length) {
          centers[k] = {
            x: group.reduce((s, p) => s + p.x, 0) / group.length,
            y: group.reduce((s, p) => s + p.y, 0) / group.length,
          }
        }
      }
    }
    setClustered(assignments)
  }

  return (
    <div>
      <div className="flex gap-8">
        <button className="btn btn-ghost btn-sm" onClick={() => { setPoints([]); setClustered(null) }}>Clear</button>
      </div>
      <p className="text-faint small mt-8">Click to scatter unlabeled points, then let the algorithm find groups on its own.</p>
      <svg
        width={W} height={H}
        style={{ background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'crosshair', marginTop: 8 }}
        onClick={addPoint}
      >
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={5} fill={clustered ? (clustered[i] === 0 ? '#7C6CF2' : '#2FD5B8') : '#9BA3B4'} />
        ))}
      </svg>
      <div className="mt-16">
        <button className="btn btn-primary btn-sm" disabled={points.length < 4} onClick={runKMeans}>
          Find clusters (k=2)
        </button>
      </div>
    </div>
  )
}

// ---------- Reinforcement ----------
const GRID = 5
const GOAL = { r: 0, c: 4 }
const PIT = { r: 2, c: 2 }
const ARROWS = { up: '↑', down: '↓', left: '←', right: '→' }
const ACTIONS = ['up', 'down', 'left', 'right']

function step(r, c, action) {
  if (action === 'up') r = Math.max(0, r - 1)
  if (action === 'down') r = Math.min(GRID - 1, r + 1)
  if (action === 'left') c = Math.max(0, c - 1)
  if (action === 'right') c = Math.min(GRID - 1, c + 1)
  return { r, c }
}

function ReinforcementPanel() {
  const [policy, setPolicy] = useState(null)
  const [episodes, setEpisodes] = useState(0)

  function train() {
    const Q = {}
    const key = (r, c) => `${r},${c}`
    for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) Q[key(r, c)] = { up: 0, down: 0, left: 0, right: 0 }

    const alpha = 0.3, gamma = 0.9
    for (let ep = 0; ep < 400; ep++) {
      let r = Math.floor(Math.random() * GRID)
      let c = Math.floor(Math.random() * GRID)
      for (let t = 0; t < 30; t++) {
        if ((r === GOAL.r && c === GOAL.c) || (r === PIT.r && c === PIT.c)) break
        const epsilon = 0.2
        const action = Math.random() < epsilon
          ? ACTIONS[Math.floor(Math.random() * 4)]
          : ACTIONS.reduce((best, a) => (Q[key(r, c)][a] > Q[key(r, c)][best] ? a : best), ACTIONS[0])
        const next = step(r, c, action)
        let reward = -1
        if (next.r === GOAL.r && next.c === GOAL.c) reward = 10
        if (next.r === PIT.r && next.c === PIT.c) reward = -10
        const maxNext = Math.max(...ACTIONS.map((a) => Q[key(next.r, next.c)][a]))
        Q[key(r, c)][action] += alpha * (reward + gamma * maxNext - Q[key(r, c)][action])
        r = next.r; c = next.c
      }
    }

    const pol = {}
    for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) {
      pol[key(r, c)] = ACTIONS.reduce((best, a) => (Q[key(r, c)][a] > Q[key(r, c)][best] ? a : best), ACTIONS[0])
    }
    setPolicy(pol)
    setEpisodes(400)
  }

  return (
    <div>
      <p className="text-faint small">
        Violet = goal (+10 reward), red = pit (−10 reward). Train the agent, then see the learned policy —
        the direction it decided is best from each square.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID}, 44px)`, gap: 4, marginTop: 10 }}>
        {Array.from({ length: GRID }).map((_, r) =>
          Array.from({ length: GRID }).map((_, c) => {
            const isGoal = r === GOAL.r && c === GOAL.c
            const isPit = r === PIT.r && c === PIT.c
            const action = policy?.[`${r},${c}`]
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: 44, height: 44, borderRadius: 8,
                  background: isGoal ? 'var(--success-soft)' : isPit ? 'var(--danger-soft)' : 'var(--surface)',
                  border: `1px solid ${isGoal ? 'var(--success)' : isPit ? 'var(--danger)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--text-dim)',
                }}
              >
                {isGoal ? '★' : isPit ? '✕' : action && !isGoal && !isPit ? ARROWS[action] : ''}
              </div>
            )
          })
        )}
      </div>
      <button className="btn btn-primary btn-sm mt-16" onClick={train}>
        Train agent (400 episodes)
      </button>
      {episodes > 0 && <span className="small text-faint" style={{ marginLeft: 10 }}>Trained on {episodes} episodes.</span>}
    </div>
  )
}

export default function Week03({ meta, progress }) {
  const [mode, setMode] = useState('supervised')

  return (
    <WeekLayout meta={meta} progress={progress}>
      <div className="flex gap-8">
        {['supervised', 'unsupervised', 'reinforcement'].map((m) => (
          <button
            key={m}
            className="btn btn-sm"
            style={{
              background: mode === m ? 'var(--accent)' : 'var(--surface)',
              color: mode === m ? '#fff' : 'var(--text-dim)',
              border: '1px solid var(--border)',
              textTransform: 'capitalize',
            }}
            onClick={() => setMode(m)}
          >
            {m}
          </button>
        ))}
      </div>
      <div className="card mt-16">
        {mode === 'supervised' && <SupervisedPanel />}
        {mode === 'unsupervised' && <UnsupervisedPanel />}
        {mode === 'reinforcement' && <ReinforcementPanel />}
      </div>
    </WeekLayout>
  )
}
