import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { storage, STORAGE_KEYS, ACHIEVEMENT_DEFS, initializeStorage } from '../utils/storage';
import { calculateStreak, formatDate } from '../utils/dateUtils';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [studyLogs, setStudyLogs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [exams, setExams] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [pomodoroSessions, setPomodoroSessions] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserDataFromSupabase = useCallback(async (userId) => {
    try {
      // Fetch study logs
      const { data: study } = await supabase.from('study_logs').select('*').eq('user_id', userId);
      if (study) {
        setStudyLogs(study);
        storage.set(STORAGE_KEYS.STUDY_LOGS, study);
      }
      
      // Fetch sleep logs
      const { data: sleep } = await supabase.from('sleep_logs').select('*').eq('user_id', userId);
      if (sleep) {
        const mappedSleep = sleep.map(l => ({ ...l, sleepHours: l.sleep_hours }));
        setSleepLogs(mappedSleep);
        storage.set(STORAGE_KEYS.SLEEP_LOGS, mappedSleep);
      }

      // Fetch exams
      const { data: examList } = await supabase.from('exams').select('*').eq('user_id', userId);
      if (examList) {
        setExams(examList);
        storage.set(STORAGE_KEYS.EXAMS, examList);
      }

      // Fetch subjects
      const { data: subjectList } = await supabase.from('subjects').select('*').eq('user_id', userId);
      if (subjectList) {
        const mappedSubjects = subjectList.map(s => ({ ...s, weeklyGoal: s.weekly_goal }));
        setSubjects(mappedSubjects);
        storage.set(STORAGE_KEYS.SUBJECTS, mappedSubjects);
      }

      // Fetch achievements
      const { data: ach } = await supabase.from('achievements').select('*').eq('user_id', userId);
      const baseAch = ACHIEVEMENT_DEFS.map(a => ({ id: a.id, unlocked: false, unlockedAt: null }));
      const mergedAch = baseAch.map(base => {
        const found = ach?.find(db => db.id === base.id);
        if (found) {
          return { ...base, unlocked: found.unlocked, unlockedAt: found.unlocked_at };
        }
        return base;
      });
      setAchievements(mergedAch);
      storage.set(STORAGE_KEYS.ACHIEVEMENTS, mergedAch);
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
    }
  }, []);

  // Initialize
  useEffect(() => {
    initializeStorage();
    
    if (isSupabaseConfigured()) {
      // 1. Get current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setIsAuthenticated(true);
          loadUserDataFromSupabase(session.user.id).then(() => {
            supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data: profile }) => {
              if (profile) {
                const logs = storage.get(STORAGE_KEYS.STUDY_LOGS) || [];
                const actualStreak = calculateStreak(logs);
                
                if (actualStreak !== (profile.streak || 0)) {
                  supabase.from('profiles').update({ streak: actualStreak }).eq('id', profile.id).then();
                }

                const profileData = {
                  id: profile.id,
                  email: profile.email,
                  name: profile.name,
                  xp: profile.xp || 0,
                  level: profile.level || 1,
                  streak: actualStreak,
                  lastLogDate: profile.last_log_date || null,
                  avatar: profile.avatar || '🎓',
                  bio: profile.bio || '',
                  linkedin: profile.linkedin || '',
                  instagram: profile.instagram || '',
                  hasSeenManual: storage.get(STORAGE_KEYS.USER_PROFILE)?.hasSeenManual || false,
                  hasCompletedSetup: storage.get(STORAGE_KEYS.USER_PROFILE)?.hasCompletedSetup,
                };
                storage.set(STORAGE_KEYS.USER_PROFILE, profileData);
                setUserProfile(profileData);
              }
            });
          });
        } else {
          loadAll();
        }
      });

      // 2. Listen to auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          loadUserDataFromSupabase(session.user.id);
        } else {
          setIsAuthenticated(false);
          loadAll();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      loadAll();
      const user = storage.get(STORAGE_KEYS.USER_PROFILE);
      if (user?.email) setIsAuthenticated(true);
    }
  }, [loadUserDataFromSupabase]);

  const loadAll = () => {
    setStudyLogs(storage.get(STORAGE_KEYS.STUDY_LOGS, []));
    setSubjects(storage.get(STORAGE_KEYS.SUBJECTS, []));
    setSleepLogs(storage.get(STORAGE_KEYS.SLEEP_LOGS, []));
    setExams(storage.get(STORAGE_KEYS.EXAMS, []));
    
    const storedAch = storage.get(STORAGE_KEYS.ACHIEVEMENTS, []);
    const sanitizedAch = ACHIEVEMENT_DEFS.map(base => {
      const found = storedAch.find(a => a.id === base.id);
      return found ? { ...base, ...found } : { ...base, unlocked: false, unlockedAt: null };
    });
    setAchievements(sanitizedAch);
    storage.set(STORAGE_KEYS.ACHIEVEMENTS, sanitizedAch);
    
    const profile = storage.get(STORAGE_KEYS.USER_PROFILE, {});
    const logs = storage.get(STORAGE_KEYS.STUDY_LOGS, []);
    const actualStreak = calculateStreak(logs);
    
    if (profile.streak !== actualStreak) {
      profile.streak = actualStreak;
      storage.set(STORAGE_KEYS.USER_PROFILE, profile);
      
      const users = storage.get(STORAGE_KEYS.USERS, []);
      const idx = users.findIndex(u => u.email?.toLowerCase() === profile.email?.toLowerCase());
      if (idx >= 0) {
        users[idx].streak = actualStreak;
        storage.set(STORAGE_KEYS.USERS, users);
      }
    }
    
    setUserProfile(profile);
    setPomodoroSessions(storage.get(STORAGE_KEYS.POMODORO_SESSIONS, []));
  };

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateUserProfileStateAndStorage = useCallback(async (updated) => {
    storage.set(STORAGE_KEYS.USER_PROFILE, updated);
    setUserProfile(updated);
    
    if (updated.email) {
      const users = storage.get(STORAGE_KEYS.USERS, []);
      const idx = users.findIndex(u => u.email.toLowerCase() === updated.email.toLowerCase());
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...updated };
        storage.set(STORAGE_KEYS.USERS, users);
      }
      
      if (isSupabaseConfigured()) {
        const session = (await supabase.auth.getSession()).data.session;
        if (session?.user) {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: session.user.id,
              email: updated.email.toLowerCase(),
              name: updated.name,
              xp: updated.xp || 0,
              level: updated.level || 1,
              streak: updated.streak || 0,
              last_log_date: updated.lastLogDate || null,
              avatar: updated.avatar || '🎓',
              bio: updated.bio || '',
              linkedin: updated.linkedin || '',
              instagram: updated.instagram || ''
            });
            
          if (error) {
            console.error('Supabase profile update error:', error);
            throw error;
          }
        }
      }
    }
  }, []);

  const updateProfileAfterLog = useCallback((logs) => {
    const profile = storage.get(STORAGE_KEYS.USER_PROFILE, {});
    const xpGained = 5;
    const newXp = (profile.xp || 0) + xpGained;
    const newLevel = Math.floor(newXp / 100) + 1;
    const streak = calculateStreak(logs);
    const updated = { ...profile, xp: newXp, level: newLevel, streak, lastLogDate: formatDate(new Date()) };
    updateUserProfileStateAndStorage(updated);
  }, [updateUserProfileStateAndStorage]);

  const checkAchievements = useCallback((logs, subs) => {
    const storedAch = storage.get(STORAGE_KEYS.ACHIEVEMENTS, []);
    const current = ACHIEVEMENT_DEFS.map(base => {
      const found = storedAch.find(a => a.id === base.id);
      return found ? { ...base, ...found } : { ...base, unlocked: false, unlockedAt: null };
    });
    
    let changed = false;
    const now = new Date().toISOString();

    const unlock = (id) => {
      const idx = current.findIndex(a => a.id === id);
      if (idx >= 0 && !current[idx].unlocked) {
        current[idx] = { ...current[idx], unlocked: true, unlockedAt: now };
        changed = true;
        const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
        if (def) addToast(`🏆 Achievement Unlocked: ${def.name}! +${def.xp} XP`, 'success', 5000);
      }
    };

    if (logs.length >= 1) unlock('first_log');
    const totalHours = logs.reduce((s, l) => s + l.hours, 0);
    if (totalHours >= 50) unlock('fifty_hours');
    if (totalHours >= 100) unlock('hundred_hours');
    if (totalHours >= 250) unlock('two_fifty_hours');
    if (totalHours >= 500) unlock('five_hundred_hours');
    const streak = calculateStreak(logs);
    if (streak >= 7) unlock('streak_7');
    if (streak >= 30) unlock('streak_30');
    if (streak >= 100) unlock('streak_100');
    if (streak >= 365) unlock('streak_365');
    const subjectTotals = {};
    logs.forEach(l => { subjectTotals[l.subject] = (subjectTotals[l.subject] || 0) + l.hours; });
    if (Object.values(subjectTotals).some(h => h >= 20)) unlock('subject_master');
    if (Object.values(subjectTotals).some(h => h >= 100)) unlock('subject_grandmaster');
    if (Object.keys(subjectTotals).length >= 4) unlock('polymath');
    if (Object.keys(subjectTotals).length >= 8) unlock('renaissance_student');
    if (logs.some(l => l.hours >= 4)) unlock('marathoner');
    if (logs.some(l => {
      const d = l.timestamp ? new Date(l.timestamp).getDay() : new Date(l.date).getDay();
      return d === 0 || d === 6;
    })) unlock('weekend_warrior');

    const lastLog = logs[logs.length - 1];
    if (lastLog?.timestamp) {
      const h = new Date(lastLog.timestamp).getHours();
      if (h < 7) unlock('early_bird');
      if (h >= 22) unlock('night_owl');
    }
    if (totalHours >= 40) unlock('goal_crusher');

    if (changed) {
      storage.set(STORAGE_KEYS.ACHIEVEMENTS, current);
      setAchievements([...current]);
      const profile = storage.get(STORAGE_KEYS.USER_PROFILE, {});
      const unlockedDefs = ACHIEVEMENT_DEFS.filter(d => current.find(a => a.id === d.id && a.unlocked));
      const totalXp = logs.length * 5 + unlockedDefs.reduce((s, d) => s + d.xp, 0);
      const newLevel = Math.floor(totalXp / 100) + 1;
      const updated = { ...profile, xp: totalXp, level: newLevel };
      updateUserProfileStateAndStorage(updated);

      if (isSupabaseConfigured()) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            const unlockedList = current.filter(a => a.unlocked).map(a => ({
              id: a.id,
              user_id: session.user.id,
              unlocked: true,
              unlocked_at: a.unlockedAt
            }));
            if (unlockedList.length > 0) {
              supabase.from('achievements').upsert(unlockedList).then();
            }
          }
        });
      }
    }
  }, [addToast, updateUserProfileStateAndStorage]);

  const addStudyLog = useCallback(async (log) => {
    const newLog = { id: Date.now().toString(), ...log, date: log.date || formatDate(new Date()) };
    const updated = [...studyLogs, newLog];
    setStudyLogs(updated);
    storage.set(STORAGE_KEYS.STUDY_LOGS, updated);
    
    if (isSupabaseConfigured()) {
      const session = (await supabase.auth.getSession()).data.session;
      if (session?.user) {
        await supabase.from('study_logs').insert([{
          id: newLog.id,
          user_id: session.user.id,
          subject: newLog.subject,
          hours: parseFloat(newLog.hours),
          note: newLog.note || '',
          timestamp: newLog.timestamp || new Date().toISOString(),
          date: newLog.date
        }]);
      }
    }
    
    updateProfileAfterLog(updated);
    checkAchievements(updated, subjects);
    return newLog;
  }, [studyLogs, subjects, updateProfileAfterLog, checkAchievements]);


  const addSleepLog = useCallback(async (log) => {
    const newLog = { id: log.id || Date.now().toString(), ...log };
    const updated = [...sleepLogs.filter(l => l.date !== log.date), newLog];
    setSleepLogs(updated);
    storage.set(STORAGE_KEYS.SLEEP_LOGS, updated);

    if (isSupabaseConfigured()) {
      const session = (await supabase.auth.getSession()).data.session;
      if (session?.user) {
        await supabase.from('sleep_logs').upsert({
          id: newLog.id,
          user_id: session.user.id,
          sleep_hours: parseFloat(newLog.sleepHours),
          date: newLog.date,
          quality: parseInt(newLog.quality) || 3,
          notes: newLog.notes || ''
        });
      }
    }
  }, [sleepLogs]);

  const addExam = useCallback(async (exam) => {
    const newExam = { id: Date.now().toString(), ...exam };
    const updated = [...exams, newExam];
    setExams(updated);
    storage.set(STORAGE_KEYS.EXAMS, updated);

    if (isSupabaseConfigured()) {
      const session = (await supabase.auth.getSession()).data.session;
      if (session?.user) {
        await supabase.from('exams').insert([{
          id: newExam.id,
          user_id: session.user.id,
          name: newExam.name,
          date: newExam.date,
          subject: newExam.subject
        }]);
      }
    }
  }, [exams]);

  const removeExam = useCallback(async (id) => {
    const updated = exams.filter(e => e.id !== id);
    setExams(updated);
    storage.set(STORAGE_KEYS.EXAMS, updated);

    if (isSupabaseConfigured()) {
      await supabase.from('exams').delete().eq('id', id);
    }
  }, [exams]);

  const addSubject = useCallback(async (subject) => {
    const newSubject = { id: Date.now().toString(), ...subject };
    const updated = [...subjects, newSubject];
    setSubjects(updated);
    storage.set(STORAGE_KEYS.SUBJECTS, updated);

    if (isSupabaseConfigured()) {
      const session = (await supabase.auth.getSession()).data.session;
      if (session?.user) {
        await supabase.from('subjects').insert([{
          id: newSubject.id,
          user_id: session.user.id,
          name: newSubject.name,
          color: newSubject.color,
          weekly_goal: parseFloat(newSubject.weeklyGoal)
        }]);
      }
    }
  }, [subjects]);

  const updateSubject = useCallback(async (id, updates) => {
    const updated = subjects.map(s => s.id === id ? { ...s, ...updates } : s);
    setSubjects(updated);
    storage.set(STORAGE_KEYS.SUBJECTS, updated);

    if (isSupabaseConfigured()) {
      await supabase.from('subjects').update({
        name: updates.name,
        color: updates.color,
        weekly_goal: updates.weeklyGoal ? parseFloat(updates.weeklyGoal) : undefined
      }).eq('id', id);
    }
  }, [subjects]);

  const removeSubject = useCallback(async (id) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    storage.set(STORAGE_KEYS.SUBJECTS, updated);

    if (isSupabaseConfigured()) {
      await supabase.from('subjects').delete().eq('id', id);
    }
  }, [subjects]);

  const addPomodoroSession = useCallback((session) => {
    const newSession = { id: Date.now().toString(), ...session, completedAt: new Date().toISOString() };
    const updated = [...pomodoroSessions, newSession];
    setPomodoroSessions(updated);
    storage.set(STORAGE_KEYS.POMODORO_SESSIONS, updated);
    
    // Auto-log study hours
    addStudyLog({ subject: session.subject, hours: 0.42, note: 'Pomodoro session', timestamp: new Date().toISOString() });
  }, [pomodoroSessions, addStudyLog]);

  const checkEmailExists = useCallback(async (email) => {
    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase());
      return data && data.length > 0;
    } else {
      const users = storage.get(STORAGE_KEYS.USERS, []);
      return users.some(u => u.email.toLowerCase() === email.toLowerCase());
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    if (isSupabaseConfigured()) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;
      
      const user = authData.user;
      if (!user) throw new Error('Registration failed.');

      const profile = {
        id: user.id,
        email: email.toLowerCase(),
        name,
        xp: 0,
        level: 1,
        streak: 0,
        last_log_date: null,
        avatar: '🎓',
        bio: '',
        linkedin: '',
        instagram: '',
      };
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([profile]);
      if (profileError) throw profileError;

      const profileData = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        xp: profile.xp,
        level: profile.level,
        streak: profile.streak,
        lastLogDate: profile.last_log_date,
        avatar: profile.avatar,
        bio: profile.bio,
        linkedin: profile.linkedin,
        instagram: profile.instagram,
        hasSeenManual: false,
        hasCompletedSetup: false,
      };

      storage.set(STORAGE_KEYS.USER_PROFILE, profileData);
      setUserProfile(profileData);
      setIsAuthenticated(true);
    } else {
      const users = storage.get(STORAGE_KEYS.USERS, []);
      const normalizedEmail = email.toLowerCase();
      
      if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        throw new Error('Email is already registered');
      }
      
      const newUser = {
        name,
        email: normalizedEmail,
        password,
        xp: 0,
        level: 1,
        streak: 0,
        lastLogDate: null,
        avatar: '🎓',
        bio: '',
        linkedin: '',
        instagram: '',
        hasSeenManual: false,
        hasCompletedSetup: false,
      };
      
      users.push(newUser);
      storage.set(STORAGE_KEYS.USERS, users);
      
      const profile = {
        name: newUser.name,
        email: newUser.email,
        xp: newUser.xp,
        level: newUser.level,
        streak: newUser.streak,
        lastLogDate: newUser.lastLogDate,
        avatar: newUser.avatar,
        bio: newUser.bio,
        linkedin: newUser.linkedin,
        instagram: newUser.instagram,
        hasSeenManual: false,
        hasCompletedSetup: false,
      };
      storage.set(STORAGE_KEYS.USER_PROFILE, profile);
      setUserProfile(profile);
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    if (isSupabaseConfigured()) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error('Login failed.');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const profileData = {
        id: user.id,
        email: email.toLowerCase(),
        name: profile?.name || email.split('@')[0],
        xp: profile?.xp || 0,
        level: profile?.level || 1,
        streak: profile?.streak || 0, // This will be fixed after loadUserDataFromSupabase finishes
        lastLogDate: profile?.last_log_date || null,
        avatar: profile?.avatar || '🎓',
        bio: profile?.bio || '',
        linkedin: profile?.linkedin || '',
        instagram: profile?.instagram || '',
        hasSeenManual: storage.get(STORAGE_KEYS.USER_PROFILE)?.hasSeenManual || false,
        hasCompletedSetup: storage.get(STORAGE_KEYS.USER_PROFILE)?.hasCompletedSetup,
      };

      storage.set(STORAGE_KEYS.USER_PROFILE, profileData);
      setUserProfile(profileData);
      setIsAuthenticated(true);
      await loadUserDataFromSupabase(user.id);
      
      // Recalculate streak now that logs are loaded
      const logs = storage.get(STORAGE_KEYS.STUDY_LOGS) || [];
      const actualStreak = calculateStreak(logs);
      if (actualStreak !== (profile?.streak || 0)) {
        await supabase.from('profiles').update({ streak: actualStreak }).eq('id', user.id);
        const updatedProfile = { ...profileData, streak: actualStreak };
        storage.set(STORAGE_KEYS.USER_PROFILE, updatedProfile);
        setUserProfile(updatedProfile);
      }
    } else {
      const users = storage.get(STORAGE_KEYS.USERS, []);
      const normalizedEmail = email.toLowerCase();
      
      const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (!user) {
        throw new Error('Email not registered. Please sign up.');
      }
      
      if (user.password !== password) {
        throw new Error('Incorrect password. Please try again.');
      }
      
      const actualStreak = calculateStreak(storage.get(STORAGE_KEYS.STUDY_LOGS, []));
      
      const profile = {
        name: user.name,
        email: user.email,
        xp: user.xp || 0,
        level: user.level || 1,
        streak: actualStreak,
        lastLogDate: user.lastLogDate || null,
        avatar: user.avatar || '🎓',
        bio: user.bio || '',
        linkedin: user.linkedin || '',
        instagram: user.instagram || '',
        hasSeenManual: user.hasSeenManual || false,
      };
      
      if (actualStreak !== (user.streak || 0)) {
        user.streak = actualStreak;
        storage.set(STORAGE_KEYS.USERS, users);
      }
      
      storage.set(STORAGE_KEYS.USER_PROFILE, profile);
      setUserProfile(profile);
      setIsAuthenticated(true);
    }
  }, [loadUserDataFromSupabase]);

  const loginWithGithub = useCallback(async () => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });
      if (error) throw error;
    } else {
      throw new Error('Supabase is not configured. GitHub Sign-In requires Supabase.');
    }
  }, []);

  const sendMagicLink = useCallback(async (email) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard',
        }
      });
      if (error) throw error;
    } else {
      throw new Error('Supabase is not configured. Magic Link requires Supabase.');
    }
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    storage.remove(STORAGE_KEYS.USER_PROFILE);
    storage.remove(STORAGE_KEYS.STUDY_LOGS);
    storage.remove(STORAGE_KEYS.SUBJECTS);
    storage.remove(STORAGE_KEYS.SLEEP_LOGS);
    storage.remove(STORAGE_KEYS.EXAMS);
    storage.remove(STORAGE_KEYS.ACHIEVEMENTS);
    storage.remove(STORAGE_KEYS.POMODORO_SESSIONS);

    setUserProfile(null);
    setStudyLogs([]);
    setSubjects([]);
    setSleepLogs([]);
    setExams([]);
    setAchievements(ACHIEVEMENT_DEFS.map(a => ({ id: a.id, unlocked: false, unlockedAt: null })));
    setPomodoroSessions([]);

    initializeStorage();
    setIsAuthenticated(false);
  }, []);

  const exportData = useCallback(() => {
    const data = {
      studyLogs,
      subjects,
      sleepLogs,
      exams,
      achievements,
      userProfile,
      pomodoroSessions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-tracker-export-${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [studyLogs, subjects, sleepLogs, exams, achievements, userProfile, pomodoroSessions]);

  const clearAllData = useCallback(() => {
    storage.clear();
    initializeStorage();
    loadAll();
    setIsAuthenticated(false);
  }, []);

  const currentStreak = useMemo(() => calculateStreak(studyLogs), [studyLogs]);

  const currentXp = useMemo(() => {
    const logsXp = studyLogs.length * 5;
    const achXp = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + (ACHIEVEMENT_DEFS.find(d => d.id === a.id)?.xp || 0), 0);
    return logsXp + achXp;
  }, [studyLogs, achievements]);

  useEffect(() => {
    if (isSupabaseConfigured() && isAuthenticated && userProfile?.id) {
      if (currentXp !== (userProfile.xp || 0)) {
        supabase.from('profiles').update({ xp: currentXp }).eq('id', userProfile.id).then();
        const updated = { ...userProfile, xp: currentXp };
        storage.set(STORAGE_KEYS.USER_PROFILE, updated);
        setUserProfile(updated);
      }
    }
  }, [currentXp, isAuthenticated, userProfile]);

  const completeManual = useCallback(() => {
    if (userProfile) {
      const updated = { ...userProfile, hasSeenManual: true };
      updateUserProfileStateAndStorage(updated);
    }
  }, [userProfile, updateUserProfileStateAndStorage]);

  const completeSetup = useCallback(() => {
    if (userProfile) {
      const updated = { ...userProfile, hasCompletedSetup: true };
      updateUserProfileStateAndStorage(updated);
    }
  }, [userProfile, updateUserProfileStateAndStorage]);

  const value = {
    studyLogs, subjects, sleepLogs, exams, achievements, userProfile, pomodoroSessions,
    toasts, isAuthenticated, currentStreak, currentXp,
    addStudyLog, addSleepLog, addExam, removeExam,
    addSubject, updateSubject, removeSubject,
    addPomodoroSession, checkAchievements, updateProfile: updateUserProfileStateAndStorage,
    login, logout, register, checkEmailExists, loginWithGithub, sendMagicLink,
    exportData, clearAllData,
    addToast, removeToast,
    reload: loadAll,
    completeManual,
    completeSetup,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
