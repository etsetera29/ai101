export default function KeyWarningBanner() {
  return (
    <div className="warning-banner">
      <span className="icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 2 2 20h20L12 2Z" strokeLinejoin="round" />
          <path d="M12 9v5M12 17h.01" strokeLinecap="round" />
        </svg>
      </span>
      <div>
        <strong>Your key stays on your device.</strong>
        <p>
          We don't collect, store, or see your API key. It's sent directly to your chosen AI
          provider to run this exercise, and it lives only in this browser's storage — clear it
          anytime from Settings, or just use a different browser.
        </p>
      </div>
    </div>
  )
}
