import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShuffledExam } from '../../hooks/useShuffledExam'
import { useExamSecurity } from '../../hooks/useExamSecurity'
import QuestionCard from './QuestionCard'
import ExamProgressDots from './ExamProgressDots'
import ExamResults from './ExamResults'
import ExamStartGate, { enterFullscreen } from './ExamStartGate'
import AfkWarningModal from './AfkWarningModal'
import SkipNoticeBanner from './SkipNoticeBanner'

function exitFullscreen() {
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {})
  }
}

export default function ExamEngine({ meta, bank, progress }) {
  const navigate = useNavigate()
  const { questions, regenerate, totalQuestions } = useShuffledExam(bank)
  const [phase, setPhase] = useState('gate') // 'gate' | 'active' | 'submitted'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [skipped, setSkipped] = useState(() => new Set())
  const [skipNotice, setSkipNotice] = useState(null)

  const alreadyPassed = progress.isFinished(meta.id)

  // Guards against a single leave-the-tab event tripping both the
  // visibility check and the fullscreen check and skipping two questions.
  const penalizedRef = useRef(false)

  function selectAnswer(optionIndex) {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }))
  }

  function finalizeSubmit() {
    setPhase('submitted')
    exitFullscreen()
  }

  function applyPenalty(reason) {
    if (phase !== 'active' || penalizedRef.current) return
    penalizedRef.current = true

    setSkipped((prev) => new Set(prev).add(currentIndex))
    setAnswers((prev) => {
      const next = { ...prev }
      delete next[currentIndex]
      return next
    })
    setSkipNotice(reason)

    if (currentIndex >= totalQuestions - 1) {
      finalizeSubmit()
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  const security = useExamSecurity({ active: phase === 'active', onPenalty: applyPenalty })

  // Fresh idle clock + warning count + skip guard every time the question changes.
  useEffect(() => {
    penalizedRef.current = false
    security.resetForNewQuestion()
    setSkipNotice(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, phase])

  // Release fullscreen if the student navigates away mid-exam.
  useEffect(() => exitFullscreen, [])

  async function startExam() {
    setPhase('active')
  }

  async function retry() {
    regenerate()
    setAnswers({})
    setSkipped(new Set())
    setSkipNotice(null)
    setCurrentIndex(0)
    await enterFullscreen()
    setPhase('active')
  }

  function finishExam(passed) {
    progress.recordExamAttempt(meta.id, {
      score: questions.reduce((acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0), 0),
      total: questions.length,
      passed,
      at: Date.now(),
    })
    if (passed) progress.markFinished(meta.id)
    exitFullscreen()
    navigate('/')
  }

  if (phase === 'gate') {
    return <ExamStartGate meta={meta} totalQuestions={totalQuestions} onStart={startExam} />
  }

  if (phase === 'submitted') {
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
          skipped={skipped}
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
          <ExamProgressDots total={totalQuestions} currentIndex={currentIndex} answers={answers} skipped={skipped} />
        </div>
      </div>

      {skipNotice && (
        <div className="question-card" style={{ marginBottom: -10 }}>
          <SkipNoticeBanner reason={skipNotice} />
        </div>
      )}

      <QuestionCard
        question={q}
        index={currentIndex}
        total={totalQuestions}
        selected={answers[currentIndex]}
        onSelect={selectAnswer}
        secure
      />

      <div className="question-card" style={{ marginTop: -10 }}>
        <div className="exam-nav" style={{ justifyContent: 'flex-end' }}>
          {isLast ? (
            <button
              className="btn btn-primary"
              disabled={Object.keys(answers).length + skipped.size < totalQuestions}
              onClick={finalizeSubmit}
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

      {security.showAfkWarning && <AfkWarningModal onAcknowledge={security.acknowledgeAfk} />}
    </div>
  )
}
