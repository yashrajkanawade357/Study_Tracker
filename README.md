# Vyora — AI-Powered Study & Productivity Platform

> **An AI productivity companion that *acts*, not just reminds.** One account, two apps — a gamified **Study Tracker** and a **Smart Calendar** — driven by autonomous AI agents that plan your week, prioritize what matters, and complete tasks on your behalf.

🔗 **Live (Google Cloud):** **[vyora-3d282.web.app](https://vyora-3d282.web.app)**
🔁 Mirror (Vercel): [study-tracker-eight-delta.vercel.app](https://study-tracker-eight-delta.vercel.app)

---

## 🏆 Vibe2Ship submission

**Problem statement — *The Last-Minute Life Saver.*** Students, professionals, and entrepreneurs constantly miss deadlines, assignments, meetings, and commitments. Existing tools rely on **passive reminders that are easy to ignore** and do little to help users actually *complete* their tasks.

**Vyora's answer:** an AI companion whose agents follow a **perceive → plan → confirm → act** loop and write real changes into your schedule — so deadlines get *managed*, not missed.

| Requested feature | In Vyora |
|---|---|
| Intelligent task prioritization | Priority tasks + AI exam-readiness scoring |
| AI-powered scheduling assistance | AI Coach builds & installs study plans into the calendar |
| Personalized recommendations | Coaching drawn from your real data and pace |
| Context-aware reminders | Automatic email reminders on any event or task |
| Calendar integration | Built-in Smart Calendar (month / week / day / agenda) |
| Goal & habit tracking | Goals, streaks, 365-day analytics heatmap |
| Voice-enabled assistance | Hands-free voice agent that confirms, then acts |
| **Autonomous task planning & execution** | Agents create events, tasks, and plans autonomously |

---

## 🧑‍⚖️ For hackathon judges — start here

**Try it instantly — no signup:**
1. Open the [live site](https://vyora-3d282.web.app) → go to **Log in**.
2. Click **🚀 Explore the demo** — you're dropped into a fully populated account (≈75 days of study data, streaks, achievements, calendar events, tasks).

**See the AI agents (the core of the project):**
- Go to **Settings → add a Gemini API key** (free tier works), then open **AI Coach** or the **Voice Assistant**.
- Try: *"Build me a study plan for my exam next Friday"* — watch it generate a plan, confirm, and write study blocks + tasks straight into the calendar.

**See the admin portal:**
- The sidebar has an **Admin** tab (🔒). Click it and enter the preview password **`VyoraAdmin2026`** for a read-only dashboard (sample data; actions disabled). The live operational version is restricted to the owner's account.

> The demo account resets automatically every night, so it's always fresh.

---

## 🤖 Agentic depth — how the AI actually acts

Vyora's intelligence is **agentic, not conversational**. Each agent is autonomous (decides *what* to create), bounded (confirms before mutating data), and grounded (reads your real subjects, goals, and history):

- **AI Voice Assistant** — interprets natural speech, proposes a concrete action, confirms, then executes against the calendar/task store. Hands-free, with spoken replies.
- **AI Study Coach** — turns a single goal into a scheduled week of study blocks and revision tasks, plus an exam-readiness score so you know what to prioritize.
- **Timetable Vision agent** — a photo → Gemini vision extracts the schedule → recurring calendar events created automatically, zero manual entry.

---

## ✨ Features

### 📚 Study Tracker
- **Session logging** with subjects, hours, and notes — plus a one-tap Quick Log.
- **Gamification** — XP, levels, streaks, and 18 unlockable achievements with shareable certificates.
- **Deep analytics** — a GitHub-style 365-day heatmap, weekly/monthly trends, projected-vs-actual goals.
- **Pomodoro timer** that auto-logs focused sessions.
- **AI Study Coach** — personalized study plans, an Exam Readiness score, and a Weekly Check-in.

### 📅 Smart Calendar (second app, same account)
- **Calendar** with Month / Week / Day / Agenda views.
- **Task Manager** with priorities and due dates, surfaced on the calendar.
- **Email reminders** for events and tasks, delivered on schedule.
- **AI Voice Assistant** — hands-free, confirm-first; add tasks and build study plans by talking.
- **Document & Email Summariser** — drop in a PDF/Word doc or paste text → AI summary + text-to-speech.
- **Timetable import** — snap a photo → AI vision → recurring calendar events.

### 📱 Installable PWA
- Installs from the browser (no app store) on Android, iOS, and desktop.
- Offline support via a precached app shell, home-screen icon, and quick-action shortcuts.

### 🛡️ Admin Portal *(role-gated)*
- Platform KPIs: users, study hours, sessions, calendar events, tasks.
- Signup-growth and study-hours charts.
- Searchable user table with management actions (grant/revoke admin, delete user).

---

## ☁️ Google Technologies Utilized

| Google tech | How Vyora uses it |
|---|---|
| **Google Cloud — Firebase Hosting** | Hosts and publicly serves the entire app (CDN-delivered SPA) at [vyora-3d282.web.app](https://vyora-3d282.web.app) |
| **Google Gemini API** | Powers every agentic capability — voice understanding, autonomous plan generation, document summarisation, and **Gemini vision** for timetable analysis |
| **Firebase platform** | Project hosting, global delivery, SPA routing (Spark plan) |

---

## 🏗️ Architecture & tech

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion, Recharts |
| Routing | React Router (route-level code-splitting via `React.lazy`) |
| Backend / Auth / DB | Supabase (Postgres + Row Level Security) |
| Serverless | Supabase Edge Functions (Deno) |
| AI proxy | `openai-proxy` Edge Function (relays to OpenAI, no Firebase Blaze needed); Gemini called directly |
| Scheduling | `pg_cron` (email reminders + nightly demo reset) |
| Email | Gmail SMTP via an Edge Function |
| AI | Pluggable provider (Gemini / OpenAI / Anthropic), keys kept client-side or server-proxied |
| Hosting | **Firebase Hosting (Google Cloud)** — primary; Vercel mirror |
| PWA | `vite-plugin-pwa` (service worker, offline precache) |

### Deployment model
- **Static app** → Firebase Hosting (free Spark plan).
- **AI proxy** → a Supabase Edge Function (`openai-proxy`), so outbound AI calls work without Firebase Blaze billing.
- **Gemini** is called directly from the client, so the agentic features run on Google's model with no proxy hop.
- The `VITE_AI_PROXY_URL` env var (`.env.firebase`, loaded by `npm run build:firebase`) points the build at the Supabase proxy; the default `/api/openai` keeps local dev and the Vercel mirror working unchanged.

### Security highlights
The admin portal was built **secure by design**:
- **Service-role isolation** — admin reads/writes go through an Edge Function (`admin-stats`) holding the Supabase **service role key server-side only**. The browser never sees it.
- **Defense in depth** — the function independently re-verifies the caller's JWT *and* their `is_admin` flag before returning anything.
- **Escalation-proof** — a Postgres `BEFORE UPDATE` trigger reverts any `is_admin` change not coming from the service role.
- **Row Level Security** on every user table, scoping data to its owner.

---

## 📂 Project structure

```
src/
  pages/         Dashboard, Analytics, Calendar, Tasks, Summariser, Admin, Auth, Landing, …
  components/    Sidebar, Navbar, Layout, AdminGate, VoiceAssistant, Onboarding, …
  context/       AppContext, CalendarContext, TaskContext
  utils/         supabaseClient, aiProxy, AI helpers, study-plan / summarise / vision logic
supabase/
  functions/     admin-stats (admin API), openai-proxy (AI relay), hyper-responder (email)
supabase_*.sql   schema, reminders cron, admin schema, demo seed, demo reset cron
firebase.json    Firebase Hosting config (SPA rewrite, cache headers)
.env.firebase    AI proxy override for the Firebase build
```

---

## 🚀 Run locally

```bash
npm install

# .env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

npm run dev            # http://localhost:5173
npm run build          # production build (Vercel / generic)
npm run build:firebase # production build pointed at the Supabase AI proxy
```

> Without Supabase credentials the app runs in **offline mode** using `localStorage`, so you can explore the UI with no backend.

### Deploy to Firebase (Google Cloud)

```bash
firebase login
npm run build:firebase
firebase deploy --only hosting
```

---

## 👤 Author

**Yashraj Kanawade** — Creator of Vyora.

*Built for busy minds: students drowning in syllabi and professionals drowning in inboxes. Vyora turns scattered effort into tracked, measurable progress — and takes action so deadlines stop slipping.*
