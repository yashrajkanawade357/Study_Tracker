// Vyora — Smart Calendar reminder worker (Supabase Edge Function)
//
// Invoked on a schedule (pg_cron, every few minutes). It finds calendar
// events and tasks whose email reminder is due and not yet sent, emails
// the owner via Resend, and marks them sent.
//
// Required function secrets (Supabase > Edge Functions > Secrets):
//   RESEND_API_KEY   - your Resend API key
//   CRON_SECRET      - any random string; the cron caller must send it
//   REMINDER_FROM    - (optional) e.g. "Vyora <reminders@yourdomain.com>"
//                      defaults to Resend's sandbox sender
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";
const FROM = Deno.env.get("REMINDER_FROM") ?? "Vyora <onboarding@resend.dev>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function emailHtml(name: string, kind: "event" | "task", title: string, when: string) {
  const accent = kind === "task" ? "#06b6d4" : "#7c3aed";
  const label = kind === "task" ? "Task due" : "Upcoming event";
  return `<!doctype html><html><body style="margin:0;background:#0a0e1a;font-family:Inter,Arial,sans-serif;padding:24px">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#0f1629;border:1px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden">
      <tr><td style="height:4px;background:linear-gradient(90deg,#7c3aed,#06b6d4)"></td></tr>
      <tr><td style="padding:28px 28px 8px">
        <p style="margin:0 0 4px;color:${accent};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase">⏰ ${label}</p>
        <h1 style="margin:0;color:#fff;font-size:22px">${esc(title)}</h1>
      </td></tr>
      <tr><td style="padding:8px 28px 0">
        <p style="margin:0;color:#9aa3b2;font-size:14px">${esc(when)}</p>
      </td></tr>
      <tr><td style="padding:24px 28px 28px">
        <p style="margin:0;color:#c4c9d4;font-size:14px;line-height:1.6">Hi ${esc(name || "there")}, this is your Vyora reminder. Stay on track! 🚀</p>
      </td></tr>
      <tr><td style="padding:16px 28px;border-top:1px solid rgba(255,255,255,.06)">
        <p style="margin:0;color:#5b6472;font-size:12px">Sent by Vyora Smart Calendar</p>
      </td></tr>
    </table></body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) console.error("Resend error:", res.status, await res.text());
  return res.ok;
}

Deno.serve(async (req) => {
  // Auth: only the cron caller (with the shared secret) may trigger this.
  if (CRON_SECRET && req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const nowIso = new Date().toISOString();

  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, user_id, title, date, start_time, all_day")
    .eq("reminder_email", true).eq("reminder_sent", false).lte("reminder_at", nowIso);

  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, user_id, title, due_date, due_time")
    .eq("reminder_email", true).eq("reminder_sent", false).eq("completed", false).lte("reminder_at", nowIso);

  const userIds = [...new Set([...(events ?? []).map((e) => e.user_id), ...(tasks ?? []).map((t) => t.user_id)])];
  const userById: Record<string, { email: string; name: string }> = {};
  if (userIds.length) {
    const { data: profiles } = await supabase.from("profiles").select("id, email, name").in("id", userIds);
    (profiles ?? []).forEach((p) => { userById[p.id] = { email: p.email, name: p.name }; });
  }

  let sent = 0;
  const checked = (events?.length ?? 0) + (tasks?.length ?? 0);

  for (const e of events ?? []) {
    const u = userById[e.user_id];
    if (!u?.email) continue;
    const when = e.all_day ? `${e.date} · All day` : `${e.date}${e.start_time ? " · " + e.start_time : ""}`;
    if (await sendEmail(u.email, `⏰ Reminder: ${e.title}`, emailHtml(u.name, "event", e.title, when))) {
      await supabase.from("calendar_events").update({ reminder_sent: true }).eq("id", e.id);
      sent++;
    }
  }

  for (const t of tasks ?? []) {
    const u = userById[t.user_id];
    if (!u?.email) continue;
    const when = `Due ${t.due_date}${t.due_time ? " · " + t.due_time : ""}`;
    if (await sendEmail(u.email, `✅ Task due: ${t.title}`, emailHtml(u.name, "task", t.title, when))) {
      await supabase.from("tasks").update({ reminder_sent: true }).eq("id", t.id);
      sent++;
    }
  }

  return new Response(JSON.stringify({ ok: true, checked, sent, at: nowIso }), {
    headers: { "Content-Type": "application/json" },
  });
});
