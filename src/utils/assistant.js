// Vyora Assistant — turns a natural-language command into a structured
// intent using the user's configured AI provider (OpenAI / Anthropic / Gemini),
// with cross-app context (calendar events + tasks + study-tracker data).

import { callAI, buildStudyContext } from './claude';

const CATEGORIES = ['general', 'study', 'work', 'personal', 'health', 'exam'];
const PRIORITIES = ['low', 'medium', 'high'];

const pad = (n) => String(n).padStart(2, '0');

export function buildAssistantContext({ events = [], tasks = [], studyLogs = [], subjects = [], sleepLogs = [], exams = [] }) {
  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });

  // Look ~10 weeks ahead so date-specific questions ("what's on July 20?") work
  // even when recurring timetable classes fill the calendar. Capped so the
  // prompt stays reasonable; a busy week is ~20+ events, so 250 ≈ 10-12 weeks.
  const upcomingEvents = events
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
    .slice(0, 250)
    .map((e) => ({ title: e.title, date: e.date, time: e.allDay ? 'all day' : (e.startTime || ''), category: e.category }));

  const openTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99'))
    .slice(0, 40)
    .map((t) => ({ title: t.title, due: t.dueDate || 'no date', priority: t.priority, category: t.category }));

  const study = buildStudyContext(studyLogs, subjects, sleepLogs, exams);

  return { today, nowTime, weekday, upcomingEvents, openTasks, study };
}

const systemPrompt = (ctx) => `You are "Vyora Assistant", a friendly, concise voice assistant inside a calendar + task-manager app that is also connected to the user's study tracker.

Today is ${ctx.weekday}, ${ctx.today}. The current time is ${ctx.nowTime} (24-hour). Assume the user's local timezone.

Classify the user's message into exactly one intent and respond with a SINGLE JSON object (no markdown, no commentary) using this schema:
{
  "intent": "create_event" | "create_task" | "query" | "recommend" | "plan_study" | "chat",
  "reply": "a short, natural, spoken reply (1-2 sentences)",
  "event": { "title": string, "date": "YYYY-MM-DD", "allDay": boolean, "startTime": "HH:MM"|null, "endTime": "HH:MM"|null, "category": one of ${JSON.stringify(CATEGORIES)} } | null,
  "task":  { "title": string, "dueDate": "YYYY-MM-DD"|null, "dueTime": "HH:MM"|null, "priority": one of ${JSON.stringify(PRIORITIES)}, "category": one of ${JSON.stringify(CATEGORIES)} } | null
}

RULES:
- Resolve all relative dates ("today", "tomorrow", "next Monday", "Friday", "in 3 days") to an absolute YYYY-MM-DD using today's date above.
- Times are 24-hour "HH:MM". If the user gives no time for an event, set allDay=true and startTime/endTime=null. If they give a start but no end, set endTime to one hour after start.
- Pick the closest matching category. Default category "general"; use "study" for studying/revision/homework, "exam" for tests/exams.
- For tasks, default priority "medium" unless the user implies urgency ("urgent", "important", "asap" -> high; "whenever", "low priority" -> low).
- intent "create_event": fill "event", set "task" null. intent "create_task": fill "task", set "event" null.
- intent "query": the user is asking what's on their schedule / what's due. Use the CONTEXT below to answer in "reply". Keep it brief and scannable. Set event and task null.
- intent "recommend": the user wants advice on what to focus on / how to plan. Using the CONTEXT (events, tasks, AND study data: subject hours vs goals, upcoming exams, sleep), give 2-4 concise, prioritized, specific recommendations in "reply" (use short lines or bullets). Reference real items by name. Set event and task null.
- intent "plan_study": the user wants a study plan / schedule / roadmap built for their exams or week (e.g. "build me a study plan", "plan my week", "make a revision schedule for my physics exam"). Set event and task null; in "reply" say you'll build the plan now (e.g. "Building a study plan for you…"). A separate planner will generate the detailed schedule.
- intent "chat": greetings or anything else; answer briefly in "reply".
- "reply" must always be present and sound natural when read aloud. For create intents, phrase it as a confirmation of what you're about to add.

CONTEXT:
${JSON.stringify({ upcomingEvents: ctx.upcomingEvents, openTasks: ctx.openTasks, study: ctx.study })}`;

function parseJson(text) {
  let t = (text || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  return JSON.parse(t);
}

export async function runAssistant(transcript, context) {
  const raw = await callAI([{ role: 'user', content: transcript }], systemPrompt(context));
  const result = parseJson(raw);
  // light validation / normalisation
  if (!['create_event', 'create_task', 'query', 'recommend', 'plan_study', 'chat'].includes(result.intent)) {
    result.intent = 'chat';
  }
  if (result.event && !CATEGORIES.includes(result.event.category)) result.event.category = 'general';
  if (result.task) {
    if (!CATEGORIES.includes(result.task.category)) result.task.category = 'general';
    if (!PRIORITIES.includes(result.task.priority)) result.task.priority = 'medium';
  }
  return result;
}
