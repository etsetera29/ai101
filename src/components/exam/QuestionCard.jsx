const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function QuestionCard({ question, index, total, selected, onSelect }) {
  return (
    <div className="question-card">
      <span className="exam-question-num">Question {index + 1} of {total}</span>
      <p className="question-text">{question.question}</p>
      <div className="option-list">
        {question.options.map((opt, i) => (
          <div
            key={i}
            className={`option-item${selected === i ? ' selected' : ''}`}
            onClick={() => onSelect(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(i)}
          >
            <span className="option-letter">{LETTERS[i]}</span>
            <span>{opt}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
