-- ============================================================
-- Vyora Task Manager schema
-- Standalone tasks table for the Smart Calendar app. Reminder
-- columns are included now so Phase 3 (email reminders) needs
-- no further migration. Safe to run multiple times.
-- ============================================================

create table if not exists public.tasks (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  notes text default '',
  priority text default 'medium',     -- low | medium | high
  category text default 'general',
  due_date text,                      -- YYYY-MM-DD (null = no due date)
  due_time text,                      -- HH:MM (optional)
  completed boolean default false,
  completed_at timestamptz,
  sort_order integer default 0,
  reminder_at timestamptz,            -- when to email (null = no reminder)
  reminder_email boolean default false,
  reminder_sent boolean default false,
  created_at timestamptz default now()
);

alter table public.tasks enable row level security;

drop policy if exists "Users can manage their own tasks" on public.tasks;
create policy "Users can manage their own tasks" on public.tasks
  for all using (auth.uid() = user_id);

create index if not exists tasks_user_due_idx on public.tasks (user_id, due_date);
create index if not exists tasks_reminder_idx
  on public.tasks (reminder_at)
  where reminder_email = true and reminder_sent = false and completed = false;
