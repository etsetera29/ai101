import { useState } from 'react'
import { LESSON_ENTRIES, EXAM_ENTRIES, bestAttempt, downloadGradingSheet } from '../../lib/exportGrades'

const SECTIONS = [
  'BSIT-1A-NE',
  'BSIT-1B-NE',
  'BSIT-1C-NE',
  'BSIT-1D-NE',
  'BSIT-1E-NE',
  'BSIT-1A-SE',
  'BSCS-1A',
]

export default function ProfilePage({ open, onClose, auth, progress, adminKeyState }) {
  const [courseFilter, setCourseFilter] = useState('ALL')
  const [exporting, setExporting] = useState(false)
  const [adminError, setAdminError] = useState('')

  if (!open) return null

  const fullName = auth.user?.user_metadata?.full_name || auth.user?.email || 'Student'
  const section = auth.user?.user_metadata?.section || '—'
  const email = auth.user?.email || ''

  const finishedCount = LESSON_ENTRIES.filter((w) => progress.isFinished(w.id)).length
  const percent = LESSON_ENTRIES.length
    ? Math.round((finishedCount / LESSON_ENTRIES.length) * 100)
    : 0

  function exportMine() {
    downloadGradingSheet(
      [
        {
          fullName,
          email,
          section,
          finishedWeekIds: LESSON_ENTRIES.filter((w) => progress.isFinished(w.id)).map((w) => w.id),
          examAttempts: Object.fromEntries(
            EXAM_ENTRIES.map((e) => [e.id, progress.getExamAttempts(e.id)])
          ),
        },
      ],
      `${fullName.replace(/\s+/g, '-').toLowerCase()}-grades`
    )
  }

  async function exportCourse() {
    setAdminError('')
    setExporting(true)
    try {
      const res = await fetch('/api/admin-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey: adminKeyState.adminKey,
          action: 'export',
          section: courseFilter,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Export failed.')
      if (!data.students || data.students.length === 0) {
        setAdminError('No students found for that course yet.')
        return
      }
      downloadGradingSheet(data.students, `ai101-grades-${courseFilter}`)
    } catch (err) {
      setAdminError(err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <h3 style={{ margin: 0 }}>Profile</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close profile">✕</button>
        </div>

        <div className="card">
          <span className="eyebrow text-faint">Student</span>
          <h2 style={{ margin: '4px 0 2px' }}>{fullName}</h2>
          <p className="text-dim" style={{ margin: 0, fontSize: '0.85rem' }}>
            {section} · {email}
          </p>
        </div>

        <p className="eyebrow text-faint mt-24">Your progress</p>
        <div className="card mt-8">
          <div className="flex-between">
            <span>Lessons completed</span>
            <strong>
              {finishedCount} / {LESSON_ENTRIES.length} ({percent}%)
            </strong>
          </div>
          <div className="profile-progress-bar">
            <div className="profile-progress-fill" style={{ width: `${percent}%` }} />
          </div>

          <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
            {EXAM_ENTRIES.map((exam) => {
              const best = bestAttempt(progress.getExamAttempts(exam.id))
              return (
                <div key={exam.id} className="flex-between" style={{ fontSize: '0.88rem' }}>
                  <span className="text-dim">{exam.title}</span>
                  <span>
                    {best ? `${best.score} / ${best.total} · ${best.passed ? 'Passed' : 'Not passed'}` : 'Not taken'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <button className="btn btn-primary btn-block mt-16" onClick={exportMine}>
          ⬇ Export my grading sheet (Excel)
        </button>

        {adminKeyState.verified && (
          <div className="card mt-24" style={{ borderColor: 'var(--accent)' }}>
            <span className="eyebrow" style={{ color: 'var(--accent)' }}>Admin</span>
            <p className="text-dim" style={{ fontSize: '0.85rem', margin: '6px 0 12px' }}>
              Export a grading sheet for every student in a course.
            </p>
            <div className="field">
              <label htmlFor="courseFilter">Course</label>
              <select
                id="courseFilter"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="ALL">All courses</option>
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {adminError && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{adminError}</p>
            )}
            <button className="btn btn-success btn-block" onClick={exportCourse} disabled={exporting}>
              {exporting ? 'Exporting…' : `⬇ Export ${courseFilter === 'ALL' ? 'all courses' : courseFilter}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
