import { useCallback, useState } from 'react'

const QUESTIONS_PER_ATTEMPT = 40

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Given an 80-question bank, draws QUESTIONS_PER_ATTEMPT unique questions at
 * random and, for each, shuffles the option order (tracking the new index of
 * the correct answer). Call generate() again on retry for a fresh draw.
 */
export function useShuffledExam(bank) {
  const buildAttempt = useCallback(() => {
    const drawn = shuffle(bank).slice(0, QUESTIONS_PER_ATTEMPT)
    return drawn.map((q) => {
      const optionOrder = shuffle(q.options.map((_, i) => i))
      const options = optionOrder.map((i) => q.options[i])
      const correctIndex = optionOrder.indexOf(q.correctIndex)
      return {
        id: q.id,
        question: q.question,
        topic: q.topic,
        options,
        correctIndex,
      }
    })
  }, [bank])

  const [attempt, setAttempt] = useState(buildAttempt)

  const regenerate = useCallback(() => setAttempt(buildAttempt()), [buildAttempt])

  return { questions: attempt, regenerate, totalQuestions: QUESTIONS_PER_ATTEMPT }
}
