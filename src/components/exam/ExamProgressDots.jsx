export default function ExamProgressDots({ total, currentIndex, answers }) {
  return (
    <div className="exam-dots">
      {Array.from({ length: total }).map((_, i) => {
        let cls = 'exam-dot'
        if (i === currentIndex) cls += ' current'
        else if (answers[i] !== undefined) cls += ' answered'
        return <div key={i} className={cls} title={`Question ${i + 1}`} />
      })}
    </div>
  )
}
