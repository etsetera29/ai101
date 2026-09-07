-- Migration: keep only the highest-scoring exam attempt per (user, exam).
--
-- Run this once in the Supabase SQL Editor. It:
--   1. Collapses any existing duplicate rows per (user_id, exam_id) down to
--      the single highest-scoring one (ties broken by most recent).
--   2. Adds a unique constraint on (user_id, exam_id) so the app's
--      `.upsert(..., { onConflict: 'user_id,exam_id' })` call works.
--   3. Adds an UPDATE policy — the existing RLS only allowed INSERT, but an
--      upsert that overwrites an existing row needs UPDATE too.
--
-- Safe to run more than once.

-- 1. Dedup: for each (user_id, exam_id), keep only the row with the
--    highest score (ties broken by the most recent created_at), delete the rest.
delete from exam_attempts a
using exam_attempts b
where a.user_id = b.user_id
  and a.exam_id = b.exam_id
  and (
    b.score > a.score
    or (b.score = a.score and b.created_at > a.created_at)
    or (b.score = a.score and b.created_at = a.created_at and b.id > a.id)
  );

-- 2. Unique constraint required for the app's upsert onConflict target.
alter table exam_attempts
  drop constraint if exists exam_attempts_user_exam_unique;
alter table exam_attempts
  add constraint exam_attempts_user_exam_unique unique (user_id, exam_id);

-- 3. Allow students to update their own existing row (needed for upsert).
drop policy if exists "exam_attempts: update own" on exam_attempts;
create policy "exam_attempts: update own" on exam_attempts
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
