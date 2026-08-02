// AI 101 — "Field Log" theme
// Concept: a research notebook kept at a terminal. Ink-dark pages, one
// signature accent (signal violet) for anything interactive, a warm amber
// reserved ONLY for caution states (API key warnings), and a cool teal
// reserved ONLY for completion/success states. No decorative gradients.

export const colors = {
  // Surfaces — lifted slightly off pure ink so cards separate from the page
  bg: '#10131A',        // page background — near-black ink
  bgAlt: '#141821',      // secondary background (exam mode)
  surface: '#1A1F2A',    // card surface
  surfaceRaised: '#212734', // hovered / raised card
  border: '#2E3546',
  borderStrong: '#454E63',

  // Text — brightened for readability against the dark surfaces
  text: '#F1F3F7',
  textDim: '#B7BFCE',
  textFaint: '#828BA0',

  // Signature accent — "signal violet", used for interactive/primary actions
  accent: '#7C6CF2',
  accentDim: '#5A4DBF',
  accentSoft: 'rgba(124, 108, 242, 0.14)',

  // Secondary accent — "field teal", used ONLY for progress/completion
  success: '#2FD5B8',
  successSoft: 'rgba(47, 213, 184, 0.14)',

  // Caution — used ONLY for the API key warning banner, never decorative
  caution: '#E8A23D',
  cautionSoft: 'rgba(232, 162, 61, 0.14)',

  // Danger — errors, locked states, wrong answers
  danger: '#F0665E',
  dangerSoft: 'rgba(240, 102, 94, 0.14)',
}

// Per-week accent tints — subtle, desaturated, never full color swaps.
// Used only as a 1-2px left border + icon tint on week cards.
export const weekTints = {
  foundations: '#7C6CF2', // intro / branches / ML basics
  language: '#4FB8E0',    // NLP / prompting weeks
  ethics: '#E8A23D',      // bias / ethics / limitations
  generative: '#C77DE8',  // generative AI text/image
  context: '#2FD5B8',     // Philippines / daily life / future
  exam: '#F0665E',        // exam weeks
}
