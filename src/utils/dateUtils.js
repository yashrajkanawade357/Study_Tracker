// Date utility functions
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, subWeeks, subMonths, startOfMonth, endOfMonth, eachWeekOfInterval, isSameDay, parseISO, isValid } from 'date-fns';

export { format, isSameDay, parseISO, isValid };

export const getWeekDays = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getLast7Days = () => {
  return Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
};

export const getLast30Days = () => {
  return Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));
};

export const getLast12Weeks = () => {
  return Array.from({ length: 12 }, (_, i) => subWeeks(new Date(), 11 - i));
};

export const formatDate = (date) => format(new Date(date), 'yyyy-MM-dd');
export const formatDisplay = (date) => format(new Date(date), 'MMM d');
export const formatFull = (date) => format(new Date(date), 'MMM d, yyyy');
export const formatTime = (date) => format(new Date(date), 'h:mm a');

export const isToday = (date) => isSameDay(new Date(date), new Date());

export const getDaysRemaining = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
};

export const getStudyLogsForDate = (logs, date) => {
  const dateStr = formatDate(date);
  return logs.filter(log => log.date === dateStr);
};

export const getStudyLogsForWeek = (logs, weekDate = new Date()) => {
  const start = startOfWeek(weekDate, { weekStartsOn: 1 });
  const end = endOfWeek(weekDate, { weekStartsOn: 1 });
  return logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= start && logDate <= end;
  });
};

export const getStudyLogsForMonth = (logs, monthDate = new Date()) => {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  return logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= start && logDate <= end;
  });
};

export const aggregateHoursBySubject = (logs) => {
  return logs.reduce((acc, log) => {
    acc[log.subject] = (acc[log.subject] || 0) + log.hours;
    return acc;
  }, {});
};

export const aggregateHoursByDay = (logs, days) => {
  return days.map(day => {
    const dateStr = formatDate(day);
    const dayLogs = logs.filter(l => l.date === dateStr);
    const totalHours = dayLogs.reduce((sum, l) => sum + l.hours, 0);
    return {
      date: dateStr,
      label: format(day, 'EEE'),
      hours: totalHours,
      ...dayLogs.reduce((acc, l) => {
        acc[l.subject] = (acc[l.subject] || 0) + l.hours;
        return acc;
      }, {})
    };
  });
};

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

export const calculateLongestStreak = (logs) => {
  if (!logs.length) return 0;
  const uniqueDates = [...new Set(logs.map(l => l.date))].sort((a, b) => new Date(a) - new Date(b));
  let currentStreak = 1;
  let maxStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i-1]);
    const currDate = new Date(uniqueDates[i]);
    const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }
  return maxStreak;
};

export const calculateTotalActiveDays = (logs) => {
  return new Set(logs.map(l => l.date)).size;
};
