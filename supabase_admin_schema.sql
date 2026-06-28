-- ============================================================
-- Vyora admin portal — add an is_admin flag to profiles.
-- Run in Supabase SQL Editor, then set yourself as admin.
-- Safe to run multiple times.
-- ============================================================

alter table public.profiles
  add column if not exists is_admin boolean default false;

-- Make yourself an admin (replace with YOUR account email):
update public.profiles set is_admin = true
where email = 'yashraj@vyora.app';

-- The admin-stats Edge Function reads all-user data with the service
-- role and verifies the caller's is_admin before returning anything,
-- so no extra RLS policy is needed for the admin dashboard.
