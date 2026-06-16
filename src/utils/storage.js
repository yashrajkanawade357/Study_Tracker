// localStorage helper utilities

export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  remove: (key) => {
    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

export const STORAGE_KEYS = {
  STUDY_LOGS: 'studyLogs',
  SUBJECTS: 'subjects',
  SLEEP_LOGS: 'sleepLogs',
  EXAMS: 'exams',
  ACHIEVEMENTS: 'achievements',
  USER_PROFILE: 'userProfile',
  POMODORO_SESSIONS: 'pomodoroSessions',
  ANTHROPIC_API_KEY: 'anthropicApiKey',
  USERS: 'users',
};

export const DEFAULT_SUBJECTS = [
  { id: '1', name: 'Mathematics', color: '#7c3aed', weeklyGoal: 10 },
  { id: '2', name: 'Physics', color: '#06b6d4', weeklyGoal: 8 },
  { id: '3', name: 'Chemistry', color: '#10b981', weeklyGoal: 6 },
  { id: '4', name: 'Biology', color: '#f59e0b', weeklyGoal: 5 },
  { id: '5', name: 'English', color: '#ef4444', weeklyGoal: 4 },
];

export const ACHIEVEMENT_DEFS = [
  { id: 'first_log', name: 'First Step', description: 'Log your first study session', icon: '🎯', xp: 10 },
  { id: 'streak_7', name: '7-Day Streak', description: 'Study 7 days in a row', icon: '🔥', xp: 50 },
  { id: 'streak_30', name: '30-Day Streak', description: 'Study 30 days in a row', icon: '☄️', xp: 300 },
  { id: 'streak_100', name: '100-Day Streak', description: 'Study 100 days in a row', icon: '🌋', xp: 1000 },
  { id: 'streak_365', name: '1-Year Streak', description: 'Study 365 days in a row', icon: '🐉', xp: 5000 },
  { id: 'fifty_hours', name: '50 Hours Club', description: 'Log 50 total study hours', icon: '⏱️', xp: 100 },
  { id: 'hundred_hours', name: '100 Hours Club', description: 'Log 100 total study hours', icon: '👑', xp: 250 },
  { id: 'two_fifty_hours', name: '250 Hours Club', description: 'Log 250 total study hours', icon: '💎', xp: 500 },
  { id: 'five_hundred_hours', name: '500 Hours Club', description: 'Log 500 total study hours', icon: '🌌', xp: 1000 },
  { id: 'subject_master', name: 'Subject Master', description: '20+ hours in a single subject', icon: '🎓', xp: 75 },
  { id: 'subject_grandmaster', name: 'Grandmaster', description: '100+ hours in a single subject', icon: '🧙‍♂️', xp: 500 },
  { id: 'polymath', name: 'Polymath', description: 'Study 4 different subjects', icon: '🧠', xp: 100 },
  { id: 'renaissance_student', name: 'Renaissance', description: 'Study 8 different subjects', icon: '🏛️', xp: 250 },
  { id: 'early_bird', name: 'Early Bird', description: 'Log a session before 7am', icon: '🌅', xp: 30 },
  { id: 'night_owl', name: 'Night Owl', description: 'Log a session after 10pm', icon: '🦉', xp: 30 },
  { id: 'marathoner', name: 'Marathoner', description: 'Log a single session of 4+ hours', icon: '🏃‍♂️', xp: 80 },
  { id: 'weekend_warrior', name: 'Weekend Warrior', description: 'Study on a weekend', icon: '⛺', xp: 40 },
  { id: 'goal_crusher', name: 'Goal Crusher', description: 'Hit weekly goal 4 weeks in a row', icon: '🏆', xp: 150 },
];

export const initializeStorage = () => {
  if (!storage.get(STORAGE_KEYS.SUBJECTS)) {
    storage.set(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
  }
  if (!storage.get(STORAGE_KEYS.STUDY_LOGS)) {
    storage.set(STORAGE_KEYS.STUDY_LOGS, []);
  }
  if (!storage.get(STORAGE_KEYS.SLEEP_LOGS)) {
    storage.set(STORAGE_KEYS.SLEEP_LOGS, []);
  }
  if (!storage.get(STORAGE_KEYS.EXAMS)) {
    storage.set(STORAGE_KEYS.EXAMS, []);
  }
  if (!storage.get(STORAGE_KEYS.ACHIEVEMENTS)) {
    storage.set(STORAGE_KEYS.ACHIEVEMENTS, ACHIEVEMENT_DEFS.map(a => ({ id: a.id, unlocked: false, unlockedAt: null })));
  }
  if (!storage.get(STORAGE_KEYS.POMODORO_SESSIONS)) {
    storage.set(STORAGE_KEYS.POMODORO_SESSIONS, []);
  }
  if (!storage.get(STORAGE_KEYS.USERS)) {
    storage.set(STORAGE_KEYS.USERS, []);
  }
  if (!storage.get(STORAGE_KEYS.USER_PROFILE)) {
    storage.set(STORAGE_KEYS.USER_PROFILE, {
      email: '',
      name: 'Study Pro',
      xp: 0,
      level: 1,
      streak: 0,
      lastLogDate: null,
    });
  }
};
