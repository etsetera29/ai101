import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShuffledExam } from '../../hooks/useShuffledExam'
import QuestionCard from './QuestionCard'
import ExamProgressDots from './ExamProgressDots'
import ExamResults from './ExamResults'

export default function ExamEngine({ meta, bank, progress }) {
  const navigate = useNavigate()
  const { questions, regenerate, totalQuestions } = useShuffledExam(bank)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const alreadyPassed = progress.isFinished(meta.id)

  function selectAnswer(optionIndex) {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }))
  }

  function retry() {
    regenerate()
    setAnswers({})
    setCurrentIndex(0)
    setSubmitted(false)
  }

  function finishExam(passed) {
    progress.recordExamAttempt(meta.id, {
      score: questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0),
      total: questions.length,
      passed,
      at: Date.now(),
    })
    if (passed) progress.markFinished(meta.id)
    navigate('/')
  }

  if (submitted) {
    return (
      <div className="exam-shell page">
        <div className="exam-header">
          <div className="exam-header-inner">
            <span className="font-mono small text-faint">{meta.title}</span>
          </div>
        </div>
        <ExamResults
          questions={questions}
          answers={answers}
          onRetry={retry}
          onFinishExam={finishExam}
          alreadyPassed={alreadyPassed}
        />
      </div>
    )
  }

  const q = questions[currentIndex]
  const isLast = currentIndex === totalQuestions - 1

  return (
    <div className="exam-shell page">
      <div className="exam-header">
        <div className="exam-header-inner">
          <span className="font-mono small text-faint">{meta.title} · {meta.subtitle}</span>
          <ExamProgressDots total={totalQuestions} currentIndex={currentIndex} answers={answers} />
        </div>
      </div>

      <QuestionCard
        question={q}
        index={currentIndex}
        total={totalQuestions}
        selected={answers[currentIndex]}
        onSelect={selectAnswer}
      />

      <div className="question-card" style={{ marginTop: -10 }}>
        <div className="exam-nav">
          <button
            className="btn btn-ghost"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          >
            ← Previous
          </button>
          {isLast ? (
            <button
              className="btn btn-primary"
              disabled={Object.keys(answers).length < totalQuestions}
              onClick={() => setSubmitted(true)}
            >
              Submit exam
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={answers[currentIndex] === undefined}
              onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
            >
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
