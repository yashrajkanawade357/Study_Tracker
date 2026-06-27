import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApp } from './AppContext';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { storage, STORAGE_KEYS } from '../utils/storage';

const TaskContext = createContext(null);

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks must be used inside TaskProvider');
  return ctx;
};

const fromDb = (t) => ({
  id: t.id,
  title: t.title,
  notes: t.notes || '',
  priority: t.priority || 'medium',
  category: t.category || 'general',
  dueDate: t.due_date || '',
  dueTime: t.due_time || '',
  completed: !!t.completed,
  completedAt: t.completed_at || null,
  sortOrder: t.sort_order || 0,
  reminderAt: t.reminder_at || null,
  reminderEmail: !!t.reminder_email,
  reminderSent: !!t.reminder_sent,
});

const toDb = (t, userId) => ({
  id: t.id,
  user_id: userId,
  title: t.title,
  notes: t.notes || '',
  priority: t.priority || 'medium',
  category: t.category || 'general',
  due_date: t.dueDate || null,
  due_time: t.dueTime || null,
  completed: !!t.completed,
  completed_at: t.completedAt || null,
  sort_order: t.sortOrder || 0,
  reminder_at: t.reminderAt || null,
  reminder_email: !!t.reminderEmail,
  reminder_sent: !!t.reminderSent,
});

export const TaskProvider = ({ children }) => {
  const { isAuthenticated, userProfile } = useApp();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    if (isSupabaseConfigured() && userProfile?.id) {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userProfile.id);
        if (!error && data) {
          const mapped = data.map(fromDb);
          setTasks(mapped);
          storage.set(STORAGE_KEYS.TASKS, mapped);
        }
      } catch (err) {
        console.error('Tasks load error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setTasks(storage.get(STORAGE_KEYS.TASKS, []));
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (isAuthenticated) loadTasks();
    else setTasks([]);
  }, [isAuthenticated, loadTasks]);

  const persistLocal = (next) => storage.set(STORAGE_KEYS.TASKS, next);

  const addTask = useCallback(async (task) => {
    const newTask = {
      id: Date.now().toString() + Math.floor(Math.random() * 1000),
      completed: false,
      completedAt: null,
      reminderSent: false,
      sortOrder: Date.now(),
      ...task,
    };
    const next = [...tasks, newTask];
    setTasks(next);
    persistLocal(next);
    if (isSupabaseConfigured() && userProfile?.id) {
      const { error } = await supabase.from('tasks').insert([toDb(newTask, userProfile.id)]);
      if (error) console.error('Task add error:', error);
    }
    return newTask;
  }, [tasks, userProfile?.id]);

  const updateTask = useCallback(async (id, updates) => {
    const next = tasks.map(t => (t.id === id ? { ...t, ...updates } : t));
    setTasks(next);
    persistLocal(next);
    if (isSupabaseConfigured() && userProfile?.id) {
      const merged = next.find(t => t.id === id);
      const { id: _omit, ...dbFields } = toDb(merged, userProfile.id);
      const { error } = await supabase.from('tasks').update(dbFields).eq('id', id);
      if (error) console.error('Task update error:', error);
    }
  }, [tasks, userProfile?.id]);

  const toggleTask = useCallback((id) => {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const completed = !t.completed;
    return updateTask(id, { completed, completedAt: completed ? new Date().toISOString() : null });
  }, [tasks, updateTask]);

  const deleteTask = useCallback(async (id) => {
    const next = tasks.filter(t => t.id !== id);
    setTasks(next);
    persistLocal(next);
    if (isSupabaseConfigured() && userProfile?.id) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) console.error('Task delete error:', error);
    }
  }, [tasks, userProfile?.id]);

  const value = { tasks, loading, addTask, updateTask, toggleTask, deleteTask, reloadTasks: loadTasks };
  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};
