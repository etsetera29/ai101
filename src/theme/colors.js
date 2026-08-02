// AI 101 — "Field Log" theme
// Concept: a research notebook kept at a terminal. Ink-dark pages, one
// signature accent (signal violet) for anything interactive, a warm amber
// reserved ONLY for caution states (API key warnings), and a cool teal
// reserved ONLY for completion/success states. No decorative gradients.

export const colors = {
  // Surfaces
  bg: '#0C0E13',        // page background — near-black ink
  bgAlt: '#0F1218',      // secondary background (exam mode)
  surface: '#151922',    // card surface
  surfaceRaised: '#1B2029', // hovered / raised card
  border: '#262C38',
  borderStrong: '#38404F',

  // Text
  text: '#E9EBEF',
  textDim: '#9BA3B4',
  textFaint: '#5C6473',

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
