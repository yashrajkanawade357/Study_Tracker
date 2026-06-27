import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AcademicCapIcon, CalendarDaysIcon, ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';

const APPS = [
  { id: 'tracker', label: 'Study Tracker', desc: 'Log, analyze & gamify studying', path: '/dashboard', icon: AcademicCapIcon, color: '#7c3aed' },
  { id: 'calendar', label: 'Smart Calendar', desc: 'Plan events & reminders', path: '/calendar', icon: CalendarDaysIcon, color: '#06b6d4' },
];

// `current` = 'tracker' | 'calendar'
const AppSwitcher = ({ current = 'tracker' }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const active = APPS.find(a => a.id === current) || APPS[0];

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-purple-700/25 hover:border-purple-500/40 transition-all bg-navy-800/60"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${active.color}, ${active.color}aa)` }}>
          <active.icon className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-none mb-0.5">Vyora</p>
          <p className="text-sm font-semibold text-white truncate leading-none">{active.label}</p>
        </div>
        <ChevronUpDownIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 z-50 p-1.5 rounded-2xl border border-purple-700/25 bg-navy-900 shadow-2xl"
          >
            {APPS.map(app => {
              const isActive = app.id === current;
              return (
                <button
                  key={app.id}
                  onClick={() => { setOpen(false); if (!isActive) navigate(app.path); }}
                  className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left transition-colors ${isActive ? 'bg-navy-700/60' : 'hover:bg-navy-700/40'}`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${app.color}, ${app.color}aa)` }}>
                    <app.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{app.label}</p>
                    <p className="text-[11px] text-gray-500 truncate">{app.desc}</p>
                  </div>
                  {isActive && <CheckIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppSwitcher;
