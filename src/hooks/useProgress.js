import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'ai101-progress-v1'

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { finished: {}, examAttempts: {} }
  } catch {
    return { finished: {}, examAttempts: {} }
  }
}

function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Central progress state. "finished" marks lessons the student has explicitly
 * completed (clicked Finished Lesson) or exams passed. Exam routes read this
 * to decide whether to render the exam or a lock screen.
 */
export function useProgress() {
  const [store, setStore] = useState(readStore)

  useEffect(() => {
    writeStore(store)
  }, [store])

  const markFinished = useCallback((weekId) => {
    setStore((prev) => ({ ...prev, finished: { ...prev.finished, [weekId]: true } }))
  }, [])

  const isFinished = useCallback((weekId) => !!store.finished[weekId], [store])

  const missingRequirements = useCallback(
    (requires = []) => requires.filter((id) => !store.finished[id]),
    [store]
  )

  const recordExamAttempt = useCallback((examId, result) => {
    setStore((prev) => ({
      ...prev,
      examAttempts: {
        ...prev.examAttempts,
        [examId]: [...(prev.examAttempts[examId] || []), result],
      },
    }))
  }, [])

  const getExamAttempts = useCallback((examId) => store.examAttempts[examId] || [], [store])

  const resetProgress = useCallback(() => {
    const fresh = { finished: {}, examAttempts: {} }
    setStore(fresh)
    writeStore(fresh)
  }, [])

  return {
    finished: store.finished,
    markFinished,
    isFinished,
    missingRequirements,
    recordExamAttempt,
    getExamAttempts,
    resetProgress,
  }
}
