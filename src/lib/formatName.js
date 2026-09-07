/**
 * Builds a "Last, First M.I." display name from separate signup fields.
 * Used at signup time (stored once in user_metadata.full_name) so the rest
 * of the app — profile page, top bar, grading sheet export — can keep
 * reading a single `full_name` string without any other changes.
 */
export function buildFullName(firstName, lastName, middleInitial) {
  const first = (firstName || '').trim()
  const last = (lastName || '').trim()
  const mi = (middleInitial || '').trim().replace(/\.+$/, '')

  const namePart = [first, mi ? `${mi.toUpperCase()}.` : ''].filter(Boolean).join(' ')

  if (last && namePart) return `${last}, ${namePart}`
  return last || namePart || ''
}

export function isPasswordValid(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  )
}
