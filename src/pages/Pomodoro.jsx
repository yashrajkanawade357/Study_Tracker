import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { PlayIcon, PauseIcon, ArrowPathIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, SpeakerWaveIcon, SpeakerXMarkIcon, CheckCircleIcon as CheckSolid, PlusCircleIcon, ForwardIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckOutline, XMarkIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../utils/dateUtils';

// ── Floating particle background ────────────────────────────────────────────
const Particles = ({ color, count = 12 }) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 4,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full opacity-30"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, backgroundColor: color }}
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.5, 0.1], scale: [1, 1.5, 1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

// ── Mode config ──────────────────────────────────────────────────────────────
const MODES = {
  focus:     {
    label: 'Focus',       emoji: '🎯',
    color: '#6d28d9',     accent: '#a78bfa',
    glow:  '#6d28d966',
    cardBg: 'linear-gradient(145deg, #2e1065 0%, #1e1b4b 50%, #0f0a2e 100%)',
    headerBg: 'linear-gradient(90deg, #6d28d9, #4f46e5)',
    tabBg: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    tabShadow: '0 4px 20px #7c3aed60',
    textColor: 'text-violet-300',
    ringTrack: '#3b0764',
  },
  shortBreak: {
    label: 'Short Break', emoji: '☕',
    color: '#0e7490',     accent: '#22d3ee',
    glow:  '#0e749066',
    cardBg: 'linear-gradient(145deg, #083344 0%, #0c1a2e 50%, #020d18 100%)',
    headerBg: 'linear-gradient(90deg, #0891b2, #0e7490)',
    tabBg: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    tabShadow: '0 4px 20px #0891b260',
    textColor: 'text-cyan-300',
    ringTrack: '#042f3e',
  },
  longBreak: {
    label: 'Long Break',  emoji: '🌅',
    color: '#b45309',     accent: '#fbbf24',
    glow:  '#b4530966',
    cardBg: 'linear-gradient(145deg, #3d1a00 0%, #1c0f00 50%, #0d0800 100%)',
    headerBg: 'linear-gradient(90deg, #d97706, #b45309)',
    tabBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
    tabShadow: '0 4px 20px #d9770660',
    textColor: 'text-amber-300',
    ringTrack: '#3d1a00',
  },
};

// ── Circular SVG timer ───────────────────────────────────────────────────────
const CircularTimer = ({ progress, mode, timeLeft, isRunning, size = 260 }) => {
  const cfg = MODES[mode];
  const strokeWidth = 12;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer breathing glow ring */}
      <motion.div
        className="absolute rounded-full"
        animate={isRunning ? { scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] } : { scale: 1, opacity: 0.2 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: size + 24, height: size + 24, background: `radial-gradient(circle, ${cfg.glow} 0%, transparent 70%)` }}
      />

      {/* Track + progress ring */}
      <svg width={size} height={size} className="absolute -rotate-90" style={{ filter: `drop-shadow(0 0 12px ${cfg.color}60)` }}>
        {/* Background track */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
        {/* Secondary soft glow track */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={cfg.color} strokeWidth={strokeWidth + 8} strokeOpacity={0.06} />
        {/* Main progress arc */}
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={cfg.color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.6s ease' }}
        />
        {/* Bright leading dot */}
        {progress > 0.01 && (
          <circle
            cx={size/2 + radius * Math.cos(-Math.PI/2 + 2*Math.PI*progress)}
            cy={size/2 + radius * Math.sin(-Math.PI/2 + 2*Math.PI*progress)}
            r={strokeWidth/2 + 1}
            fill={cfg.accent}
            style={{ filter: `drop-shadow(0 0 6px ${cfg.accent})` }}
          />
        )}
      </svg>

      {/* Inner content */}
      <div className="relative z-10 flex flex-col items-center justify-center select-none">
        {/* Mode emoji */}
        <motion.div
          key={mode}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          className="text-2xl mb-1"
        >
          {cfg.emoji}
        </motion.div>

        {/* Big time display */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${minutes}`}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={`font-display font-black leading-none tracking-tight ${cfg.textColor}`}
            style={{ fontSize: 64, textShadow: `0 0 30px ${cfg.color}80` }}
          >
            {String(minutes).padStart(2,'0')}
            <span className="opacity-60 mx-0.5">:</span>
            {String(seconds).padStart(2,'0')}
          </motion.div>
        </AnimatePresence>

        {/* Mode label */}
        <motion.p
          key={mode + 'label'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs font-bold uppercase tracking-widest mt-1 opacity-50 text-white"
        >
          {cfg.label}
        </motion.p>
      </div>
    </div>
  );
};

// ── Task item ────────────────────────────────────────────────────────────────
const TaskItem = ({ task, onToggle, onRemove, isActive }) => {
  const pct = task.duration > 0 ? Math.min((task.timeSpent / task.duration) * 100, 100) : 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 group ${
        isActive
          ? 'border-violet-500/40 bg-violet-500/10'
          : task.completed
          ? 'border-white/5 bg-white/[0.02] opacity-50'
          : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.06]'
      }`}
    >
      <button onClick={onToggle} className="flex-shrink-0">
        {task.completed
          ? <CheckSolid className="w-5 h-5 text-emerald-400" />
          : <CheckOutline className={`w-5 h-5 transition-colors ${isActive ? 'text-violet-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
        }
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate transition-all ${task.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
          {task.text}
        </p>
        {!task.completed && (
          <div className="mt-1 h-0.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        )}
      </div>
      <span className="text-[10px] text-gray-600 flex-shrink-0">{Math.ceil(task.duration / 60)}m</span>
      {!isActive && !task.completed && (
        <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <XMarkIcon className="w-3.5 h-3.5 text-gray-600 hover:text-red-400" />
        </button>
      )}
      {isActive && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-bold uppercase tracking-wider flex-shrink-0">Active</span>}
    </motion.div>
  );
};

// ── Session dots ─────────────────────────────────────────────────────────────
const SessionDots = ({ count }) => {
  const cycle = Math.floor(count / 4) * 4;
  return (
    <div className="flex items-center gap-2">
      {[0,1,2,3].map(i => {
        const filled = i < (count % 4) || (count > 0 && count % 4 === 0 && i === 3);
        const reallyFilled = i < count % 4;
        return (
          <motion.div
            key={i}
            animate={reallyFilled ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={`rounded-full transition-all duration-500 ${
              reallyFilled
                ? 'w-3.5 h-3.5 bg-violet-500 shadow-[0_0_10px_#7c3aed80]'
                : 'w-3 h-3 border border-gray-700 bg-transparent'
            }`}
          />
        );
      })}
      <span className="text-xs text-gray-600 ml-1">{count} done · {4 - (count % 4 || 4)} until long break</span>
    </div>
  );
};

// ── Main Pomodoro Component ──────────────────────────────────────────────────
const Pomodoro = () => {
  const { subjects, addPomodoroSession, pomodoroSessions, addToast } = useApp();
  const [mode, setMode] = useState('focus');          // 'focus' | 'shortBreak' | 'longBreak'
  const [selectedSubject, setSelectedSubject] = useState('');
  const [focusMins, setFocusMins] = useState(25);
  const [customMins, setCustomMins] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('');
  const intervalRef = useRef(null);
  const ambientRef = useRef(null);

  const DURATIONS = { focus: focusMins * 60, shortBreak: 5 * 60, longBreak: 15 * 60 };
  const [timeLeft, setTimeLeft] = useState(DURATIONS.focus);

  const cfg = MODES[mode];
  const totalDuration = DURATIONS[mode];
  const progress = 1 - timeLeft / totalDuration;

  // Sync timeLeft when mode or focusMins changes (only if not running)
  useEffect(() => {
    if (!isRunning) setTimeLeft(DURATIONS[mode]);
  }, [mode, focusMins]);

  // Ambient sound
  useEffect(() => {
    if (!ambientRef.current) return;
    if (isRunning && mode === 'focus' && isSoundEnabled) {
      ambientRef.current.play().catch(() => {});
    } else {
      ambientRef.current.pause();
    }
  }, [isRunning, mode, isSoundEnabled]);

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.15, 0.3].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = delay === 0 ? 880 : delay === 0.15 ? 1100 : 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.5);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.5);
      });
    } catch {}
  }, []);

  // Main timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        // Tick task progress
        if (mode === 'focus') {
          setTasks(prev => {
            const idx = prev.findIndex(t => !t.completed);
            if (idx === -1) return prev;
            const next = [...prev];
            const t = { ...next[idx], timeSpent: next[idx].timeSpent + 1 };
            if (t.timeSpent >= t.duration) t.completed = true;
            next[idx] = t;
            return next;
          });
        }

        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            playBeep();

            if (mode === 'focus') {
              if (selectedSubject) addPomodoroSession({ subject: selectedSubject, duration: DURATIONS.focus });
              const next = sessionCount + 1;
              setSessionCount(next);
              const isLong = next % 4 === 0;
              if (isLong) {
                setMode('longBreak');
                addToast('🎉 4 sessions done! Take a long break.', 'success');
                return 15 * 60;
              } else {
                setMode('shortBreak');
                addToast('🍅 Focus done! Take a short break.', 'success');
                return 5 * 60;
              }
            } else {
              setMode('focus');
              setIsRunning(false);
              addToast('☕ Break over! Ready to focus?', 'info');
              return DURATIONS.focus;
            }
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, selectedSubject, focusMins, sessionCount]);

  // Holds a pending stop action when there's un-logged focus time to confirm.
  const [confirmLog, setConfirmLog] = useState(null); // { sec, after }

  const handleStart = () => {
    if (mode === 'focus' && !selectedSubject) {
      addToast('Please select a subject first', 'warning');
      return;
    }
    setIsRunning(true);
  };
  const handlePause = () => setIsRunning(false);

  // If the user stops a focus session early (≥1 min in, with a subject), ask
  // whether to log the partial time before resetting/skipping.
  const stopWithLogPrompt = (after) => {
    const elapsed = totalDuration - timeLeft;
    if (mode === 'focus' && selectedSubject && elapsed >= 60 && timeLeft < totalDuration) {
      setIsRunning(false);
      setConfirmLog({ sec: elapsed, after });
    } else {
      after();
    }
  };

  const doReset = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };
  const doSkip = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setMode('shortBreak');
      setTimeLeft(5 * 60);
    } else {
      setMode('focus');
      setTimeLeft(DURATIONS.focus);
    }
  };
  const handleReset = () => stopWithLogPrompt(doReset);
  const handleSkip = () => stopWithLogPrompt(doSkip);

  const confirmLogYes = () => {
    if (!confirmLog) return;
    addPomodoroSession({ subject: selectedSubject, duration: confirmLog.sec });
    addToast(`✅ Logged ${Math.round(confirmLog.sec / 60)} min to ${selectedSubject}`, 'success');
    const after = confirmLog.after;
    setConfirmLog(null);
    after?.();
  };
  const confirmLogNo = () => {
    const after = confirmLog?.after;
    setConfirmLog(null);
    after?.();
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const dur = Math.min(parseInt(newTaskDuration) || focusMins, focusMins);
    if (dur <= 0) { addToast('Task must be at least 1 minute', 'warning'); return; }
    setTasks(prev => [...prev, { id: Date.now(), text: newTaskText.trim(), completed: false, duration: dur * 60, timeSpent: 0 }]);
    setNewTaskText('');
    setNewTaskDuration('');
  };
  const toggleTask = id => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const removeTask = id => setTasks(prev => prev.filter(t => t.id !== id));
  const activeTask = tasks.find(t => !t.completed);

  const today = formatDate(new Date());
  const todaySessions = pomodoroSessions.filter(s => formatDate(new Date(s.completedAt)) === today);

  const durations = [25, 50, 'Custom'];

  const modeTabCfg = [
    { key: 'focus',      label: '🎯 Focus',       color: '#7c3aed' },
    { key: 'shortBreak', label: '☕ Short Break',  color: '#0891b2' },
    { key: 'longBreak',  label: '🌅 Long Break',   color: '#d97706' },
  ];

  return (
    <Layout title="Pomodoro">
      <div className={isFullscreen
        ? 'fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto p-6'
        : 'max-w-2xl mx-auto space-y-5'
      }
        style={isFullscreen ? {
          background: `radial-gradient(ellipse at 50% 40%, ${cfg.color}22 0%, #020409 60%)`,
        } : {}}
      >
        <audio ref={ambientRef} src="https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg" loop />

        {/* Fullscreen exit */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/10"
          >
            <ArrowsPointingInIcon className="w-5 h-5" />
          </button>
        )}

        {/* ── Main Timer Card ── */}
        <motion.div
          layout
          className={`relative overflow-hidden rounded-3xl ${isFullscreen ? 'w-full max-w-lg' : 'w-full'}`}
          animate={{ borderColor: `${cfg.color}60` }}
          style={{
            background: cfg.cardBg,
            border: `1px solid ${cfg.color}50`,
            boxShadow: `0 0 80px ${cfg.color}30, 0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)`,
          }}
        >
          {/* Solid top color band */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
            animate={{ background: cfg.headerBg }}
            transition={{ duration: 0.6 }}
          />
          {/* Corner glow blobs */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${cfg.color}35 0%, transparent 70%)` }} />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle, ${cfg.accent}20 0%, transparent 70%)` }} />
          <Particles color={cfg.accent} count={10} />

          <div className="relative z-10 p-6 pb-8">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={isRunning ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isRunning ? cfg.color : '#374151' }}
                />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {isRunning ? 'Running' : 'Paused'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSoundEnabled(s => !s)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                >
                  {isSoundEnabled ? <SpeakerWaveIcon className="w-4 h-4" /> : <SpeakerXMarkIcon className="w-4 h-4" />}
                </button>
                {!isFullscreen && (
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all"
                    title="Zen Mode"
                  >
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Mode tabs */}
            <div className="flex gap-1.5 p-1.5 rounded-2xl mb-6" style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {modeTabCfg.map(tab => {
                const tabCfg = MODES[tab.key];
                const active = mode === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => { if (!isRunning) { setMode(tab.key); setTimeLeft(DURATIONS[tab.key]); }}}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
                    style={active ? {
                      background: tabCfg.tabBg,
                      color: '#fff',
                      boxShadow: tabCfg.tabShadow,
                    } : {
                      color: 'rgba(255,255,255,0.35)',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Duration + Subject selector (focus mode, not running) */}
            <AnimatePresence>
              {!isRunning && mode === 'focus' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {durations.map(d => {
                      const sel = d === 'Custom' ? isCustom : (!isCustom && focusMins === d);
                      return (
                        <button
                          key={d}
                          onClick={() => {
                            if (d === 'Custom') { setIsCustom(true); }
                            else { setIsCustom(false); setFocusMins(d); }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                            sel
                              ? 'bg-violet-600/80 text-white border-violet-500/50 shadow-[0_0_16px_#7c3aed40]'
                              : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          {d === 'Custom' ? 'Custom' : `${d} min`}
                        </button>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {isCustom && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center justify-center gap-2 mb-4"
                      >
                        <input
                          type="number" min="1" max="180"
                          value={customMins}
                          onChange={e => { setCustomMins(e.target.value); const v = parseInt(e.target.value); if (!isNaN(v) && v > 0) setFocusMins(v); }}
                          placeholder="Minutes"
                          className="input-field w-28 text-center"
                        />
                        <span className="text-sm text-gray-500">mins</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <select
                    className="input-field w-full"
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                  >
                    <option value="">Select subject to track...</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active subject pill */}
            <AnimatePresence>
              {selectedSubject && mode === 'focus' && isRunning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex justify-center mb-4"
                >
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                    <span className="text-xs font-semibold text-violet-300">Studying: {selectedSubject}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Circular timer — centered */}
            <div className="flex justify-center mb-6">
              <CircularTimer progress={progress} mode={mode} timeLeft={timeLeft} isRunning={isRunning} />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Reset */}
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all font-bold text-sm"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid ${cfg.color}40`,
                  color: cfg.accent,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
              >
                <ArrowPathIcon className="w-5 h-5" />
              </motion.button>

              {/* Play / Pause — big solid */}
              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={isRunning ? handlePause : handleStart}
                className="w-20 h-20 rounded-2xl flex items-center justify-center relative"
                style={{
                  background: cfg.tabBg,
                  boxShadow: `${cfg.tabShadow}, 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
                }}
              >
                {isRunning && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl"
                    animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ background: cfg.color }}
                  />
                )}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isRunning ? 'pause' : 'play'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isRunning
                      ? <PauseIcon className="w-8 h-8 text-white" />
                      : <PlayIcon className="w-8 h-8 text-white ml-1" />
                    }
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {/* Skip */}
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                onClick={handleSkip}
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: `1px solid ${cfg.color}40`,
                  color: cfg.accent,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
                }}
              >
                <ForwardIcon className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Session dots */}
            <div className="flex justify-center mb-2">
              <SessionDots count={sessionCount} />
            </div>

            {/* Info pill */}
            {mode === 'focus' && (
              <div className="mt-4 flex justify-center">
                <div
                  className="text-[10px] font-semibold px-4 py-1.5 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${cfg.color}30, ${cfg.accent}20)`,
                    border: `1px solid ${cfg.color}50`,
                    color: cfg.accent,
                  }}
                >
                  Each session logs <strong>+{(focusMins / 60).toFixed(2)}h</strong> to {selectedSubject || 'your subject'}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Tasks + History (hidden in fullscreen) ── */}
        {!isFullscreen && (
          <>
            {/* Task Panel */}
            {mode === 'focus' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl overflow-hidden"
                style={{
                  background: 'linear-gradient(160deg, #1a0a3e 0%, #0f0a28 60%, #08061a 100%)',
                  border: '1px solid #6d28d940',
                  boxShadow: '0 8px 40px rgba(109,40,217,0.15), 0 4px 16px rgba(0,0,0,0.5)',
                }}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display font-bold text-white flex items-center gap-2">
                      <span>🎯</span> Session Tasks
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400">
                        {tasks.filter(t => t.completed).length}/{tasks.length} done
                      </span>
                      {tasks.length > 0 && (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          (focusMins * 60 - tasks.reduce((s,t) => s+t.duration, 0)) <= 0
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-white/5 border-white/10 text-gray-400'
                        }`}>
                          {Math.max(0, Math.floor((focusMins * 60 - tasks.reduce((s,t) => s+t.duration, 0)) / 60))}m free
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Task list */}
                  <AnimatePresence>
                    {tasks.length > 0 && (
                      <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto pr-1">
                        <AnimatePresence>
                          {tasks.map(task => (
                            <TaskItem
                              key={task.id}
                              task={task}
                              onToggle={() => toggleTask(task.id)}
                              onRemove={() => removeTask(task.id)}
                              isActive={activeTask?.id === task.id}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Add task row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field flex-1 text-sm py-2"
                      placeholder="Add a task..."
                      value={newTaskText}
                      onChange={e => setNewTaskText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    />
                    <input
                      type="number" min="1" max={focusMins}
                      className="input-field w-16 text-sm py-2 text-center"
                      placeholder="min"
                      value={newTaskDuration}
                      onChange={e => setNewTaskDuration(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                      onClick={handleAddTask}
                      className="text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <PlusCircleIcon className="w-8 h-8" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Today's Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #12101f 0%, #0d0b1e 60%, #080614 100%)',
                border: '1px solid rgba(139,92,246,0.2)',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-white flex items-center gap-2">
                    <span>📋</span> Today's Sessions
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500">{todaySessions.length} sessions</span>
                    <span className="text-xs font-bold text-violet-400">
                      {(todaySessions.reduce((s, x) => s + x.duration, 0) / 3600).toFixed(1)}h
                    </span>
                  </div>
                </div>

                {todaySessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <motion.div
                      animate={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="text-4xl mb-3"
                    >🍅</motion.div>
                    <p className="text-gray-500 text-sm font-medium">No sessions yet today</p>
                    <p className="text-gray-700 text-xs mt-1">Start your first Pomodoro above!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <AnimatePresence>
                      {todaySessions.map((s, i) => {
                        const subj = subjects.find(sub => sub.name === s.subject);
                        const color = subj?.color || '#7c3aed';
                        return (
                          <motion.div
                            key={s.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                            style={{
                              background: `linear-gradient(90deg, ${color}18 0%, transparent 100%)`,
                              border: `1px solid ${color}30`,
                            }}
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 font-bold"
                              style={{ background: `linear-gradient(135deg, ${color}60, ${color}30)`, border: `1px solid ${color}60`, boxShadow: `0 4px 12px ${color}40` }}
                            >
                              🍅
                            </div>
                            <div className="w-[3px] h-8 rounded-full flex-shrink-0" style={{ background: `linear-gradient(to bottom, ${color}, ${color}50)` }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-white truncate">{s.subject}</p>
                              <p className="text-[10px] text-gray-500">
                                {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {Math.round(s.duration / 60)} min
                              </p>
                            </div>
                            <div
                              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-right"
                              style={{ background: `${color}25`, border: `1px solid ${color}40` }}
                            >
                              <p className="text-sm font-black" style={{ color }}>+{(s.duration / 3600).toFixed(2)}h</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Log-partial-time confirmation */}
      <AnimatePresence>
        {confirmLog && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-3xl p-6 max-w-sm w-full text-center"
              style={{ background: '#150f2e', border: '1px solid #6d28d955', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
            >
              <div className="text-4xl mb-3">⏱️</div>
              <h3 className="text-lg font-bold text-white mb-1">Log this focus time?</h3>
              <p className="text-sm text-gray-400 mb-5">
                You focused for <span className="text-violet-300 font-bold">{Math.floor(confirmLog.sec / 60)}m {confirmLog.sec % 60}s</span> on {selectedSubject}. Want to log it before stopping?
              </p>
              <div className="flex gap-3">
                <button onClick={confirmLogNo} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm hover:bg-white/10 transition-colors">
                  Discard
                </button>
                <button onClick={confirmLogYes} className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
                  Log {Math.round(confirmLog.sec / 60)} min
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Pomodoro;
