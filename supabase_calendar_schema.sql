-- ============================================================
-- Vyora Smart Calendar schema
-- Standalone calendar_events table (independent of the study
-- tracker). Reminder columns are included now so Phase 3
-- (email reminders) needs no further migration.
-- Safe to run multiple times.
-- ============================================================

create table if not exists public.calendar_events (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  date text not null,                 -- YYYY-MM-DD
  start_time text,                    -- HH:MM (null when all-day)
  end_time text,                      -- HH:MM
  all_day boolean default false,
  color text default '#7c3aed',
  category text default 'general',
  notes text default '',
  reminder_at timestamptz,            -- when to email (null = no reminder)
  reminder_email boolean default false,
  reminder_sent boolean default false,
  created_at timestamptz default now()
);

alter table public.calendar_events enable row level security;

drop policy if exists "Users can manage their own calendar events" on public.calendar_events;
create policy "Users can manage their own calendar events" on public.calendar_events
  for all using (auth.uid() = user_id);

-- Helpful index for the reminder worker (Phase 3) and per-user reads
create index if not exists calendar_events_user_date_idx
  on public.calendar_events (user_id, date);
create index if not exists calendar_events_reminder_idx
  on public.calendar_events (reminder_at)
  where reminder_email = true and reminder_sent = false;
