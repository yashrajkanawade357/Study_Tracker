-- ============================================================
-- Vyora onboarding migration
-- Adds DB-backed onboarding flags so the User Manual and the
-- Account Setup wizard show reliably per-account (not just via
-- local storage). Safe to run multiple times.
-- ============================================================

-- 1. Add onboarding flag columns to profiles
alter table public.profiles
  add column if not exists has_seen_manual boolean default false,
  add column if not exists has_completed_setup boolean default false;

-- 2. Mark existing/active users as already onboarded so they don't
--    get the manual + setup again (anyone who already has data).
update public.profiles p
set has_seen_manual = true,
    has_completed_setup = true
where exists (select 1 from public.study_logs s where s.user_id = p.id)
   or exists (select 1 from public.subjects su where su.user_id = p.id);

-- 3. Replace the auto-create-profile trigger:
--    - fixes the broken avatar literal (was 'uD83CuDF93')
--    - seeds the new onboarding flags as false
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
