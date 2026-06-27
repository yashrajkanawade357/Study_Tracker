// Transparent, no-AI exam-readiness estimate based on how many hours
// you've logged for the subject vs a target, plus recent momentum.

const HOUR_MS = 1000 * 60 * 60;

const logDate = (l) => (l.date ? new Date(`${l.date}T00:00`) : (l.timestamp ? new Date(l.timestamp) : null));

export function computeExamReadiness(exam, studyLogs = [], subjects = []) {
  const now = new Date();
  const examDate = new Date(`${exam.date}T00:00`);
  const daysLeft = Math.ceil((examDate - now) / (HOUR_MS * 24));

  const subjLogs = studyLogs.filter((l) => l.subject === exam.subject);
  const studiedHours = subjLogs.reduce((s, l) => s + (l.hours || 0), 0);

  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const last7 = subjLogs
    .filter((l) => { const d = logDate(l); return d && d >= weekAgo; })
    .reduce((s, l) => s + (l.hours || 0), 0);

  const subject = subjects.find((s) => s.name === exam.subject);
  const weeklyGoal = subject?.weeklyGoal || 5;

  // "well prepared" target ≈ a month of the subject's weekly effort (min 12h)
  const target = Math.max(12, weeklyGoal * 4);
  const coverage = Math.min(1, studiedHours / target);
  let percent = Math.round(coverage * 100);
  // momentum: penalise if you've gone cold with the exam approaching
  if (last7 === 0 && daysLeft <= 14) percent = Math.max(0, percent - 10);
  percent = Math.max(0, Math.min(100, percent));

  const remaining = Math.max(0, target - studiedHours);
  const perDay = daysLeft > 0 ? remaining / daysLeft : remaining;

  const label = percent >= 80 ? 'Ready' : percent >= 60 ? 'On track' : percent >= 40 ? 'Needs work' : 'At risk';
  const color = percent >= 80 ? '#10b981' : percent >= 60 ? '#06b6d4' : percent >= 40 ? '#f59e0b' : '#ef4444';

  const tip = daysLeft <= 0
    ? 'Exam day — good luck! 🍀'
    : remaining <= 0
      ? "You've hit your target — keep revising to stay sharp."
      : `Study ~${perDay.toFixed(1)}h/day on ${exam.subject} to be ready.`;

  return {
    daysLeft,
    studiedHours: +studiedHours.toFixed(1),
    last7: +last7.toFixed(1),
    target,
    remaining: +remaining.toFixed(1),
    perDay: +perDay.toFixed(1),
    percent,
    label,
    color,
    tip,
  };
}
