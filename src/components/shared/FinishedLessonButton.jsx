import { useNavigate } from 'react-router-dom'

export default function FinishedLessonButton({ weekId, isFinished, onFinish, nextPath, nextLabel }) {
  const navigate = useNavigate()

  if (isFinished) {
    return (
      <div className="flex gap-12" style={{ alignItems: 'center' }}>
        <span className="badge badge-done">✓ Lesson finished</span>
        {nextPath && (
          <button className="btn btn-primary" onClick={() => navigate(nextPath)}>
            {nextLabel || 'Continue →'}
          </button>
        )}
      </div>
    )
  }

  return (
    <button className="btn btn-success" onClick={() => onFinish(weekId)}>
      Mark this lesson finished
    </button>
  )
}
