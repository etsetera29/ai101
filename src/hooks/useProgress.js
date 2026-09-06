import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

/**
 * Central progress state, backed by Supabase (per-user, via RLS) instead of
 * localStorage. "finished" marks lessons the student has explicitly
 * completed (clicked Finished Lesson) or exams passed. Exam routes read this
 * to decide whether to render the exam or a lock screen.
 *
 * Pass the logged-in user's id (from useAuth). Returns the same shape the
 * rest of the app already expects, so Week/Exam components don't change.
 */
export function useProgress(userId) {
  const [finished, setFinished] = useState({})
  const [examAttempts, setExamAttempts] = useState({})
  const [loaded, setLoaded] = useState(false)

  // Load everything for this user once on login.
  useEffect(() => {
    if (!userId) {
      setFinished({})
      setExamAttempts({})
      setLoaded(false)
      return
    }

    let cancelled = false

    async function load() {
      const [{ data: progressRows }, { data: attemptRows }] = await Promise.all([
        supabase.from('progress').select('week_id').eq('user_id', userId),
        supabase
          .from('exam_attempts')
          .select('exam_id, score, total, passed, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: true }),
      ])

      if (cancelled) return

      const finishedMap = {}
      for (const row of progressRows || []) finishedMap[row.week_id] = true
      setFinished(finishedMap)

      const attemptsMap = {}
      for (const row of attemptRows || []) {
        if (!attemptsMap[row.exam_id]) attemptsMap[row.exam_id] = []
        attemptsMap[row.exam_id].push({
          score: row.score,
          total: row.total,
          passed: row.passed,
          at: new Date(row.created_at).getTime(),
        })
      }
      setExamAttempts(attemptsMap)
      setLoaded(true)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const markFinished = useCallback(
    async (weekId) => {
      setFinished((prev) => ({ ...prev, [weekId]: true }))
      if (!userId) return
      const { error } = await supabase
        .from('progress')
        .upsert({ user_id: userId, week_id: weekId }, { onConflict: 'user_id,week_id' })
      if (error) console.error('Failed to save progress:', error.message)
    },
    [userId]
  )

  const isFinished = useCallback((weekId) => !!finished[weekId], [finished])

  const missingRequirements = useCallback(() => [], [])

  const recordExamAttempt = useCallback(
    async (examId, result) => {
      setExamAttempts((prev) => ({
        ...prev,
        [examId]: [...(prev[examId] || []), result],
      }))
      if (!userId) return
      const { error } = await supabase.from('exam_attempts').insert({
        user_id: userId,
        exam_id: examId,
        score: result.score,
        total: result.total,
        passed: result.passed,
      })
      if (error) console.error('Failed to save exam attempt:', error.message)
    },
    [userId]
  )

  const getExamAttempts = useCallback((examId) => examAttempts[examId] || [], [examAttempts])

  const resetProgress = useCallback(async () => {
    setFinished({})
    setExamAttempts({})
    if (!userId) return
    await supabase.from('progress').delete().eq('user_id', userId)
    // Exam history is kept intentionally (it's a record, not a cache) — only
    // lesson "finished" flags reset. Add a delete on exam_attempts here too
    // if you want a full wipe instead.
  }, [userId])

  return {
    finished,
    loaded,
    markFinished,
    isFinished,
    missingRequirements,
    recordExamAttempt,
    getExamAttempts,
    resetProgress,
  }
}
