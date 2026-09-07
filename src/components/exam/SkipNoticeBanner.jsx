const MESSAGES = {
  afk: {
    title: 'Previous question was skipped.',
    body: 'You went inactive a second time on that question, so it was auto-submitted blank and marked wrong.',
  },
  tab: {
    title: 'Previous question was skipped.',
    body: 'Switching tabs or windows during an exam instantly skips the current question and marks it wrong.',
  },
  fullscreen: {
    title: 'Previous question was skipped.',
    body: 'Exiting fullscreen during an exam instantly skips the current question and marks it wrong.',
  },
}

export default function SkipNoticeBanner({ reason }) {
  const msg = MESSAGES[reason]
  if (!msg) return null

  return (
    <div className="warning-banner">
      <span className="icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2 2 20h20L12 2Z" strokeLinejoin="round" />
          <path d="M12 9v5M12 17h.01" strokeLinecap="round" />
        </svg>
      </span>
      <div>
        <strong>{msg.title}</strong>
        <p>{msg.body}</p>
      </div>
    </div>
  )
}
