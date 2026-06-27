import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { CheckIcon, CalendarDaysIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

// plan = { summary, events:[{title,date,startTime,endTime}], tasks:[{title,dueDate,priority}] }
// onAddAll(plan) -> adds everything;  onCancel()
const StudyPlanPreview = ({ plan, onAddAll, onCancel, adding = false, compact = false }) => {
  const [added, setAdded] = useState(false);

  const byDay = useMemo(() => {
    const map = {};
    (plan.events || []).forEach((e) => { (map[e.date] = map[e.date] || { events: [], tasks: [] }).events.push(e); });
    (plan.tasks || []).forEach((t) => { const d = t.dueDate || 'No date'; (map[d] = map[d] || { events: [], tasks: [] }).tasks.push(t); });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [plan]);

  const total = (plan.events?.length || 0) + (plan.tasks?.length || 0);
  if (total === 0) return null;

  const dayLabel = (d) => {
    if (d === 'No date') return 'No due date';
    const dt = new Date(`${d}T00:00`);
    return isNaN(dt) ? d : format(dt, 'EEE, MMM d');
  };

  const handleAdd = async () => { await onAddAll?.(plan); setAdded(true); };

  return (
    <div className="rounded-2xl border border-cyan-500/30 overflow-hidden" style={{ background: 'rgba(6,182,212,0.06)' }}>
      <div className="p-3.5 border-b border-cyan-500/15">
        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-1">📋 Proposed study plan</p>
        <p className={`text-gray-200 leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`}>{plan.summary}</p>
        <p className="text-[11px] text-gray-500 mt-1.5">{plan.events?.length || 0} study blocks · {plan.tasks?.length || 0} tasks</p>
      </div>

      <div className={`p-3 flex flex-col gap-3 overflow-y-auto no-scrollbar ${compact ? 'max-h-56' : 'max-h-80'}`}>
        {byDay.map(([day, items]) => (
          <div key={day}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5 px-1">{dayLabel(day)}</p>
            <div className="flex flex-col gap-1.5">
              {items.events.map((e, i) => (
                <div key={`e${i}`} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-navy-800/60">
                  <CalendarDaysIcon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="flex-1 text-xs text-white truncate">{e.title}</span>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{e.startTime}{e.endTime ? `–${e.endTime}` : ''}</span>
                </div>
              ))}
              {items.tasks.map((t, i) => (
                <div key={`t${i}`} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-navy-800/60">
                  <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: PRIORITY_COLOR[t.priority] || PRIORITY_COLOR.medium }} />
                  <span className="flex-1 text-xs text-white truncate">{t.title}</span>
                  <span className="text-[10px] uppercase font-bold flex-shrink-0" style={{ color: PRIORITY_COLOR[t.priority] || PRIORITY_COLOR.medium }}>{t.priority}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-cyan-500/15 flex items-center gap-2">
        {added ? (
          <p className="flex-1 text-center text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5"><CheckIcon className="w-4 h-4" /> Added to your calendar</p>
        ) : (
          <>
            <button onClick={handleAdd} disabled={adding}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)' }}>
              {adding ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding…</> : <><CheckIcon className="w-4 h-4" /> Add all to calendar</>}
            </button>
            <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 bg-navy-700 hover:bg-navy-600 transition-colors">Dismiss</button>
          </>
        )}
      </div>
    </div>
  );
};

export default StudyPlanPreview;
