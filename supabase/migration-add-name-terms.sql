-- Run this in Supabase → SQL Editor if you already ran schema.sql (and
-- migration-add-section.sql) before signup was split into first/last/M.I.
-- name fields and a Terms & Conditions checkbox was added.
--
-- IMPORTANT: The SQL Editor runs everything you paste in as one block, so
-- if you paste the whole file it either all succeeds or all rolls back
-- together — which makes it hard to tell which part failed. Instead, copy
-- and run ONE step at a time: select just the text under "STEP 1", paste it
-- in a new query, click Run, wait for "Success", then move to STEP 2, and
-- so on. Every step is safe to re-run if you need to repeat one.


-- =====================================================================
-- STEP 1 of 3 — add the new columns to profiles
-- =====================================================================
alter table profiles add column if not exists first_name text;
alter table profiles add column if not exists last_name text;
alter table profiles add column if not exists middle_initial text;
alter table profiles add column if not exists terms_accepted boolean not null default false;
alter table profiles add column if not exists terms_accepted_at timestamptz;


-- =====================================================================
-- STEP 2 of 3 — recreate the signup trigger
-- Builds full_name as "Last, First M.I." from the split signup fields
-- and records whether the Terms & Conditions checkbox was accepted.
-- full_name is still populated, so the profile page, top bar, and
-- grading sheet export keep working without any other changes.
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_first text := new.raw_user_meta_data ->> 'first_name';
  v_last text := new.raw_user_meta_data ->> 'last_name';
  v_mi text := new.raw_user_meta_data ->> 'middle_initial';
  v_full text := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    trim(both ', ' from
      coalesce(v_last, '') || ', ' || trim(coalesce(v_first, '') || ' ' ||
        case when v_mi is not null and v_mi <> '' then upper(left(v_mi, 1)) || '.' else '' end)
    )
  );
  v_terms boolean := coalesce((new.raw_user_meta_data ->> 'terms_accepted')::boolean, false);
begin
  insert into public.profiles (
    id, first_name, last_name, middle_initial, full_name, section,
    terms_accepted, terms_accepted_at
  )
  values (
    new.id, v_first, v_last, v_mi, v_full, new.raw_user_meta_data ->> 'section',
    v_terms, case when v_terms then now() else null end
  );
  return new;
end;
$$;


-- =====================================================================
-- STEP 3 of 3 — recreate the instructor view
-- Adds the split name fields and terms-acceptance status.
-- =====================================================================
drop view if exists instructor_scores;
create view instructor_scores as
select
  p.last_name,
  p.first_name,
  p.middle_initial,
  p.full_name,
  p.section,
  u.email,
  p.terms_accepted,
  e.exam_id,
  e.score,
  e.total,
  e.passed,
  e.created_at
from exam_attempts e
join profiles p on p.id = e.user_id
join auth.users u on u.id = e.user_id;

-- Done. New signups now go through the split name fields + terms
-- checkbox in the app, and profiles/instructor_scores reflect it.
-- Existing accounts created before this migration will have
-- first_name/last_name/middle_initial as null — their old full_name is
-- untouched, and terms_accepted defaults to false for them.
