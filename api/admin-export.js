import { createClient } from '@supabase/supabase-js'

// Admin-only endpoint. The admin passphrase (ADMIN_EXPORT_KEY) and the
// Supabase service/secret key (SUPABASE_SECRET_KEY) are both server-only
// env vars — neither is ever sent to the browser. This is the ONLY place
// in the app that reads across all students; every other query goes
// through Supabase Row Level Security scoped to the logged-in user.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { adminKey, action, section } = req.body || {}

  if (!process.env.ADMIN_EXPORT_KEY) {
    return res.status(500).json({ error: 'Admin export is not configured on the server yet.' })
  }

  if (!adminKey || adminKey !== process.env.ADMIN_EXPORT_KEY) {
    return res.status(401).json({ error: 'Invalid admin key.' })
  }

  if (action === 'verify') {
    return res.status(200).json({ ok: true })
  }

  if (action !== 'export') {
    return res.status(400).json({ error: 'Unknown action.' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Supabase server credentials are not configured.' })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    let profileQuery = supabaseAdmin.from('profiles').select('id, full_name, section')
    if (section && section !== 'ALL') {
      profileQuery = profileQuery.eq('section', section)
    }
    const { data: profiles, error: profileErr } = await profileQuery
    if (profileErr) throw profileErr

    if (!profiles || profiles.length === 0) {
      return res.status(200).json({ students: [] })
    }

    const userIds = profiles.map((p) => p.id)

    const [{ data: authUsersData, error: authErr }, { data: progressRows, error: progressErr }, { data: examRows, error: examErr }] =
      await Promise.all([
        supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
        supabaseAdmin.from('progress').select('user_id, week_id').in('user_id', userIds),
        supabaseAdmin
          .from('exam_attempts')
          .select('user_id, exam_id, score, total, passed')
          .in('user_id', userIds),
      ])

    if (authErr) throw authErr
    if (progressErr) throw progressErr
    if (examErr) throw examErr

    const emailById = Object.fromEntries((authUsersData.users || []).map((u) => [u.id, u.email]))

    const finishedByUser = {}
    for (const row of progressRows || []) {
      if (!finishedByUser[row.user_id]) finishedByUser[row.user_id] = []
      finishedByUser[row.user_id].push(row.week_id)
    }

    const examsByUser = {}
    for (const row of examRows || []) {
      if (!examsByUser[row.user_id]) examsByUser[row.user_id] = {}
      if (!examsByUser[row.user_id][row.exam_id]) examsByUser[row.user_id][row.exam_id] = []
      examsByUser[row.user_id][row.exam_id].push({
        score: row.score,
        total: row.total,
        passed: row.passed,
      })
    }

    const students = profiles.map((p) => ({
      fullName: p.full_name || '(no name)',
      email: emailById[p.id] || '',
      section: p.section || '(none)',
      finishedWeekIds: finishedByUser[p.id] || [],
      examAttempts: examsByUser[p.id] || {},
    }))

    return res.status(200).json({ students })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Export failed.' })
  }
}
