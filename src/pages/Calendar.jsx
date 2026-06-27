import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isSameMonth, isSameDay, isToday,
} from 'date-fns';
import {
  ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon, XMarkIcon,
  ClockIcon, BellIcon, CalendarDaysIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import { useCalendar } from '../context/CalendarContext';
import { useTasks } from '../context/TaskContext';
import CalendarLayout, { EVENT_CATEGORIES, categoryColor } from '../components/CalendarLayout';

const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const priorityColor = (p) => PRIORITY_COLOR[p] || PRIORITY_COLOR.medium;

// A compact task chip shown inside calendar cells; opens the Tasks page.
const TaskChip = ({ task, onOpen, showTime }) => (
  <button onClick={(e) => { e.stopPropagation(); onOpen(); }}
    className="flex items-center gap-1 text-left px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate hover:opacity-90 transition-opacity w-full"
    style={{ background: 'rgba(255,255,255,0.06)', borderLeft: `2px solid ${priorityColor(task.priority)}` }}>
    <span className={`w-2.5 h-2.5 rounded-[3px] border flex items-center justify-center flex-shrink-0 ${task.completed ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500'}`}>
      {task.completed && <CheckIcon className="w-2 h-2 text-white" strokeWidth={4} />}
    </span>
    <span className={`truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
      {showTime && task.dueTime ? <span className="opacity-70">{task.dueTime} </span> : null}{task.title}
    </span>
  </button>
);

const VIEWS = ['month', 'week', 'day', 'agenda'];
const REMINDER_LEADS = [
  { id: 'none', label: 'No reminder' },
  { id: 'attime', label: 'At event time' },
  { id: '10m', label: '10 min before' },
  { id: '1h', label: '1 hour before' },
  { id: '1d', label: '1 day before' },
];
const LEAD_MIN = { attime: 0, '10m': 10, '1h': 60, '1d': 1440 };

const fmtDate = (d) => format(d, 'yyyy-MM-dd');
const sortByTime = (a, b) => {
  if (a.allDay && !b.allDay) return -1;
  if (!a.allDay && b.allDay) return 1;
  return (a.startTime || '').localeCompare(b.startTime || '');
};
const timeLabel = (e) => {
  if (e.allDay) return 'All day';
  if (!e.startTime) return '';
  return e.endTime ? `${e.startTime} – ${e.endTime}` : e.startTime;
};

const emptyDraft = (dateStr) => ({
  id: null,
  title: '',
  date: dateStr,
  allDay: false,
  startTime: '09:00',
  endTime: '10:00',
  category: 'general',
  notes: '',
  reminderEmail: false,
  reminderLead: 'none',
});

const computeReminderAt = (form) => {
  if (!form.reminderEmail || form.reminderLead === 'none') return null;
  const base = form.allDay ? `${form.date}T09:00` : `${form.date}T${form.startTime || '09:00'}`;
  const d = new Date(base);
  if (isNaN(d.getTime())) return null;
  d.setMinutes(d.getMinutes() - (LEAD_MIN[form.reminderLead] ?? 0));
  return d.toISOString();
};

const Calendar = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useCalendar();
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const [view, setView] = useState('month');
  const [cursor, setCursor] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft(fmtDate(new Date())));

  const eventsByDate = useMemo(() => {
    const map = {};
    for (const e of events) {
      (map[e.date] = map[e.date] || []).push(e);
    }
    Object.values(map).forEach(list => list.sort(sortByTime));
    return map;
  }, [events]);

  const tasksByDate = useMemo(() => {
    const map = {};
    for (const t of tasks) {
      if (!t.dueDate) continue;
      (map[t.dueDate] = map[t.dueDate] || []).push(t);
    }
    return map;
  }, [tasks]);

  const openTasks = () => navigate('/tasks');

  const openNew = (dateStr) => { setDraft(emptyDraft(dateStr)); setModalOpen(true); };
  const openEdit = (e) => {
    setDraft({
      ...e,
      reminderLead: e.reminderAt ? 'attime' : 'none',
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!draft.title.trim()) return;
    const color = categoryColor(draft.category);
    const reminderAt = computeReminderAt(draft);
    const payload = {
      title: draft.title.trim(),
      date: draft.date,
      allDay: draft.allDay,
      startTime: draft.allDay ? '' : draft.startTime,
      endTime: draft.allDay ? '' : draft.endTime,
      category: draft.category,
      color,
      notes: draft.notes,
      reminderEmail: draft.reminderEmail && draft.reminderLead !== 'none',
      reminderAt,
    };
    if (draft.id) {
      await updateEvent(draft.id, { ...payload, reminderSent: false });
    } else {
      await addEvent(payload);
    }
    setModalOpen(false);
  };

  const remove = async () => {
    if (draft.id) await deleteEvent(draft.id);
    setModalOpen(false);
  };

  // ── Navigation ──
  const step = (dir) => {
    if (view === 'month') setCursor(c => dir > 0 ? addMonths(c, 1) : subMonths(c, 1));
    else if (view === 'week') setCursor(c => dir > 0 ? addWeeks(c, 1) : subWeeks(c, 1));
    else if (view === 'day') setCursor(c => dir > 0 ? addDays(c, 1) : subDays(c, 1));
  };

  const title = useMemo(() => {
    if (view === 'month') return format(cursor, 'MMMM yyyy');
    if (view === 'week') {
      const s = startOfWeek(cursor), e = endOfWeek(cursor);
      return `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`;
    }
    if (view === 'day') return format(cursor, 'EEEE, MMMM d, yyyy');
    return 'Upcoming events';
  }, [view, cursor]);

  return (
    <CalendarLayout>
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-navy-950/85 backdrop-blur-md border-b border-cyan-700/15 px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {view !== 'agenda' && (
              <>
                <button onClick={() => step(-1)} className="w-9 h-9 rounded-xl bg-navy-700 hover:bg-navy-600 flex items-center justify-center text-gray-300 transition-colors">
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button onClick={() => step(1)} className="w-9 h-9 rounded-xl bg-navy-700 hover:bg-navy-600 flex items-center justify-center text-gray-300 transition-colors">
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setCursor(new Date())} className="px-3 h-9 rounded-xl bg-navy-700 hover:bg-navy-600 text-sm font-semibold text-gray-300 transition-colors">
                  Today
                </button>
              </>
            )}
            <h2 className="text-lg md:text-xl font-display font-bold text-white ml-1">{title}</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-navy-800/80 border border-navy-600">
              {VIEWS.map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${view === v ? 'bg-gradient-to-br from-cyan-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {v}
                </button>
              ))}
            </div>
            <button onClick={() => openNew(view === 'day' ? fmtDate(cursor) : fmtDate(new Date()))}
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', boxShadow: '0 4px 16px rgba(6,182,212,0.35)' }}>
              <PlusIcon className="w-4 h-4" /> <span className="hidden sm:inline">New Event</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {view === 'month' && <MonthView cursor={cursor} eventsByDate={eventsByDate} tasksByDate={tasksByDate} onAdd={openNew} onEdit={openEdit} onOpenTask={openTasks} />}
        {view === 'week' && <WeekView cursor={cursor} eventsByDate={eventsByDate} tasksByDate={tasksByDate} onAdd={openNew} onEdit={openEdit} onOpenTask={openTasks} />}
        {view === 'day' && <DayView cursor={cursor} eventsByDate={eventsByDate} tasksByDate={tasksByDate} onAdd={openNew} onEdit={openEdit} onOpenTask={openTasks} />}
        {view === 'agenda' && <AgendaView events={events} onEdit={openEdit} onAdd={() => openNew(fmtDate(new Date()))} />}
      </div>

      <EventModal open={modalOpen} draft={draft} setDraft={setDraft} onClose={() => setModalOpen(false)} onSave={save} onDelete={remove} />
    </CalendarLayout>
  );
};

/* ── Month View ── */
const MonthView = ({ cursor, eventsByDate, tasksByDate, onAdd, onEdit, onOpenTask }) => {
  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor)),
    end: endOfWeek(endOfMonth(cursor)),
  }), [cursor]);

  return (
    <div className="rounded-2xl overflow-hidden border border-navy-600 bg-navy-900/40">
      <div className="grid grid-cols-7 border-b border-navy-600">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map(day => {
          const ds = fmtDate(day);
          const dayEvents = eventsByDate[ds] || [];
          const dayTasks = tasksByDate[ds] || [];
          const total = dayEvents.length + dayTasks.length;
          const shownEvents = dayEvents.slice(0, 3);
          const taskBudget = Math.max(0, 3 - shownEvents.length);
          const shownTasks = dayTasks.slice(0, taskBudget);
          const overflow = total - shownEvents.length - shownTasks.length;
          const inMonth = isSameMonth(day, cursor);
          const today = isToday(day);
          return (
            <div key={ds}
              onClick={() => onAdd(ds)}
              className={`min-h-[96px] md:min-h-[116px] p-1.5 border-b border-r border-navy-700/60 cursor-pointer transition-colors hover:bg-navy-800/40 ${inMonth ? '' : 'opacity-40'}`}>
              <div className="flex justify-end mb-1">
                <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${today ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {shownEvents.map(e => (
                  <button key={e.id} onClick={(ev) => { ev.stopPropagation(); onEdit(e); }}
                    className="text-left px-1.5 py-0.5 rounded-md text-[10px] font-medium text-white truncate hover:opacity-90 transition-opacity"
                    style={{ background: `${e.color}cc`, borderLeft: `2px solid ${e.color}` }}>
                    {!e.allDay && e.startTime ? <span className="opacity-80">{e.startTime} </span> : null}{e.title}
                  </button>
                ))}
                {shownTasks.map(t => <TaskChip key={t.id} task={t} onOpen={onOpenTask} />)}
                {overflow > 0 && (
                  <span className="text-[10px] text-gray-500 px-1.5">+{overflow} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Week View ── */
const WeekView = ({ cursor, eventsByDate, tasksByDate, onAdd, onEdit, onOpenTask }) => {
  const days = useMemo(() => eachDayOfInterval({ start: startOfWeek(cursor), end: endOfWeek(cursor) }), [cursor]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
      {days.map(day => {
        const ds = fmtDate(day);
        const dayEvents = eventsByDate[ds] || [];
        const dayTasks = tasksByDate[ds] || [];
        const today = isToday(day);
        return (
          <div key={ds} className={`rounded-2xl border bg-navy-900/40 min-h-[180px] flex flex-col ${today ? 'border-cyan-500/50' : 'border-navy-600'}`}>
            <button onClick={() => onAdd(ds)} className="px-3 py-2 border-b border-navy-700/60 text-left hover:bg-navy-800/40 transition-colors rounded-t-2xl">
              <p className="text-[11px] text-gray-500 uppercase tracking-wide">{format(day, 'EEE')}</p>
              <p className={`text-lg font-display font-bold ${today ? 'text-cyan-400' : 'text-white'}`}>{format(day, 'd')}</p>
            </button>
            <div className="flex-1 p-1.5 flex flex-col gap-1 overflow-y-auto no-scrollbar">
              {dayEvents.map(e => (
                <button key={e.id} onClick={() => onEdit(e)}
                  className="text-left px-2 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ background: `${e.color}22`, borderLeft: `3px solid ${e.color}` }}>
                  <p className="text-xs font-semibold text-white truncate">{e.title}</p>
                  <p className="text-[10px] text-gray-400">{timeLabel(e)}</p>
                </button>
              ))}
              {dayTasks.map(t => <TaskChip key={t.id} task={t} onOpen={onOpenTask} showTime />)}
              {dayEvents.length === 0 && dayTasks.length === 0 && <button onClick={() => onAdd(ds)} className="text-[11px] text-gray-600 hover:text-gray-400 py-2">+ Add</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Day View ── */
const DayView = ({ cursor, eventsByDate, tasksByDate, onAdd, onEdit, onOpenTask }) => {
  const ds = fmtDate(cursor);
  const dayEvents = eventsByDate[ds] || [];
  const dayTasks = tasksByDate[ds] || [];
  return (
    <div className="max-w-2xl mx-auto">
      {dayEvents.length === 0 && dayTasks.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDaysIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Nothing scheduled on this day.</p>
          <button onClick={() => onAdd(ds)} className="btn-primary inline-flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Add Event</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {dayTasks.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Tasks due</p>
              {dayTasks.map(t => (
                <button key={t.id} onClick={onOpenTask}
                  className="flex items-center gap-3 p-3 rounded-xl bg-navy-900/50 border border-navy-600 hover:border-cyan-700/40 transition-colors text-left">
                  <span className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${t.completed ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600'}`}>
                    {t.completed && <CheckIcon className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: priorityColor(t.priority) }} />
                  <span className={`flex-1 text-sm font-medium truncate ${t.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{t.title}</span>
                  {t.dueTime && <span className="text-xs text-gray-500">{t.dueTime}</span>}
                </button>
              ))}
            </div>
          )}
          {dayEvents.map(e => (
            <button key={e.id} onClick={() => onEdit(e)}
              className="flex items-stretch gap-4 p-4 rounded-2xl bg-navy-900/50 border border-navy-600 hover:border-cyan-700/40 transition-colors text-left">
              <div className="w-1.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
              <div className="w-20 flex-shrink-0">
                <p className="text-sm font-bold text-white">{e.allDay ? 'All day' : e.startTime || '--'}</p>
                {!e.allDay && e.endTime && <p className="text-xs text-gray-500">{e.endTime}</p>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{e.title}</p>
                {e.notes && <p className="text-sm text-gray-500 truncate">{e.notes}</p>}
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: `${e.color}22`, color: e.color }}>
                  {e.category}
                </span>
              </div>
              {e.reminderEmail && <BellIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Agenda View ── */
const AgendaView = ({ events, onEdit, onAdd }) => {
  const today = fmtDate(new Date());
  const upcoming = useMemo(() =>
    events.filter(e => e.date >= today).sort((a, b) => a.date.localeCompare(b.date) || sortByTime(a, b)).slice(0, 50),
    [events, today]);

  const grouped = useMemo(() => {
    const map = {};
    upcoming.forEach(e => { (map[e.date] = map[e.date] || []).push(e); });
    return Object.entries(map);
  }, [upcoming]);

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-20">
        <CalendarDaysIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">No upcoming events.</p>
        <button onClick={onAdd} className="btn-primary inline-flex items-center gap-2"><PlusIcon className="w-4 h-4" /> Add Event</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {grouped.map(([date, list]) => {
        const d = new Date(`${date}T00:00`);
        return (
          <div key={date}>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-white leading-none">{format(d, 'd')}</p>
                <p className="text-[10px] text-gray-500 uppercase">{format(d, 'MMM')}</p>
              </div>
              <p className="text-sm font-semibold text-gray-400">{format(d, 'EEEE')}{isToday(d) ? ' · Today' : ''}</p>
            </div>
            <div className="flex flex-col gap-2 pl-1">
              {list.map(e => (
                <button key={e.id} onClick={() => onEdit(e)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-navy-900/50 border border-navy-600 hover:border-cyan-700/40 transition-colors text-left">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{e.title}</p>
                    <p className="text-xs text-gray-500">{timeLabel(e)}</p>
                  </div>
                  {e.reminderEmail && <BellIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Event Modal ── */
const EventModal = ({ open, draft, setDraft, onClose, onSave, onDelete }) => {
  const set = (patch) => setDraft(d => ({ ...d, ...patch }));
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-cyan-700/25 overflow-hidden"
            style={{ background: 'rgba(13,16,33,0.98)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
            <div className="flex items-center justify-between p-5 border-b border-navy-600">
              <h3 className="text-lg font-display font-bold text-white">{draft.id ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><XMarkIcon className="w-5 h-5" /></button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <input className="input-field text-base" placeholder="Event title" value={draft.title} autoFocus
                onChange={e => set({ title: e.target.value })} />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Date</label>
                  <input type="date" className="input-field" value={draft.date} onChange={e => set({ date: e.target.value })} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 px-3 h-[42px] rounded-xl bg-navy-800/60 border border-navy-600 cursor-pointer w-full">
                    <input type="checkbox" checked={draft.allDay} onChange={e => set({ allDay: e.target.checked })} className="accent-cyan-500" />
                    <span className="text-sm text-gray-300">All day</span>
                  </label>
                </div>
              </div>

              {!draft.allDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Start</label>
                    <input type="time" className="input-field" value={draft.startTime} onChange={e => set({ startTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">End</label>
                    <input type="time" className="input-field" value={draft.endTime} onChange={e => set({ endTime: e.target.value })} />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Category</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => set({ category: c.id })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${draft.category === c.id ? 'text-white' : 'text-gray-400 border-navy-600 hover:text-white'}`}
                      style={draft.category === c.id ? { background: `${c.color}33`, borderColor: c.color } : {}}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Notes</label>
                <textarea className="input-field min-h-[70px] resize-y" placeholder="Optional details..." value={draft.notes}
                  onChange={e => set({ notes: e.target.value })} />
              </div>

              {/* Reminder */}
              <div className="rounded-xl border border-navy-600 p-3 bg-navy-800/40">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={draft.reminderEmail} onChange={e => set({ reminderEmail: e.target.checked, reminderLead: e.target.checked && draft.reminderLead === 'none' ? '1h' : draft.reminderLead })} className="accent-cyan-500" />
                  <BellIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-gray-200">Email reminder</span>
                </label>
                {draft.reminderEmail && (
                  <select className="input-field text-sm" value={draft.reminderLead} onChange={e => set({ reminderLead: e.target.value })}>
                    {REMINDER_LEADS.filter(l => l.id !== 'none').map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                )}
                <p className="text-[11px] text-gray-600 mt-2">We'll email you at the chosen time before the event.</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 p-5 border-t border-navy-600">
              {draft.id ? (
                <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-900/20 text-sm font-semibold transition-colors">
                  <TrashIcon className="w-4 h-4" /> Delete
                </button>
              ) : <span />}
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
                <button onClick={onSave} disabled={!draft.title.trim()} className="btn-primary text-sm disabled:opacity-50">
                  {draft.id ? 'Save' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Calendar;
