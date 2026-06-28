-- ============================================================
-- Vyora — DEMO ACCOUNT nightly auto-reset
--
-- Wraps the demo seed in a function and schedules it with pg_cron
-- so the demo account is wiped & reseeded every night. Judges can
-- edit/delete anything during the day; it's fresh the next morning.
--
-- PREREQUISITES:
--   * The demo auth user (demo@vyora.app) already exists.
--   * pg_cron is enabled (it already is — used by the reminder cron).
--
-- Run this whole file once in the SQL Editor. Safe to re-run.
-- ============================================================

create extension if not exists pg_cron;

-- ---- the reseed function (same data as supabase_demo_seed.sql) ----
create or replace function public.reseed_demo_account()
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  demo_email text := 'demo@vyora.app';
  uid uuid;
  subj text[] := array['Mathematics','Physics','Computer Science','Chemistry','English'];
begin
  select id into uid from auth.users where email = demo_email;
  if uid is null then
    raise notice 'Demo reset skipped: no auth user with email %.', demo_email;
    return;
  end if;

  -- wipe previous demo data
  delete from public.study_logs      where user_id = uid;
  delete from public.sleep_logs      where user_id = uid;
  delete from public.exams           where user_id = uid;
  delete from public.subjects        where user_id = uid;
  delete from public.achievements    where user_id = uid;
  delete from public.calendar_events where user_id = uid;
  delete from public.tasks           where user_id = uid;

  -- profile (non-admin; onboarding/manual gates skipped)
  insert into public.profiles
    (id, email, name, xp, level, streak, last_log_date, avatar, bio,
     has_seen_manual, has_completed_setup, is_admin)
  values
    (uid, demo_email, 'Demo Student', 1850, 19, 32,
     to_char(current_date, 'YYYY-MM-DD'), '🚀',
     'Exploring Vyora — exam season grind. 📚',
     true, true, false)
  on conflict (id) do update set
     name = excluded.name, xp = excluded.xp, level = excluded.level,
     streak = excluded.streak, last_log_date = excluded.last_log_date,
     avatar = excluded.avatar, bio = excluded.bio,
     has_seen_manual = true, has_completed_setup = true, is_admin = false;

  -- subjects
  insert into public.subjects (id, user_id, name, color, weekly_goal) values
    ('demo-sub-1', uid, 'Mathematics',      '#7c3aed', 10),
    ('demo-sub-2', uid, 'Physics',          '#06b6d4', 8),
    ('demo-sub-3', uid, 'Computer Science', '#10b981', 9),
    ('demo-sub-4', uid, 'Chemistry',        '#f59e0b', 6),
    ('demo-sub-5', uid, 'English',          '#ef4444', 4);

  -- study logs: ~75 days for charts/heatmap
  insert into public.study_logs (id, user_id, subject, hours, note, timestamp, date)
  select
    'demo-log-' || to_char(day, 'YYYYMMDD') || '-' || s,
    uid,
    subj[1 + floor(random()*5)::int],
    round((0.5 + random()*3)::numeric, 1),
    (array['Revision','Practice problems','New chapter','Past paper',
           'Group study','Flashcards'])[1 + floor(random()*6)::int],
    day::timestamp + make_interval(hours => 9 + floor(random()*11)::int,
                                   mins  => floor(random()*60)::int),
    to_char(day, 'YYYY-MM-DD')
  from (
    select (current_date - make_interval(days => d))::date as day, s
    from generate_series(0, 74) d
    cross join generate_series(1, 2) s
    where s = 1 or random() > 0.4
  ) g;

  -- special sessions backing a few achievements
  insert into public.study_logs (id, user_id, subject, hours, note, timestamp, date) values
    ('demo-special-early', uid, 'Mathematics', 1.5, 'Early morning focus',
       current_date::timestamp + interval '6 hours 15 minutes', to_char(current_date,'YYYY-MM-DD')),
    ('demo-special-night', uid, 'Physics', 1.0, 'Late-night cram',
       (current_date - 1)::timestamp + interval '23 hours 10 minutes', to_char(current_date - 1,'YYYY-MM-DD')),
    ('demo-special-marathon', uid, 'Computer Science', 4.5, 'Project deep work',
       (current_date - 3)::timestamp + interval '13 hours', to_char(current_date - 3,'YYYY-MM-DD'));

  -- sleep logs (last 21 days)
  insert into public.sleep_logs (id, user_id, sleep_hours, date, quality, notes)
  select
    'demo-sleep-' || to_char(day, 'YYYYMMDD'),
    uid, round((6 + random()*2.5)::numeric, 1),
    to_char(day, 'YYYY-MM-DD'), 3 + floor(random()*3)::int, ''
  from (select (current_date - make_interval(days => d))::date as day
        from generate_series(0, 20) d) g;

  -- upcoming exams (relative to today, so they stay "upcoming")
  insert into public.exams (id, user_id, name, date, subject) values
    ('demo-exam-1', uid, 'Calculus Midterm',  to_char(current_date + 4,  'YYYY-MM-DD'), 'Mathematics'),
    ('demo-exam-2', uid, 'Physics Unit Test', to_char(current_date + 9,  'YYYY-MM-DD'), 'Physics'),
    ('demo-exam-3', uid, 'CS Final Project',  to_char(current_date + 18, 'YYYY-MM-DD'), 'Computer Science');

  -- achievements
  insert into public.achievements (id, user_id, unlocked, unlocked_at)
  select a, uid, true, (now() - make_interval(days => (random()*40)::int))::text
  from unnest(array[
    'first_log','fifty_hours','hundred_hours','streak_7','streak_30',
    'subject_master','polymath','marathoner','weekend_warrior',
    'early_bird','night_owl','goal_crusher'
  ]) a;

  -- calendar events (next week; reminders off)
  insert into public.calendar_events
    (id, user_id, title, date, start_time, end_time, all_day, color, category, notes,
     reminder_email, reminder_sent)
  values
    ('demo-evt-1', uid, 'Study group — Calculus', to_char(current_date + 1,'YYYY-MM-DD'), '17:00','18:30', false, '#7c3aed','study','', false, false),
    ('demo-evt-2', uid, 'Physics lab',            to_char(current_date + 2,'YYYY-MM-DD'), '11:00','13:00', false, '#06b6d4','class','', false, false),
    ('demo-evt-3', uid, 'Revision day',           to_char(current_date + 5,'YYYY-MM-DD'), null,    null,    true,  '#10b981','study','', false, false);

  -- tasks (reminders off)
  insert into public.tasks
    (id, user_id, title, notes, priority, category, due_date, due_time, completed, completed_at,
     sort_order, reminder_email, reminder_sent)
  values
    ('demo-task-1', uid, 'Finish problem set 7', '', 'high',   'study', to_char(current_date + 1,'YYYY-MM-DD'), '20:00', false, null, 1, false, false),
    ('demo-task-2', uid, 'Read Chapter 12',      '', 'medium', 'study', to_char(current_date + 3,'YYYY-MM-DD'), null,    false, null, 2, false, false),
    ('demo-task-3', uid, 'Submit CS assignment', '', 'high',   'study', to_char(current_date + 6,'YYYY-MM-DD'), '23:59', false, null, 3, false, false),
    ('demo-task-4', uid, 'Make flashcards',      '', 'low',    'study', to_char(current_date - 1,'YYYY-MM-DD'), null,    true,  now(), 4, false, false);
end $fn$;

-- ---- schedule it nightly --------------------------------------
-- 21:30 UTC = 03:00 IST — runs in the small hours so the demo is
-- fresh before the judging day. Change the cron expression if you
-- prefer a different time (format: min hour day month weekday, UTC).
do $sched$
begin
  -- remove any previous version of this job so we don't double-schedule
  perform cron.unschedule(jobid)
  from cron.job
  where jobname = 'reseed-demo-account';

  perform cron.schedule(
    'reseed-demo-account',
    '30 21 * * *',
    'select public.reseed_demo_account();'
  );
end $sched$;

-- Run it once now so the schedule is proven and the data is fresh.
select public.reseed_demo_account();

-- Handy checks:
--   select jobid, jobname, schedule, active from cron.job where jobname = 'reseed-demo-account';
--   select * from cron.job_run_details order by start_time desc limit 5;
