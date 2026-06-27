import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  PlusIcon, TrashIcon, XMarkIcon, BellIcon, PencilIcon, CheckIcon, FlagIcon, CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useTasks } from '../context/TaskContext';
import CalendarLayout, { EVENT_CATEGORIES, categoryColor } from '../components/CalendarLayout';

const PRIORITIES = [
  { id: 'high', label: 'High', color: '#ef4444', rank: 0 },
  { id: 'medium', label: 'Medium', color: '#f59e0b', rank: 1 },
  { id: 'low', label: 'Low', color: '#10b981', rank: 2 },
];
const priorityMeta = (id) => PRIORITIES.find(p => p.id === id) || PRIORITIES[1];

const FILTERS = ['Today', 'Upcoming', 'All', 'Completed'];
const REMINDER_LEADS = [
  { id: 'attime', label: 'At due time' },
  { id: '1h', label: '1 hour before' },
  { id: '1d', label: '1 day before' },
];
const LEAD_MIN = { attime: 0, '1h': 60, '1d': 1440 };

const todayStr = () => format(new Date(), 'yyyy-MM-dd');

const emptyDraft = () => ({
  id: null,
  title: '',
  notes: '',
  priority: 'medium',
  category: 'general',
  dueDate: '',
  dueTime: '',
  reminderEmail: false,
  reminderLead: 'attime',
});

const computeReminderAt = (form) => {
  if (!form.reminderEmail || !form.dueDate) return null;
  const base = `${form.dueDate}T${form.dueTime || '09:00'}`;
  const d = new Date(base);
  if (isNaN(d.getTime())) return null;
  d.setMinutes(d.getMinutes() - (LEAD_MIN[form.reminderLead] ?? 0));
  return d.toISOString();
};

const dueChip = (dueDate) => {
  if (!dueDate) return null;
  const t = todayStr();
  if (dueDate < t) return { label: 'Overdue', cls: 'bg-red-900/40 text-red-400' };
  if (dueDate === t) return { label: 'Today', cls: 'bg-amber-900/40 text-amber-400' };
  const d = new Date(`${dueDate}T00:00`);
  return { label: format(d, 'MMM d'), cls: 'bg-navy-700 text-gray-300' };
};

