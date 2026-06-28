// Vyora — admin portal backend (Supabase Edge Function)
//
// One endpoint for the read-only admin dashboard AND the privileged
// management actions. The browser only ever holds the anon key + the
// signed-in user's JWT; the service role key never leaves the server.
//
// Flow on every request:
//   1. CORS preflight (OPTIONS) is answered immediately.
//   2. The caller's JWT is read from the Authorization header and
//      validated with the service client.
//   3. We look up that user's profiles.is_admin. Non-admins get 403.
//   4. Only then do we touch all-user data.
//
// Body: { action: "stats" | "delete_user" | "set_admin", userId?, value? }
//   - stats        -> totals, per-user rows, growth series, recent activity
//   - delete_user  -> auth.admin.deleteUser(userId)  (cascades to all data)
//   - set_admin    -> profiles.is_admin = value for userId
//
// Keep verify_jwt ON for this function (the gateway rejects anonymous
// calls before they reach us; we still re-check is_admin ourselves).
//
// Env (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are injected automatically).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

// YYYY-MM-DD in UTC for grouping time series.
const dayKey = (d: string | Date) => new Date(d).toISOString().slice(0, 10);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    // --- authenticate the caller -------------------------------------
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "missing token" }, 401);

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    const caller = userData?.user;
    if (userErr || !caller) return json({ error: "invalid token" }, 401);

    const { data: callerProfile } = await admin
      .from("profiles")
      .select("is_admin")
      .eq("id", caller.id)
      .single();

    if (!callerProfile?.is_admin) return json({ error: "forbidden" }, 403);

    // --- parse the action --------------------------------------------
    let payload: { action?: string; userId?: string; value?: boolean } = {};
    if (req.method === "POST") {
      try { payload = await req.json(); } catch { /* default to stats */ }
    }
    const action = payload.action ?? "stats";

    // ===== management actions ========================================
    if (action === "delete_user") {
      if (!payload.userId) return json({ error: "userId required" }, 400);
      if (payload.userId === caller.id)
        return json({ error: "You can't delete your own account here." }, 400);
      const { error } = await admin.auth.admin.deleteUser(payload.userId);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action === "set_admin") {
      if (!payload.userId) return json({ error: "userId required" }, 400);
      if (payload.userId === caller.id && payload.value === false)
        return json({ error: "You can't remove your own admin access." }, 400);
      const { error } = await admin
        .from("profiles")
        .update({ is_admin: !!payload.value })
        .eq("id", payload.userId);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    if (action !== "stats") return json({ error: "unknown action" }, 400);

    // ===== stats =====================================================
    // Auth users give us signup + last-sign-in timestamps (profiles has
    // no created_at). For a small user base one page of 1000 is plenty.
    const { data: authList } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const authUsers = authList?.users ?? [];

    const [
      { data: profiles },
      { data: logs },
      { count: eventsCount },
      { count: tasksCount },
      { count: sleepCount },
      { data: feedback, count: feedbackCount },
    ] = await Promise.all([
      admin.from("profiles").select("id, email, name, xp, level, streak, is_admin"),
      admin.from("study_logs").select("user_id, hours, subject, date, timestamp"),
      admin.from("calendar_events").select("id", { count: "exact", head: true }),
      admin.from("tasks").select("id", { count: "exact", head: true }),
      admin.from("sleep_logs").select("id", { count: "exact", head: true }),
      admin.from("feedback")
        .select("id, name, email, rating, message, created_at", { count: "exact" })
        .order("created_at", { ascending: false }).limit(12),
    ]);

    const profileById = new Map(
      (profiles ?? []).map((p) => [p.id, p]),
    );
    const authById = new Map(authUsers.map((u) => [u.id, u]));

    // Per-user study aggregates.
    const perUser = new Map<string, { hours: number; sessions: number }>();
    let totalHours = 0;
    const hoursByDay: Record<string, number> = {};
    for (const l of logs ?? []) {
      const h = Number(l.hours) || 0;
      totalHours += h;
      const cur = perUser.get(l.user_id) ?? { hours: 0, sessions: 0 };
      cur.hours += h;
      cur.sessions += 1;
      perUser.set(l.user_id, cur);
      const k = l.date || (l.timestamp ? dayKey(l.timestamp) : null);
      if (k) hoursByDay[k] = (hoursByDay[k] || 0) + h;
    }

    // One row per user. Driven by auth.users so even users without a
    // profile row still appear; profile fields fall back gracefully.
    const users = authUsers.map((u) => {
      const p = profileById.get(u.id);
      const agg = perUser.get(u.id) ?? { hours: 0, sessions: 0 };
      return {
        id: u.id,
        email: p?.email ?? u.email ?? "",
        name: p?.name ?? (u.email ? u.email.split("@")[0] : "—"),
        xp: p?.xp ?? 0,
        level: p?.level ?? 1,
        streak: p?.streak ?? 0,
        isAdmin: !!p?.is_admin,
        createdAt: u.created_at ?? null,
        lastSignInAt: u.last_sign_in_at ?? null,
        hours: Math.round(agg.hours * 10) / 10,
        sessions: agg.sessions,
      };
    });

    // Signups-per-day series.
    const signupsByDay: Record<string, number> = {};
    for (const u of authUsers) {
      if (!u.created_at) continue;
      const k = dayKey(u.created_at);
      signupsByDay[k] = (signupsByDay[k] || 0) + 1;
    }
    const toSeries = (obj: Record<string, number>, key: string) =>
      Object.keys(obj)
        .sort()
        .map((date) => ({ date, [key]: Math.round(obj[date] * 10) / 10 }));

    // Recent activity.
    const recentSignups = [...users]
      .filter((u) => u.createdAt)
      .sort((a, b) => +new Date(b.createdAt!) - +new Date(a.createdAt!))
      .slice(0, 6)
      .map((u) => ({ name: u.name, email: u.email, createdAt: u.createdAt }));

    const recentLogs = [...(logs ?? [])]
      .sort(
        (a, b) =>
          +new Date(b.timestamp || b.date) - +new Date(a.timestamp || a.date),
      )
      .slice(0, 8)
      .map((l) => {
        const p = profileById.get(l.user_id) ?? authById.get(l.user_id);
        return {
          name: p?.name ?? p?.email?.split("@")[0] ?? "Unknown",
          subject: l.subject,
          hours: Number(l.hours) || 0,
          when: l.timestamp || l.date,
        };
      });

    return json({
      totals: {
        users: authUsers.length,
        studyHours: Math.round(totalHours * 10) / 10,
        sessions: (logs ?? []).length,
        events: eventsCount ?? 0,
        tasks: tasksCount ?? 0,
        sleepLogs: sleepCount ?? 0,
        feedback: feedbackCount ?? 0,
      },
      users,
      growth: {
        signups: toSeries(signupsByDay, "signups"),
        hours: toSeries(hoursByDay, "hours"),
      },
      recent: { signups: recentSignups, logs: recentLogs },
      feedback: feedback ?? [],
    });
  } catch (err) {
    console.error("admin-stats error:", err);
    return json({ error: String(err) }, 500);
  }
});
