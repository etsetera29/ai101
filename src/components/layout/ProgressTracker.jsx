export default function ProgressTracker({ total, completed }) {
  const pct = total ? Math.round((completed / total) * 100) : 0
  return (
    <div className="progress-summary">
      <span>{String(completed).padStart(2, '0')}/{total} milestones</span>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span>{pct}%</span>
    </div>
  )
}