const Tasks = () => {
  const { tasks, addTask, updateTask, toggleTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState('Today');
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());

  const openNew = () => { setDraft(emptyDraft()); setModalOpen(true); };
  const openEdit = (t) => {
    setDraft({ ...t, reminderLead: t.reminderAt ? 'attime' : 'attime' });
    setModalOpen(true);
  };

  const save = async () => {
    if (!draft.title.trim()) return;
    const payload = {
      title: draft.title.trim(),
      notes: draft.notes,
      priority: draft.priority,
      category: draft.category,
      dueDate: draft.dueDate,
      dueTime: draft.dueTime,
      reminderEmail: draft.reminderEmail && !!draft.dueDate,
      reminderAt: computeReminderAt(draft),
    };
    if (draft.id) await updateTask(draft.id, { ...payload, reminderSent: false });
    else await addTask(payload);
    setModalOpen(false);
  };

  const remove = async () => { if (draft.id) await deleteTask(draft.id); setModalOpen(false); };

  const filtered = useMemo(() => {
    const t = todayStr();
    let list;
    if (filter === 'Completed') list = tasks.filter(x => x.completed);
    else if (filter === 'Today') list = tasks.filter(x => !x.completed && x.dueDate && x.dueDate <= t);
    else if (filter === 'Upcoming') list = tasks.filter(x => !x.completed && x.dueDate && x.dueDate > t);
    else list = tasks.filter(x => !x.completed);
    return list.sort((a, b) => {
      if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      return priorityMeta(a.priority).rank - priorityMeta(b.priority).rank;
    });
  }, [tasks, filter]);

  const counts = useMemo(() => {
    const t = todayStr();
    return {
      Today: tasks.filter(x => !x.completed && x.dueDate && x.dueDate <= t).length,
      Upcoming: tasks.filter(x => !x.completed && x.dueDate && x.dueDate > t).length,
      All: tasks.filter(x => !x.completed).length,
      Completed: tasks.filter(x => x.completed).length,
    };
  }, [tasks]);

  return (
    <CalendarLayout>
      {/* Toolbar */}
      <div className="sticky top-0 z-30 bg-navy-950/85 backdrop-blur-md border-b border-cyan-700/15 px-4 md:px-6 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg md:text-xl font-display font-bold text-white">Tasks</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-navy-800/80 border border-navy-600">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${filter === f ? 'bg-gradient-to-br from-cyan-600 to-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {f}
                  {counts[f] > 0 && <span className={`text-[10px] px-1.5 rounded-full ${filter === f ? 'bg-white/20' : 'bg-navy-600'}`}>{counts[f]}</span>}
                </button>
              ))}
            </div>
            <button onClick={openNew}
              className="flex items-center gap-1.5 px-4 h-9 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', boxShadow: '0 4px 16px rgba(6,182,212,0.35)' }}>
              <PlusIcon className="w-4 h-4" /> <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <CheckCircleIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{filter === 'Completed' ? 'Nothing completed yet.' : 'No tasks here — add one!'}</p>
            {filter !== 'Completed' && <button onClick={openNew} className="btn-primary inline-flex items-center gap-2"><PlusIcon className="w-4 h-4" /> New Task</button>}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {filtered.map(t => {
                const pm = priorityMeta(t.priority);
                const chip = dueChip(t.dueDate);
                return (
                  <motion.div
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                    className="group flex items-center gap-3 p-3.5 rounded-2xl bg-navy-900/50 border border-navy-600 hover:border-cyan-700/40 transition-colors"
                  >
                    {/* Checkbox */}
                    <button onClick={() => toggleTask(t.id)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${t.completed ? 'bg-cyan-500 border-cyan-500' : 'border-gray-600 hover:border-cyan-400'}`}>
                      {t.completed && <CheckIcon className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </button>

                    {/* Priority bar */}
                    <span className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: pm.color }} title={`${pm.label} priority`} />

                    {/* Body */}
                    <button onClick={() => openEdit(t)} className="flex-1 min-w-0 text-left">
                      <p className={`text-sm font-semibold truncate ${t.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{t.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ background: `${categoryColor(t.category)}22`, color: categoryColor(t.category) }}>
                          {t.category}
                        </span>
                        {chip && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${chip.cls}`}>{chip.label}{t.dueTime ? ` · ${t.dueTime}` : ''}</span>}
                        {t.reminderEmail && <BellIcon className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    </button>

                    {/* Actions */}
                    <button onClick={() => openEdit(t)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-cyan-400 transition-all p-1"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1"><TrashIcon className="w-4 h-4" /></button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <TaskModal open={modalOpen} draft={draft} setDraft={setDraft} onClose={() => setModalOpen(false)} onSave={save} onDelete={remove} />
    </CalendarLayout>
  );
};

/* ── Task Modal ── */
const TaskModal = ({ open, draft, setDraft, onClose, onSave, onDelete }) => {
  const set = (patch) => setDraft(d => ({ ...d, ...patch }));
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-cyan-700/25 overflow-hidden"
            style={{ background: 'rgba(13,16,33,0.98)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
            <div className="flex items-center justify-between p-5 border-b border-navy-600">
              <h3 className="text-lg font-display font-bold text-white">{draft.id ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><XMarkIcon className="w-5 h-5" /></button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <input className="input-field text-base" placeholder="What needs to be done?" value={draft.title} autoFocus
                onChange={e => set({ title: e.target.value })} />

              {/* Priority */}
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p.id} onClick={() => set({ priority: p.id })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex-1 justify-center ${draft.priority === p.id ? 'text-white' : 'text-gray-400 border-navy-600 hover:text-white'}`}
                      style={draft.priority === p.id ? { background: `${p.color}33`, borderColor: p.color } : {}}>
                      <FlagIcon className="w-3.5 h-3.5" style={{ color: p.color }} /> {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due date / time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Due date</label>
                  <input type="date" className="input-field" value={draft.dueDate} onChange={e => set({ dueDate: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Time (optional)</label>
                  <input type="time" className="input-field" value={draft.dueTime} onChange={e => set({ dueTime: e.target.value })} />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Category</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_CATEGORIES.map(c => (
                    <button key={c.id} onClick={() => set({ category: c.id })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${draft.category === c.id ? 'text-white' : 'text-gray-400 border-navy-600 hover:text-white'}`}
                      style={draft.category === c.id ? { background: `${c.color}33`, borderColor: c.color } : {}}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} /> {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Notes</label>
                <textarea className="input-field min-h-[60px] resize-y" placeholder="Optional details..." value={draft.notes} onChange={e => set({ notes: e.target.value })} />
              </div>

              {/* Reminder */}
              <div className="rounded-xl border border-navy-600 p-3 bg-navy-800/40">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={draft.reminderEmail} onChange={e => set({ reminderEmail: e.target.checked })} className="accent-cyan-500" disabled={!draft.dueDate} />
                  <BellIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-gray-200">Email reminder</span>
                </label>
                {draft.reminderEmail && draft.dueDate && (
                  <select className="input-field text-sm" value={draft.reminderLead} onChange={e => set({ reminderLead: e.target.value })}>
                    {REMINDER_LEADS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                )}
                <p className="text-[11px] text-gray-600 mt-2">{draft.dueDate ? 'Reminder emails activate once email delivery is enabled.' : 'Add a due date to enable reminders.'}</p>
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
                <button onClick={onSave} disabled={!draft.title.trim()} className="btn-primary text-sm disabled:opacity-50">{draft.id ? 'Save' : 'Create'}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Tasks;
