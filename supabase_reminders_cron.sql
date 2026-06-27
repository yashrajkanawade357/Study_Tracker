-- ============================================================
-- Vyora — schedule the email-reminder worker
-- Runs the "send-reminders" Edge Function every 5 minutes via
-- pg_cron + pg_net.
--
-- BEFORE running:
--   1. Enable the "pg_cron" and "pg_net" extensions
--      (Dashboard > Database > Extensions).
--   2. Deploy the send-reminders Edge Function.
--   3. Replace <PROJECT_REF> with your project ref (the subdomain in
--      your Supabase URL, e.g. abcd1234) and <CRON_SECRET> with the
--      same value you set in the function's CRON_SECRET secret.
-- ============================================================

-- (Re)create the schedule. Unschedule first so re-running is safe.
select cron.unschedule('vyora-send-reminders')
where exists (select 1 from cron.job where jobname = 'vyora-send-reminders');

select cron.schedule(
  'vyora-send-reminders',
  '*/5 * * * *',                       -- every 5 minutes
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-cron-secret', '<CRON_SECRET>'
               ),
    body    := '{}'::jsonb
  );
  $$
);

-- Inspect scheduled jobs:
--   select * from cron.job;
-- Inspect recent runs:
--   select * from cron.job_run_details order by start_time desc limit 20;
-- Remove the schedule:
--   select cron.unschedule('vyora-send-reminders');
