-- Run this in Supabase → SQL Editor if you already ran schema.sql before
-- the "section" (course/section dropdown) field was added. Safe to re-run.

alter table profiles add column if not exists section text;

-- Recreate the signup trigger so new signups also save the section.
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

-- Recreate the instructor view so it includes section.
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
