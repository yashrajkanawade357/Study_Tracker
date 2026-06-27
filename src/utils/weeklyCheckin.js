// Weekly check-in: capture a snapshot of this week's study stats and
// compare it to the previous saved check-in to show progress over time.

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const logDate = (l) => (l.date ? new Date(`${l.date}T00:00`) : (l.timestamp ? new Date(l.timestamp) : null));

// Monday as the start of the week.
export function weekStart(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function buildSnapshot({ studyLogs = [], subjects = [], sleepLogs = [], streak = 0, xp = 0 }, ref = new Date()) {
  const start = weekStart(ref);
  const weekLogs = studyLogs.filter((l) => { const d = logDate(l); return d && d >= start; });

  const totalHours = weekLogs.reduce((s, l) => s + (l.hours || 0), 0);
  const subjectHours = {};
  weekLogs.forEach((l) => { subjectHours[l.subject] = (subjectHours[l.subject] || 0) + (l.hours || 0); });

  const weekSleep = sleepLogs.filter((l) => { const d = l.date ? new Date(`${l.date}T00:00`) : null; return d && d >= start; });
  const avgSleep = weekSleep.length ? +(weekSleep.reduce((s, l) => s + (l.sleepHours || 0), 0) / weekSleep.length).toFixed(1) : 0;

  return {
    weekStart: ymd(start),
    takenAt: null, // set when saved
    totalHours: +totalHours.toFixed(1),
    sessions: weekLogs.length,
    subjectHours: Object.fromEntries(Object.entries(subjectHours).map(([k, v]) => [k, +v.toFixed(1)])),
    streak,
    avgSleep,
    xp,
  };
}

export function diffSnapshots(curr, prev) {
  if (!prev) return null;
  const subjects = new Set([...Object.keys(curr.subjectHours || {}), ...Object.keys(prev.subjectHours || {})]);
  const subjectDeltas = [...subjects].map((name) => ({
    name,
    delta: +(((curr.subjectHours[name] || 0) - (prev.subjectHours[name] || 0))).toFixed(1),
  })).filter((s) => Math.abs(s.delta) >= 0.1).sort((a, b) => b.delta - a.delta);

  return {
    totalDelta: +((curr.totalHours - prev.totalHours)).toFixed(1),
    sessionsDelta: curr.sessions - prev.sessions,
    streakDelta: curr.streak - prev.streak,
    sleepDelta: +((curr.avgSleep - prev.avgSleep)).toFixed(1),
    subjectDeltas,
    prevWeekStart: prev.weekStart,
  };
}

export const formatWeekLabel = (ws) => {
  const d = new Date(`${ws}T00:00`);
  const end = new Date(d); end.setDate(d.getDate() + 6);
  const m = (x) => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${m(d)} – ${m(end)}`;
};
