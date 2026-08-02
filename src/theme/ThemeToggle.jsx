import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('ai101-contrast') === 'on')

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast)
    localStorage.setItem('ai101-contrast', highContrast ? 'on' : 'off')
  }, [highContrast])

  return (
    <button
      className="icon-btn"
      onClick={() => setHighContrast(v => !v)}
      aria-pressed={highContrast}
      title="Toggle high-contrast mode"
    >
      {highContrast ? '◐ Contrast: On' : '◑ Contrast'}
    </button>
  )
}
