// Generates a concrete, balanced study plan (calendar study-blocks +
// revision tasks) from the student's subjects, goals, exams and the
// time already booked on their calendar. Uses the configured AI provider.

import { callAI } from './claude';

const pad = (n) => String(n).padStart(2, '0');

function extractJson(text) {
  let t = (text || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  return JSON.parse(t);
}

// Build a compact context for the planner.
export function buildPlanContext({ subjects = [], exams = [], studyLogs = [], events = [], days = 7 }) {
  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  // hours logged in the last 7 days, per subject
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const recentBySubject = {};
  studyLogs.forEach((l) => {
    const d = l.date ? new Date(`${l.date}T00:00`) : (l.timestamp ? new Date(l.timestamp) : null);
    if (d && d >= weekAgo) recentBySubject[l.subject] = (recentBySubject[l.subject] || 0) + (l.hours || 0);
  });

  const subjectInfo = subjects.map((s) => ({
    name: s.name,
    weeklyGoalHours: s.weeklyGoal,
    hoursLoggedLast7Days: +(recentBySubject[s.name] || 0).toFixed(1),
  }));

  const examInfo = exams
    .map((e) => ({
      name: e.name,
      subject: e.subject,
      date: e.date,
      daysLeft: Math.ceil((new Date(e.date) - now) / (1000 * 60 * 60 * 24)),
    }))
    .filter((e) => e.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // times already booked, so the planner avoids clashes
  const busy = events
    .filter((e) => e.date >= today && !e.allDay && e.startTime)
    .map((e) => ({ date: e.date, start: e.startTime, end: e.endTime || '', title: e.title }));

  return { today, days, subjects: subjectInfo, exams: examInfo, busy };
}

export async function generateStudyPlan(rawContext, focusHint = '') {
  const ctx = buildPlanContext(rawContext);

  const system = `You are Vyora's study planner. Build a realistic, balanced study schedule and return it as a SINGLE JSON object (no markdown, no commentary):
{
  "summary": "1-2 sentence overview of the plan and its priorities",
  "events": [ { "title": "Study: <subject> – <topic>", "date": "YYYY-MM-DD", "startTime": "HH:MM", "endTime": "HH:MM", "category": "study" } ],
  "tasks":  [ { "title": "<revision task>", "dueDate": "YYYY-MM-DD", "priority": "low|medium|high", "category": "study" } ]
}

RULES:
- Plan from today (${ctx.today}) for the next ${ctx.days} days.
- Prioritise subjects with the nearest exams and those most behind their weekly goal (goal vs hoursLoggedLast7Days).
- Study blocks are 1 to 2 hours, between 08:00 and 22:00, 24-hour "HH:MM".
- Spread sessions across days; avoid more than ~3 hours of study in one day. Do NOT schedule a block that overlaps any time in "busy".
- Create at most 12 events and at most 6 tasks. Tasks are concrete revision actions (e.g. "Solve 20 Physics problems", "Make Chemistry flashcards for Ch 4"), each with a sensible dueDate within the plan window.
- Every date must be a real upcoming date in YYYY-MM-DD. All categories are "study".
${focusHint ? `- The user specifically wants to focus on: ${focusHint}. Weight the plan toward that.` : ''}

CONTEXT:
${JSON.stringify(ctx)}`;

  const raw = await callAI([{ role: 'user', content: 'Build my study plan.' }], system);
  const plan = extractJson(raw);
  plan.events = Array.isArray(plan.events) ? plan.events.slice(0, 12) : [];
  plan.tasks = Array.isArray(plan.tasks) ? plan.tasks.slice(0, 6) : [];
  plan.summary = plan.summary || 'Here is a study plan based on your goals and upcoming exams.';
  return plan;
}
