import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApp } from './AppContext';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';
import { storage, STORAGE_KEYS } from '../utils/storage';

const CalendarContext = createContext(null);

export const useCalendar = () => {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendar must be used inside CalendarProvider');
  return ctx;
};

// DB (snake_case) -> app (camelCase)
const fromDb = (e) => ({
  id: e.id,
  title: e.title,
  date: e.date,
  startTime: e.start_time || '',
  endTime: e.end_time || '',
  allDay: !!e.all_day,
  color: e.color || '#7c3aed',
  category: e.category || 'general',
  notes: e.notes || '',
  reminderAt: e.reminder_at || null,
  reminderEmail: !!e.reminder_email,
  reminderSent: !!e.reminder_sent,
});

// app (camelCase) -> DB (snake_case)
const toDb = (e, userId) => ({
  id: e.id,
  user_id: userId,
  title: e.title,
  date: e.date,
  start_time: e.allDay ? null : (e.startTime || null),
  end_time: e.allDay ? null : (e.endTime || null),
  all_day: !!e.allDay,
  color: e.color || '#7c3aed',
  category: e.category || 'general',
  notes: e.notes || '',
  reminder_at: e.reminderAt || null,
  reminder_email: !!e.reminderEmail,
  reminder_sent: !!e.reminderSent,
});

export const CalendarProvider = ({ children }) => {
  const { isAuthenticated, userProfile } = useApp();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    if (isSupabaseConfigured() && userProfile?.id) {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', userProfile.id);
        if (!error && data) {
          const mapped = data.map(fromDb);
          setEvents(mapped);
          storage.set(STORAGE_KEYS.CALENDAR_EVENTS, mapped);
        }
      } catch (err) {
        console.error('Calendar load error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setEvents(storage.get(STORAGE_KEYS.CALENDAR_EVENTS, []));
    }
  }, [userProfile?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      loadEvents();
    } else {
      setEvents([]);
    }
  }, [isAuthenticated, loadEvents]);

  const persistLocal = (next) => storage.set(STORAGE_KEYS.CALENDAR_EVENTS, next);

  const addEvent = useCallback(async (event) => {
    const newEvent = {
      id: Date.now().toString() + Math.floor(Math.random() * 1000),
      reminderSent: false,
      ...event,
    };
    const next = [...events, newEvent];
    setEvents(next);
    persistLocal(next);

    if (isSupabaseConfigured() && userProfile?.id) {
      const { error } = await supabase.from('calendar_events').insert([toDb(newEvent, userProfile.id)]);
      if (error) console.error('Calendar add error:', error);
    }
    return newEvent;
  }, [events, userProfile?.id]);

  const updateEvent = useCallback(async (id, updates) => {
    const next = events.map(e => (e.id === id ? { ...e, ...updates } : e));
    setEvents(next);
    persistLocal(next);

    if (isSupabaseConfigured() && userProfile?.id) {
      const merged = next.find(e => e.id === id);
      const { id: _omit, ...dbFields } = toDb(merged, userProfile.id);
      const { error } = await supabase.from('calendar_events').update(dbFields).eq('id', id);
      if (error) console.error('Calendar update error:', error);
    }
  }, [events, userProfile?.id]);

  const deleteEvent = useCallback(async (id) => {
    const next = events.filter(e => e.id !== id);
    setEvents(next);
    persistLocal(next);

    if (isSupabaseConfigured() && userProfile?.id) {
      const { error } = await supabase.from('calendar_events').delete().eq('id', id);
      if (error) console.error('Calendar delete error:', error);
    }
  }, [events, userProfile?.id]);

  const value = {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    reloadEvents: loadEvents,
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
};
