-- ============================================================
-- Vyora — landing-page feedback form
-- A public table anyone (even logged-out visitors) can submit to.
-- Submissions are NOT publicly readable — only the service role
-- (admin tooling) can read them. Safe to run multiple times.
-- ============================================================

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  rating integer,                 -- optional 1–5 star rating
  message text not null,
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

-- Anyone (anon or authenticated) may submit feedback...
drop policy if exists "Anyone can submit feedback" on public.feedback;
create policy "Anyone can submit feedback" on public.feedback
  for insert with check (true);

-- ...but nobody can read it through the public API. Reads happen only
-- via the service role (e.g. an admin function), which bypasses RLS.
