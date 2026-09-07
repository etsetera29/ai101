/**
 * Manual exam gate.
 *
 * Flip a value to `true` to LOCK that exam for every student, regardless of
 * whether they've finished the required lessons. Flip it to `false` to
 * UNLOCK it again. This is meant to be edited by hand right in this file —
 * there's no in-app toggle for students.
 *
 * After changing a value, commit and push (or re-deploy) so Vercel picks it
 * up. There's no server involved, so a redeploy is required for the change
 * to reach students — toggling locally and refreshing your own browser
 * without deploying will not affect anyone else.
 */
export const EXAM_LOCKS = {
  exam1: false,
  exam2: true,
  exam3: true,
}
