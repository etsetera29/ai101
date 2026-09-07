import { useCallback, useEffect, useRef, useState } from 'react'

const AFK_TIMEOUT_MS = 30_000
const CHECK_INTERVAL_MS = 1_000

/**
 * Anti-cheating monitor for a live exam attempt. Tracks three things:
 *
 * 1. Mouse inactivity — no mousemove for 30s shows a blocking "are you
 *    still there?" warning. If it happens a SECOND time on the same
 *    question, `onPenalty('afk')` fires instead of another warning.
 *    The warning count resets every time the question changes.
 * 2. Tab/window visibility — switching tabs or minimizing fires
 *    `onPenalty('tab')` immediately, no warning.
 * 3. Fullscreen — exiting fullscreen fires `onPenalty('fullscreen')`
 *    immediately, no warning (same severity as a tab switch).
 *
 * `active` gates all three checks — pass `false` on the start gate and
 * results screen so nothing fires outside of a live question.
 * Call `resetForNewQuestion()` every time `currentIndex` changes so the
 * per-question warning count and idle clock start fresh.
 *
 * NOTE: this is a client-side deterrent, not a tamper-proof guarantee —
 * a student editing app state via devtools can bypass any of this.
 */
export function useExamSecurity({ active, onPenalty }) {
  const [showAfkWarning, setShowAfkWarning] = useState(false)

  const onPenaltyRef = useRef(onPenalty)
  useEffect(() => {
    onPenaltyRef.current = onPenalty
  }, [onPenalty])

  const activeRef = useRef(active)
  useEffect(() => {
    activeRef.current = active
  }, [active])

  const lastActivityRef = useRef(Date.now())
  const warnedThisQuestionRef = useRef(false)
  const warningOpenRef = useRef(false)

  const resetForNewQuestion = useCallback(() => {
    lastActivityRef.current = Date.now()
    warnedThisQuestionRef.current = false
    warningOpenRef.current = false
    setShowAfkWarning(false)
  }, [])

  const acknowledgeAfk = useCallback(() => {
    warningOpenRef.current = false
    lastActivityRef.current = Date.now()
    setShowAfkWarning(false)
  }, [])

  // Mouse-inactivity polling.
  useEffect(() => {
    function markActive() {
      lastActivityRef.current = Date.now()
    }
    window.addEventListener('mousemove', markActive)

    const interval = setInterval(() => {
      if (!activeRef.current) return
      if (warningOpenRef.current) return // waiting on "I understand"

      const idleFor = Date.now() - lastActivityRef.current
      if (idleFor < AFK_TIMEOUT_MS) return

      if (!warnedThisQuestionRef.current) {
        warnedThisQuestionRef.current = true
        warningOpenRef.current = true
        setShowAfkWarning(true)
      } else {
        onPenaltyRef.current('afk')
      }
    }, CHECK_INTERVAL_MS)

    return () => {
      window.removeEventListener('mousemove', markActive)
      clearInterval(interval)
    }
  }, [])

  // Tab/window switch — instant penalty, no warning.
  useEffect(() => {
    function handleVisibility() {
      if (!activeRef.current) return
      if (document.hidden) onPenaltyRef.current('tab')
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Fullscreen exit — instant penalty, no warning.
  useEffect(() => {
    function handleFullscreenChange() {
      if (!activeRef.current) return
      if (!document.fullscreenElement) onPenaltyRef.current('fullscreen')
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return { showAfkWarning, acknowledgeAfk, resetForNewQuestion }
}
