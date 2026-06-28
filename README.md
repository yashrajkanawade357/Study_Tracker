# Vyora — AI-Powered Study & Productivity Platform

> **Study smarter, achieve more.** One account, two apps: a gamified **Study Tracker** and a **Smart Calendar**, wrapped with AI coaching, voice control, and a secure admin portal.

🔗 **Live:** [study-tracker-eight-delta.vercel.app](https://study-tracker-eight-delta.vercel.app)

---

## 🧑‍⚖️ For hackathon judges — start here

**Try it instantly — no signup:**
1. Open the [live site](https://study-tracker-eight-delta.vercel.app) → go to **Log in**.
2. Click the **🚀 Explore the demo** button. You're dropped straight into a fully populated account (≈75 days of study data, streaks, achievements, calendar events, tasks).

**See the admin portal:**
- In the sidebar you'll notice an **Admin** tab with a 🔒. It's normally restricted to admins.
- Click it and enter the access password: **`VyoraAdmin2026`**
- This opens a **read-only preview** of the admin dashboard (sample data; actions disabled) so you can see the platform-oversight features without touching real data. The live, operational version is restricted to the owner's account.

> The demo account resets automatically every night, so it's always fresh.

---

## ✨ Features

### 📚 Study Tracker
- **Session logging** with subjects, hours, and notes — plus a one-tap Quick Log.
- **Gamification** — XP, levels, streaks, and 18 unlockable achievements with shareable certificates.
- **Deep analytics** — a GitHub-style 365-day heatmap, weekly/monthly trends, and projected-vs-actual goals.
- **Pomodoro timer** that auto-logs focused sessions.
- **AI Study Coach** — generates personalized study plans, an Exam Readiness score, and a Weekly Check-in.

### 📅 Smart Calendar (second app, same account)
- **Calendar** with Month / Week / Day / Agenda views.
- **Task Manager** with priorities and due dates, surfaced on the calendar.
- **Email reminders** for events and tasks, delivered on schedule.
- **AI Voice Assistant** — hands-free, confirm-first; add tasks and build study plans by talking.
- **Document & Email Summariser** — drop in a PDF/Word doc or paste text → AI summary + text-to-speech.
- **Timetable import** — snap a photo of your timetable → AI vision → recurring calendar events.

### 🛡️ Admin Portal *(role-gated)*
- Platform KPIs: users, study hours, sessions, calendar events, tasks.
- Signup-growth and study-hours charts.
- Searchable user table with management actions (grant/revoke admin, delete user).

---

## 🏗️ Architecture & tech

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion, Recharts |
| Routing | React Router |
| Backend / Auth / DB | Supabase (Postgres + Row Level Security) |
| Serverless | Supabase Edge Functions (Deno) |
| Scheduling | `pg_cron` (email reminders + nightly demo reset) |
| Email | Gmail SMTP via an Edge Function |
| AI | Pluggable provider (OpenAI / Anthropic / Gemini), proxied so keys stay server-side |
| Hosting | Vercel (auto-deploy from `main`) |

### Security highlights
The admin portal was built **secure by design**, not just functional:

- **Service-role isolation** — all admin reads/writes go through an Edge Function (`admin-stats`) that holds the Supabase **service role key on the server only**. The browser never sees it.
- **Defense in depth** — the function independently re-verifies the caller's JWT *and* their `is_admin` flag before returning anything, even though Supabase's gateway already enforces JWT.
- **Escalation-proof** — a Postgres `BEFORE UPDATE` trigger reverts any change to `is_admin` that doesn't come from the service role, so a user can't grant themselves admin even by calling the database directly.
- **Row Level Security** on every user table, scoping data to its owner.

---

## 📂 Project structure

```
src/
  pages/         Dashboard, Analytics, Calendar, Tasks, Summariser, Admin, Auth, Landing, …
  components/    Sidebar, Navbar, Layout, AdminGate, VoiceAssistant, Onboarding, …
  context/       AppContext, CalendarContext, TaskContext
  utils/         supabaseClient, AI helpers, study-plan / summarise / vision logic
supabase/
  functions/     admin-stats (admin API), send-reminders (email worker)
supabase_*.sql   schema, reminders cron, admin schema, demo seed, demo reset cron
```

---

## 🚀 Run locally

```bash
npm install

# .env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

npm run dev      # http://localhost:5173
npm run build    # production build
```

> Without Supabase credentials the app runs in **offline mode** using `localStorage`, so you can explore the UI with no backend.

---

## 👤 Author

**Yashraj Kanawade** — Creator of Vyora.

*Built for busy minds: students drowning in syllabi and professionals drowning in inboxes. Vyora turns scattered effort into tracked, measurable progress.*
