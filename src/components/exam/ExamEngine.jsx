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
  const [phase, setPhase] = useState('gate') // 'gate' | 'active' | 'voided' | 'submitted'
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

    // Exiting fullscreen is treated as a serious integrity violation:
    // the whole attempt is voided rather than just skipping a question.
    if (reason === 'fullscreen') {
      exitFullscreen()
      setPhase('voided')
      return
    }

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

  if (phase === 'voided') {
    return (
      <div className="container">
        <div className="lock-screen">
          <div className="lock-icon" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2 2 20h20L12 2Z" strokeLinejoin="round" />
              <path d="M12 9v5M12 17h.01" strokeLinecap="round" />
            </svg>
          </div>
          <h2 style={{ margin: '0 0 10px' }}>Exam voided</h2>
          <p className="text-dim">
            You exited fullscreen during a live attempt. That's flagged as a security violation,
            so this entire attempt has been discarded — none of your answers were saved or scored.
          </p>
          <p className="text-dim">
            Start a new attempt when you're ready, and stay in fullscreen for the whole exam this time.
          </p>
          <div className="flex gap-12 mt-24" style={{ justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>Back to the log</button>
            <button className="btn btn-primary" onClick={retry}>Retry exam</button>
          </div>
        </div>
      </div>
    )
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
