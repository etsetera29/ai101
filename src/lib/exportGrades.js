import * as XLSX from 'xlsx'
import weekMeta from '../data/weekMeta.json'

export const LESSON_ENTRIES = weekMeta.filter((w) => w.type !== 'exam')
export const EXAM_ENTRIES = weekMeta.filter((w) => w.type === 'exam')

export function bestAttempt(attempts) {
  if (!attempts || attempts.length === 0) return null
  return attempts.reduce((best, a) => (a.score > (best?.score ?? -1) ? a : best), null)
}

/**
 * Shape expected per student:
 * {
 *   fullName, email, section,
 *   finishedWeekIds: string[],
 *   examAttempts: { [examId]: { score, total, passed }[] }
 * }
 */
function buildRow(student) {
  const row = {
    Name: student.fullName || '(no name)',
    Section: student.section || '(none)',
    Email: student.email || '',
  }

  let finishedCount = 0
  for (const w of LESSON_ENTRIES) {
    const done = student.finishedWeekIds.includes(w.id)
    if (done) finishedCount += 1
    row[w.title] = done ? 'Done' : ''
  }
  row['Lessons completed'] = `${finishedCount} / ${LESSON_ENTRIES.length}`

  for (const exam of EXAM_ENTRIES) {
    const best = bestAttempt(student.examAttempts[exam.id])
    row[`${exam.title} — Score`] = best ? `${best.score} / ${best.total}` : '—'
    row[`${exam.title} — Passed`] = best ? (best.passed ? 'Yes' : 'No') : '—'
  }

  return row
}

export function downloadGradingSheet(students, filenamePrefix = 'ai101-grades') {
  const rows = students.map(buildRow)
  const worksheet = XLSX.utils.json_to_sheet(rows)

  const headers = Object.keys(rows[0] || {})
  worksheet['!cols'] = headers.map((key) => ({ wch: Math.max(12, key.length + 2) }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades')

  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `${filenamePrefix}-${stamp}.xlsx`)
}
