const ICONS = {
  foundations: (
    <path d="M12 2 3 7l9 5 9-5-9-5Z M3 12l9 5 9-5 M3 17l9 5 9-5" />
  ),
  language: (
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
  ),
  ethics: (
    <path d="M12 2 3 6v6c0 5 4 8 9 10 5-2 9-5 9-10V6l-9-4Z" />
  ),
  generative: (
    <path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
  ),
  context: (
    <path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9Z" />
  ),
  exam: (
    <path d="M9 2h6v4H9V2ZM6 6h12v16H6V6Zm3 5h6M9 14h6M9 17h3" />
  ),
}

export default function WeekIcon({ tint = 'foundations', size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[tint] || ICONS.foundations}
    </svg>
  )
}
