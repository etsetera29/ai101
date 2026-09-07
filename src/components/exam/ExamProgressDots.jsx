export default function ExamProgressDots({ total, currentIndex, answers, skipped }) {
  return (
    <div className="exam-dots">
      {Array.from({ length: total }).map((_, i) => {
        let cls = 'exam-dot'
        if (skipped?.has(i)) cls += ' skipped'
        if (i === currentIndex) cls += ' current'
        else if (answers[i] !== undefined) cls += ' answered'
        return <div key={i} className={cls} title={skipped?.has(i) ? `Question ${i + 1} (skipped)` : `Question ${i + 1}`} />
      })}
    </div>
  )
}
