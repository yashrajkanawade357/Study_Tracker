-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table (linked to Auth.Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text,
  xp integer default 0,
  level integer default 1,
  streak integer default 0,
  last_log_date text,
  avatar text default '🎓',
  bio text default '',
  linkedin text default '',
  instagram text default '',
  has_seen_manual boolean default false,
  has_completed_setup boolean default false
);

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Policies for Profiles (drop first to avoid duplicate errors)
drop policy if exists "Allow public read access to profiles" on public.profiles;
drop policy if exists "Allow users to update their own profile" on public.profiles;
drop policy if exists "Allow users to insert their own profile" on public.profiles;

create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow users to insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 2. Create Subjects Table
create table if not exists public.subjects (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text not null,
  weekly_goal numeric not null
);

alter table public.subjects enable row level security;

drop policy if exists "Users can manage their own subjects" on public.subjects;
create policy "Users can manage their own subjects" on public.subjects
  for all using (auth.uid() = user_id);

-- 3. Create Study Logs Table
create table if not exists public.study_logs (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject text not null,
  hours numeric not null,
  note text default '',
  timestamp timestamptz default now(),
  date text not null
);

alter table public.study_logs enable row level security;

drop policy if exists "Users can manage their own study logs" on public.study_logs;
create policy "Users can manage their own study logs" on public.study_logs
  for all using (auth.uid() = user_id);

-- 4. Create Sleep Logs Table
create table if not exists public.sleep_logs (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  sleep_hours numeric not null,
  date text not null,
  quality integer,
  notes text default ''
);

alter table public.sleep_logs enable row level security;

drop policy if exists "Users can manage their own sleep logs" on public.sleep_logs;
create policy "Users can manage their own sleep logs" on public.sleep_logs
  for all using (auth.uid() = user_id);

-- 5. Create Exams Table
create table if not exists public.exams (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  date text not null,
  subject text not null
);

alter table public.exams enable row level security;

drop policy if exists "Users can manage their own exams" on public.exams;
create policy "Users can manage their own exams" on public.exams
  for all using (auth.uid() = user_id);

-- 6. Create Achievements Table
create table if not exists public.achievements (
  id text not null,
  user_id uuid references auth.users on delete cascade not null,
  unlocked boolean default false,
  unlocked_at text,
  primary key (user_id, id)
);

alter table public.achievements enable row level security;

drop policy if exists "Users can manage their own achievements" on public.achievements;
create policy "Users can manage their own achievements" on public.achievements
  for all using (auth.uid() = user_id);


-- Auto-create profile trigger (run this in SQL Editor)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, xp, level, streak, last_log_date, avatar, has_seen_manual, has_completed_setup)
  values (new.id, new.email, split_part(new.email, '@', 1), 0, 1, 0, null, '🎓', false, false)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
