-- ============================================================
-- Vyora admin portal — add an is_admin flag to profiles and
-- lock it down so only the service role (the admin-stats Edge
-- Function) can ever change it.
-- Run in the Supabase SQL Editor. Safe to run multiple times.
-- ============================================================

alter table public.profiles
  add column if not exists is_admin boolean default false;

-- ------------------------------------------------------------
-- 1. Make YOURSELF an admin.
--    >>> Replace the email below with the email you sign in to
--    >>> Vyora with, then run this file.
-- ------------------------------------------------------------
update public.profiles set is_admin = true
where email = 'YOUR_EMAIL_HERE@example.com';   -- <<< CHANGE ME

-- ------------------------------------------------------------
-- 2. Privilege-escalation guard.
--    The existing profiles UPDATE policy is `auth.uid() = id`,
--    which on its own would let any signed-in user flip their
--    OWN is_admin to true. This trigger silently reverts any
--    is_admin change that does NOT come from the service role,
--    so admin status can only be granted/revoked by the
--    admin-stats Edge Function (or directly here in SQL).
-- ------------------------------------------------------------
create or replace function public.guard_is_admin()
returns trigger as $$
begin
  if new.is_admin is distinct from old.is_admin
     and coalesce(auth.role(), '') <> 'service_role' then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists guard_is_admin_trg on public.profiles;
create trigger guard_is_admin_trg
  before update on public.profiles
  for each row execute procedure public.guard_is_admin();

-- The admin-stats Edge Function reads all-user data with the service
-- role and verifies the caller's is_admin before returning anything,
-- so no extra RLS read policy is needed for the admin dashboard.
