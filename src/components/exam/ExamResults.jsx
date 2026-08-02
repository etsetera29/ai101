export default function ExamResults({ questions, answers, onRetry, onFinishExam, alreadyPassed }) {
  const total = questions.length
  const correctCount = questions.reduce(
    (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
    0
  )
  const pct = Math.round((correctCount / total) * 100)
  const passed = pct >= 75

  return (
    <div className="question-card" style={{ maxWidth: 640 }}>
      <p className="eyebrow text-dim">Result</p>
      <h2 style={{ margin: '8px 0 4px' }}>{correctCount}/{total} correct — {pct}%</h2>
      <p className={passed ? 'text-dim' : 'text-dim'}>
        {passed ? 'Passing score (75%+). Nice work.' : 'Below the 75% mark — you can retry with a fresh set of questions.'}
      </p>

      <div className="mt-24">
        {questions.map((q, i) => {
          const correct = answers[i] === q.correctIndex
          return (
            <div className="result-row" key={q.id}>
              <span className="text-dim">Q{i + 1}. {q.question.slice(0, 60)}{q.question.length > 60 ? '…' : ''}</span>
              <span style={{ color: correct ? 'var(--success)' : 'var(--danger)' }}>
                {correct ? '✓' : `✗ (${q.options[q.correctIndex]})`}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex gap-12 mt-24">
        <button className="btn btn-ghost" onClick={onRetry}>Retry with new questions</button>
        <button className="btn btn-primary" onClick={() => onFinishExam(passed)}>
          {alreadyPassed ? 'Back to log' : passed ? 'Mark exam complete →' : 'Back to log'}
        </button>
      </div>
    </div>
  )
}
