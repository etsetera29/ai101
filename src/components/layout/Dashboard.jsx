import { useState } from 'react'
import weekMeta from '../../data/weekMeta.json'
import RoadmapPath from './RoadmapPath'
import RoadmapGrid from './RoadmapGrid'
import ProgressTracker from './ProgressTracker'

export default function Dashboard({ progress }) {
  const completed = weekMeta.filter((w) => progress.isFinished(w.id)).length
  const [view, setView] = useState(() => localStorage.getItem('ai101-view-mode') || 'list')

  function setViewMode(mode) {
    setView(mode)
    localStorage.setItem('ai101-view-mode', mode)
  }

  return (
    <div className="container">
      <section className="hero">
        <span className="eyebrow">AI 101 · Fundamentals of AI w/ Prompt Engineering</span>
        <h1>Field Log</h1>
        <p>
          A running log of every lesson in the course, simulated. Work through each entry in
          order — three long exams sit along the way, and you'll need to finish the lessons
          before each one to unlock it.
        </p>
        <ProgressTracker total={weekMeta.length} completed={completed} />

        <div className="flex-between mt-24" style={{ flexWrap: 'wrap', gap: 12 }}>
          <span className="eyebrow text-faint">All weeks</span>
          <div className="view-toggle">
            <button
              className={view === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              aria-pressed={view === 'list'}
            >
              ☰ List
            </button>
            <button
              className={view === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              aria-pressed={view === 'grid'}
            >
              ▦ Grid
            </button>
          </div>
        </div>
      </section>

      {view === 'list' ? (
        <RoadmapPath
          weeks={weekMeta}
          isFinished={progress.isFinished}
          missingRequirements={progress.missingRequirements}
        />
      ) : (
        <RoadmapGrid
          weeks={weekMeta}
          isFinished={progress.isFinished}
          missingRequirements={progress.missingRequirements}
        />
      )}
    </div>
  )
}
