import { format, subDays } from 'date-fns';

export const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd');

export const calculateStreak = (logs) => {
  if (!logs.length) return 0;
  
  const today = formatDate(new Date());
  let streak = 0;
  let checkDate = new Date();
  
  while (true) {
    const dateStr = formatDate(checkDate);
    const hasLog = logs.some(l => l.date === dateStr);
    if (hasLog) {
      streak++;
      checkDate = subDays(checkDate, 1);
    } else if (dateStr === today) {
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }
  
  return streak;
};

// Generate logs that exactly match the heatmap
// Today = June 16, 2026 (blank)
// Day -1 (June 15) to Day -13 (June 3) are filled.
// Day -14 (June 2) is blank.
// Day -15 (June 1) is filled.

const logs = [];
const today = new Date();

// Day -1 to Day -13 (13 days of continuous streak)
for (let i = 1; i <= 13; i++) {
  logs.push({ date: formatDate(subDays(today, i)), hours: 1 });
}

// Day -15
logs.push({ date: formatDate(subDays(today, 15)), hours: 1 });

console.log("Expected: 13, Got:", calculateStreak(logs));

// Let's print out what calculateStreak is actually checking internally
let checkDate = new Date();
let streak = 0;
while (true) {
  const dateStr = formatDate(checkDate);
  const hasLog = logs.some(l => l.date === dateStr);
  console.log(`Checking ${dateStr}: hasLog=${hasLog}`);
  if (hasLog) {
    streak++;
    checkDate = subDays(checkDate, 1);
  } else if (dateStr === formatDate(today)) {
    console.log(`Skipping today ${dateStr}`);
    checkDate = subDays(checkDate, 1);
  } else {
    console.log(`Streak broken at ${dateStr}`);
    break;
  }
}

