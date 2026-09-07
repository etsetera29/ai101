-- Run this once in Supabase → SQL Editor → New Query → Run.
-- Safe to re-run: uses "if not exists" / "or replace" throughout.

-- ---------- profiles (one row per student) ----------
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  middle_initial text,
  full_name text,
  section text,
  terms_accepted boolean not null default false,
  terms_accepted_at timestamptz,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "profiles: select own" on profiles;
create policy "profiles: select own" on profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on profiles;
create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles: insert own" on profiles;
create policy "profiles: insert own" on profiles
  for insert with check (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up. Builds full_name as
-- "Last, First M.I." from the split signup fields and records whether the
-- Terms & Conditions checkbox was accepted.
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- progress (finished lessons) ----------
create table if not exists progress (
  user_id uuid references auth.users on delete cascade not null,
  week_id text not null,
  finished_at timestamptz default now(),
  primary key (user_id, week_id)
);

alter table progress enable row level security;

drop policy if exists "progress: select own" on progress;
create policy "progress: select own" on progress
  for select using (auth.uid() = user_id);

drop policy if exists "progress: insert own" on progress;
create policy "progress: insert own" on progress
  for insert with check (auth.uid() = user_id);

drop policy if exists "progress: delete own" on progress;
create policy "progress: delete own" on progress
  for delete using (auth.uid() = user_id);

-- ---------- exam_attempts (every submitted attempt, kept for history) ----------
create table if not exists exam_attempts (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  exam_id text not null,
  score int not null,
  total int not null,
  passed boolean not null,
  created_at timestamptz default now()
);

alter table exam_attempts enable row level security;

drop policy if exists "exam_attempts: select own" on exam_attempts;
create policy "exam_attempts: select own" on exam_attempts
  for select using (auth.uid() = user_id);

drop policy if exists "exam_attempts: insert own" on exam_attempts;
create policy "exam_attempts: insert own" on exam_attempts
  for insert with check (auth.uid() = user_id);

-- ---------- instructor view ----------
-- Handy read-only view for you (the instructor) to check in the Supabase
-- Table Editor / SQL Editor. Run this as yourself in the SQL Editor
-- (which uses the postgres role and bypasses RLS), e.g.:
--   select * from instructor_scores order by full_name, exam_id, created_at;
create or replace view instructor_scores as
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
