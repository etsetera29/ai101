-- Run this once in Supabase → SQL Editor → New Query → Run.
-- Safe to re-run: uses "if not exists" / "or replace" throughout.

-- ---------- profiles (one row per student) ----------
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  section text,
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

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, section)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'section');
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
  p.full_name,
  p.section,
  u.email,
  e.exam_id,
  e.score,
  e.total,
  e.passed,
  e.created_at
from exam_attempts e
join profiles p on p.id = e.user_id
join auth.users u on u.id = e.user_id;
