import weekMeta from '../../data/weekMeta.json'
import RoadmapPath from './RoadmapPath'
import ProgressTracker from './ProgressTracker'

export default function Dashboard({ progress }) {
  const completed = weekMeta.filter((w) => progress.isFinished(w.id)).length

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
      </section>

      <RoadmapPath
        weeks={weekMeta}
        isFinished={progress.isFinished}
        missingRequirements={progress.missingRequirements}
      />
    </div>
  )
}
