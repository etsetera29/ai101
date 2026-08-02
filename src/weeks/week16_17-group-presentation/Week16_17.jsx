import { useState } from 'react'
import WeekLayout from '../../components/layout/WeekLayout'

const STORAGE_KEY = 'ai101-presentation-submission'

export default function Week16_17({ meta, progress }) {
  const [submission, setSubmission] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { title: '', link: '', notes: '' } }
    catch { return { title: '', link: '', notes: '' } }
  })
  const [comments, setComments] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY + '-comments')) || [] }
    catch { return [] }
  })
  const [newComment, setNewComment] = useState('')
  const [saved, setSaved] = useState(false)

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submission))
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  function addComment() {
    if (!newComment.trim()) return
    const updated = [...comments, newComment.trim()]
    setComments(updated)
    localStorage.setItem(STORAGE_KEY + '-comments', JSON.stringify(updated))
    setNewComment('')
  }

  return (
    <WeekLayout meta={meta} progress={progress} showReflection={false}>
      <p className="eyebrow text-dim">Submit your group's presentation</p>
      <div className="card mt-8">
        <p className="text-faint small">
          This saves to your own browser only — for an actual class submission, follow your instructor's
          official upload channel. This is a rehearsal space.
        </p>
        <div className="field mt-16">
          <label>Presentation title</label>
          <input type="text" value={submission.title} onChange={(e) => setSubmission({ ...submission, title: e.target.value })} placeholder="e.g. AI in Philippine Agriculture" />
        </div>
        <div className="field">
          <label>Link to slides/demo (optional)</label>
          <input type="text" value={submission.link} onChange={(e) => setSubmission({ ...submission, link: e.target.value })} placeholder="https://…" />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Speaker notes</label>
          <textarea
            value={submission.notes}
            onChange={(e) => setSubmission({ ...submission, notes: e.target.value })}
            style={{ width: '100%', background: 'var(--bg-alt)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: 10, minHeight: 80 }}
            placeholder="Key points to cover…"
          />
        </div>
        <button className="btn btn-primary btn-sm mt-16" onClick={save}>{saved ? '✓ Saved' : 'Save draft'}</button>
      </div>

      <p className="eyebrow text-dim mt-24">Peer feedback</p>
      <div className="card mt-8">
        <div className="flex-col gap-8">
          {comments.length === 0 && <p className="text-faint small">No comments yet.</p>}
          {comments.map((c, i) => (
            <p key={i} className="small" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>{c}</p>
          ))}
        </div>
        <div className="flex gap-8 mt-16">
          <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Leave a note for the group…" onKeyDown={(e) => e.key === 'Enter' && addComment()} />
          <button className="btn btn-ghost btn-sm" onClick={addComment}>Add</button>
        </div>
      </div>
    </WeekLayout>
  )
}
