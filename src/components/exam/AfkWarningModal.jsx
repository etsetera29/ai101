export default function AfkWarningModal({ onAcknowledge }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 380, borderColor: 'var(--danger)' }}>
        <div className="modal-head">
          <h3 style={{ margin: 0 }}>Still there?</h3>
        </div>
        <p className="text-dim" style={{ fontSize: '0.9rem', lineHeight: 1.55 }}>
          You've been inactive for a while on this question. This is your one warning — if it
          happens again on this same question, it will be auto-submitted as skipped and marked
          wrong.
        </p>
        <button className="btn btn-primary btn-block mt-24" onClick={onAcknowledge}>
          I understand, continue
        </button>
      </div>
    </div>
  )
}
