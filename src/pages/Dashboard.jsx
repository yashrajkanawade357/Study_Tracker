import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import AnimatedCounter from '../components/AnimatedCounter';
import {
  PieChart, Pie, Cell,
  Tooltip, ResponsiveContainer
} from 'recharts';
import {
  ClockIcon, FireIcon, BookOpenIcon, TrophyIcon, PlusCircleIcon
} from '@heroicons/react/24/outline';
import {
  getLast7Days, getWeekDays, formatDate, formatDisplay, formatFull,
  getStudyLogsForWeek, aggregateHoursByDay, aggregateHoursBySubject,
  getDaysRemaining
} from '../utils/dateUtils';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#22d3ee'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-xs">
        <p className="font-bold text-white mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value?.toFixed(1)}h</p>
        ))}
      </div>
    );
  }
  return null;
};

const calculateTimeLeft = (targetDate) => {
  // Assuming targetDate is just a date string like YYYY-MM-DD, 
  // we set it to the end of that day or start of that day.
  // Let's set it to the end of the day (23:59:59) for the countdown, 
  // or just use the exact date object.
  const target = new Date(targetDate);
  // If the target has no time, let's assume it's the end of the day so they have until midnight.
  target.setHours(23, 59, 59, 999);
  
  const difference = target - new Date();
  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }
  return timeLeft;
};

const ExamCountdownItem = ({ exam }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(exam.date));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(exam.date));
    }, 1000);
    return () => clearInterval(timer);
  }, [exam.date]);

  const urgency = timeLeft.days <= 3 ? 'red' : timeLeft.days <= 7 ? 'amber' : 'emerald';
  const palette = {
    red:     { accent: '#ef4444', glow: '#ef444430', badge: 'bg-red-500/20 text-red-300',     label: '🔴 Urgent' },
    amber:   { accent: '#f59e0b', glow: '#f59e0b30', badge: 'bg-amber-500/20 text-amber-300', label: '🟡 Soon' },
    emerald: { accent: '#10b981', glow: '#10b98130', badge: 'bg-emerald-500/20 text-emerald-300', label: '🟢 Upcoming' },
  };
  const { accent, glow, badge, label } = palette[urgency];

  const units = [
    { value: timeLeft.days,                              unit: 'Days' },
    { value: timeLeft.hours.toString().padStart(2, '0'), unit: 'Hrs'  },
    { value: timeLeft.minutes.toString().padStart(2, '0'), unit: 'Min' },
    { value: timeLeft.seconds.toString().padStart(2, '0'), unit: 'Sec' },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${accent}30`, background: `${glow}` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ borderBottom: `1px solid ${accent}20` }}
      >
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{exam.name || exam.subject}</p>
          <p className="text-[10px] mt-0.5" style={{ color: accent }}>{formatFull(exam.date)}</p>
        </div>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${badge}`}>
          {label}
        </span>
      </div>
      {/* Countdown row */}
      <div className="flex items-stretch gap-px p-2">
        {units.map(({ value, unit }, idx) => (
          <div key={unit} className="flex-1 flex flex-col items-center py-1.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.25)' }}>
            <span className="text-base font-display font-bold leading-none" style={{ color: accent }}>
              {value}
            </span>
            <span className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: `${accent}99` }}>
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Bar Chart Item (stacked by subject color) ──────────────── */
const BarItem = ({ day, i, maxHours, isToday, subjects }) => {
  const [hovered, setHovered] = useState(false);
  const pct = maxHours > 0 ? (day.hours / maxHours) * 100 : 0;

  // Build per-subject segments from the day object
  // aggregateHoursByDay spreads subject keys directly onto the day object
  const RESERVED = new Set(['date', 'label', 'hours']);
  const segments = subjects
    .filter(s => day[s.name] > 0)
    .map(s => ({ name: s.name, hours: day[s.name], color: s.color || '#7c3aed' }))
    .sort((a, b) => b.hours - a.hours); // tallest at bottom for visual clarity

  // Dominant color = subject with most hours that day
  const dominantColor = segments[0]?.color || '#7c3aed';

  return (
    <div
      className="flex flex-col items-center justify-end flex-1 h-full gap-1 cursor-pointer relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover tooltip — shows per-subject breakdown */}
      {hovered && day.hours > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute z-30 pointer-events-none"
          style={{ bottom: `${Math.max(pct, 4)}%`, marginBottom: 8 }}
        >
          <div
            className="rounded-xl px-3 py-2 text-[10px] font-semibold text-white whitespace-nowrap"
            style={{
              background: 'rgba(10,10,20,0.92)',
              border: `1px solid ${dominantColor}50`,
              boxShadow: `0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px ${dominantColor}20`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <p className="text-white font-bold mb-1">{day.label} · {day.hours.toFixed(1)}h</p>
            {segments.map(seg => (
              <div key={seg.name} className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span style={{ color: seg.color }}>{seg.name}</span>
                <span className="text-gray-400 ml-auto pl-3">{seg.hours.toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Value label */}
      {day.hours > 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0.7 }}
          transition={{ delay: 0.4 + i * 0.08 }}
          className="text-[9px] font-bold"
          style={{ color: dominantColor }}
        >
          {day.hours.toFixed(1)}h
        </motion.span>
      )}

      {/* Stacked bar */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: pct > 0 ? `${Math.max(pct, 4)}%` : '3px',
          opacity: 1,
          scaleX: hovered ? 1.08 : 1,
        }}
        transition={{ duration: 0.8, delay: i * 0.07, ease: [0.23, 1, 0.32, 1] }}
        className="w-full rounded-t-xl relative overflow-hidden flex flex-col-reverse"
        style={{
          background: pct > 0 ? 'transparent' : 'rgba(255,255,255,0.06)',
          boxShadow: pct > 0 ? `0 0 16px ${dominantColor}40` : 'none',
          minHeight: 3,
          transformOrigin: 'bottom',
          outline: isToday ? `1.5px solid ${dominantColor}` : 'none',
          outlineOffset: '2px',
        }}
      >
        {pct > 0 && segments.length > 0 ? (
          // Render each subject segment proportionally
          segments.map((seg, si) => {
            const segPct = (seg.hours / day.hours) * 100;
            return (
              <div
                key={seg.name}
                style={{
                  height: `${segPct}%`,
                  background: si === 0
                    ? `linear-gradient(to top, ${seg.color}cc, ${seg.color})`
                    : seg.color,
                  minHeight: 2,
                  position: 'relative',
                }}
              >
                {/* Shine sweep on the bottom (dominant) segment */}
                {si === 0 && (
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, delay: 1 + i * 0.1, repeat: Infinity, repeatDelay: 5 }}
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', width: '40%' }}
                  />
                )}
              </div>
            );
          })
        ) : pct > 0 ? (
          // Fallback single-color bar if no subject match
          <div style={{ flex: 1, background: `linear-gradient(to top, ${dominantColor}cc, ${dominantColor})` }} />
        ) : null}
      </motion.div>
    </div>
  );
};


const Dashboard = () => {
  const { studyLogs, subjects, exams, userProfile, addStudyLog, addToast, currentStreak } = useApp();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [hoursInput, setHoursInput] = useState('');
  const [minutesInput, setMinutesInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [dateInput, setDateInput] = useState(formatDate(new Date()));

  const today = new Date();
  const weekLogs = useMemo(() => getStudyLogsForWeek(studyLogs), [studyLogs]);
  // Use the same Mon–Sun week for the bar chart so the total matches "Hours This Week"
  const currentWeekDays = useMemo(() => getWeekDays(), []);

  // Stats — use string comparison to avoid UTC-parse timezone bugs
  const weekHours = useMemo(() => weekLogs.reduce((s, l) => s + l.hours, 0), [weekLogs]);
  const todayStr = formatDate(today);
  const monthStartStr = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
  const monthEndStr = format(new Date(today.getFullYear(), today.getMonth() + 1, 0), 'yyyy-MM-dd');
  const monthLogs = useMemo(
    () => studyLogs.filter(l => l.date >= monthStartStr && l.date <= monthEndStr),
    [studyLogs, monthStartStr, monthEndStr]
  );
  const monthHours = useMemo(() => monthLogs.reduce((s, l) => s + l.hours, 0), [monthLogs]);
  const todayHours = useMemo(
    () => studyLogs.filter(l => l.date === todayStr).reduce((s, l) => s + l.hours, 0),
    [studyLogs, todayStr]
  );
  const activeSubjects = subjects.length;
  const streak = currentStreak;

  // Chart data
  const barData = useMemo(() => aggregateHoursByDay(studyLogs, currentWeekDays), [studyLogs, currentWeekDays]);
  const pieData = useMemo(() => {
    const totals = aggregateHoursBySubject(weekLogs);
    return subjects
      .filter(s => totals[s.name] > 0)
      .map((s, i) => ({ name: s.name, value: parseFloat(totals[s.name].toFixed(1)), color: s.color || COLORS[i % COLORS.length] }));
  }, [weekLogs, subjects]);

  // Exam countdowns
  const upcomingExams = useMemo(() => {
    return exams
      .filter(e => {
        const target = new Date(e.date);
        target.setHours(23, 59, 59, 999);
        return target.getTime() > new Date().getTime();
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [exams]);

  // Recent activity
  const recentLogs = useMemo(() =>
    [...studyLogs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
  , [studyLogs]);

  const handleLog = () => {
    if (!selectedSubject) { addToast('Please select a subject', 'warning'); return; }
    const hrs = parseInt(hoursInput) || 0;
    const mins = parseInt(minutesInput) || 0;
    const totalHours = hrs + (mins / 60);
    
    if (totalHours <= 0 || totalHours > 24) { addToast('Enter valid duration (up to 24h)', 'warning'); return; }
    addStudyLog({ subject: selectedSubject, hours: totalHours, note: noteInput, timestamp: new Date(dateInput).toISOString(), date: dateInput });
    addToast(`✅ Logged ${hrs > 0 ? hrs + 'h ' : ''}${mins}m for ${selectedSubject}!`, 'success');
    setHoursInput('');
    setMinutesInput('');
    setNoteInput('');
  };

  // Progress targets come from the sum of every subject's weekly goal
  // (monthly ≈ 4 weeks). Falls back to 20h/week if no goals are set yet.
  const weeklyGoalTotal = subjects.reduce((sum, s) => sum + (Number(s.weeklyGoal) || 0), 0);
  const weekTarget = weeklyGoalTotal > 0 ? weeklyGoalTotal : 20;
  const monthTarget = weekTarget * 4;

  const statCards = [
    {
      label: 'Hours This Week',
      value: weekHours,
      icon: ClockIcon,
      solidBg: 'linear-gradient(135deg, #0891b2 0%, #1d4ed8 100%)',
      shadowColor: '#0891b2',
      accentColor: '#38bdf8',
      suffix: 'h',
      decimals: 1,
      subLabel: `${weekLogs.length} session${weekLogs.length !== 1 ? 's' : ''}`,
      progress: Math.min((weekHours / weekTarget) * 100, 100),
      progressLabel: `${weekHours.toFixed(1)} / ${weekTarget}h goal`,
      trend: weekHours >= weekTarget ? '✓' : weekHours > weekTarget * 0.5 ? '↑' : '→',
    },
    {
      label: 'Hours This Month',
      value: monthHours,
      icon: BookOpenIcon,
      solidBg: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
      shadowColor: '#7c3aed',
      accentColor: '#a78bfa',
      suffix: 'h',
      decimals: 1,
      subLabel: `${monthLogs.length} session${monthLogs.length !== 1 ? 's' : ''}`,
      progress: Math.min((monthHours / monthTarget) * 100, 100),
      progressLabel: `${monthHours.toFixed(1)} / ${monthTarget}h goal`,
      trend: monthHours >= monthTarget ? '✓' : monthHours > monthTarget * 0.5 ? '↑' : '→',
    },
    {
      label: 'Active Subjects',
      value: activeSubjects,
      icon: TrophyIcon,
      solidBg: 'linear-gradient(135deg, #059669 0%, #0891b2 100%)',
      shadowColor: '#059669',
      accentColor: '#34d399',
      suffix: '',
      decimals: 0,
      subLabel: 'being tracked',
      progress: Math.min((activeSubjects / 8) * 100, 100),
      progressLabel: `${activeSubjects} of 8 slots`,
      trend: activeSubjects > 0 ? '↑' : '→',
    },
    {
      label: 'Current Streak',
      value: streak,
      icon: FireIcon,
      solidBg: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
      shadowColor: '#ea580c',
      accentColor: '#fbbf24',
      suffix: 'd',
      decimals: 0,
      subLabel: streak > 0 ? '🔥 keep it going!' : 'start today!',
      progress: Math.min((streak / 30) * 100, 100),
      progressLabel: streak > 0 ? `${streak} day streak` : 'No streak yet',
      trend: streak >= 7 ? '🔥' : streak > 0 ? '↑' : '→',
    },
  ];

  return (
    <Layout title="Dashboard">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, solidBg, shadowColor, accentColor, suffix, decimals, subLabel, progress, progressLabel, trend }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 180, damping: 18 }}
          >
            <div
              className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between group cursor-default"
              style={{
                background: solidBg,
                boxShadow: `0 8px 32px ${shadowColor}40, 0 2px 8px rgba(0,0,0,0.4)`,
                minHeight: '148px',
                transition: 'box-shadow 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 16px 48px ${shadowColor}60, 0 4px 16px rgba(0,0,0,0.5)`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 8px 32px ${shadowColor}40, 0 2px 8px rgba(0,0,0,0.4)`; }}
            >
              {/* Diagonal shine overlay */}
              <div
                className="absolute inset-0 opacity-10 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 60%)' }}
              />
              {/* Shimmer sweep on hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-10"
                initial={{ x: '-100%', opacity: 0 }}
                whileHover={{ x: '200%', opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', width: '50%' }}
              />
              {/* Noise texture */}
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
              />

              {/* Top row: label + icon with pulse ring */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/70">{label}</p>
                  <span className="text-[11px] text-white/50 font-bold">{trend}</span>
                </div>
                <div className="relative flex-shrink-0">
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    style={{ background: `${accentColor}30` }}
                  />
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center relative z-10">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Value + sub-label */}
              <div className="relative z-10 mt-2">
                <p className="text-4xl font-display font-black text-white leading-none tracking-tight">
                  <AnimatedCounter target={value} decimals={decimals || 0} suffix={suffix} />
                </p>
                <p className="text-[11px] text-white/60 mt-1 font-medium">{subLabel}</p>
              </div>

              {/* Progress bar */}
              <div className="relative z-10 mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-white/40 uppercase tracking-wider">{progressLabel}</span>
                  <span className="text-[9px] font-bold text-white/60">{Math.round(progress)}%</span>
                </div>
                <div className="h-1 rounded-full bg-black/20 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                    style={{ background: `linear-gradient(90deg, rgba(255,255,255,0.5), ${accentColor})` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Log */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="p-5 h-full">
            <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
              <PlusCircleIcon className="w-5 h-5 text-purple-400" />
              Quick Log
            </h3>
            <div className="flex flex-col gap-3">
              <select
                className="input-field"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              >
                <option value="">Select Subject...</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <input
                  type="number"
                  className="input-field flex-1"
                  placeholder="Hours"
                  value={hoursInput}
                  onChange={e => setHoursInput(e.target.value)}
                  min="0"
                  max="24"
                  step="1"
                />
                <input
                  type="number"
                  className="input-field flex-1"
                  placeholder="Minutes"
                  value={minutesInput}
                  onChange={e => setMinutesInput(e.target.value)}
                  min="0"
                  max="59"
                  step="1"
                />
              </div>
              <input
                type="date"
                className="input-field"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                max={formatDate(new Date())}
              />
              <input
                type="text"
                className="input-field"
                placeholder="Note (optional)"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
              />
              <button onClick={handleLog} className="btn-primary">
                ⚡ Log It
              </button>
            </div>
          </GlassCard>
        </motion.div>

        {/* Weekly Bar Chart */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <GlassCard className="p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-white text-base">Weekly Study Hours</h3>
                <p className="text-xs text-gray-500 mt-0.5">This week · Mon – Sun</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs text-gray-400 font-medium">
                  {barData.reduce((s, d) => s + d.hours, 0).toFixed(1)}h total
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="flex-1 flex flex-col min-h-[200px]">
              {(() => {
                const maxHours = Math.max(...barData.map(d => d.hours), 1);
                const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short' });
                const gridLines = [0, 25, 50, 75, 100];
                return (
                  <div className="flex-1 flex flex-col gap-2">
                    {/* Bar area */}
                    <div className="relative flex-1" style={{ minHeight: 160 }}>
                      {/* Grid lines */}
                      {gridLines.map((pct, gi) => (
                        <div
                          key={gi}
                          className="absolute left-8 right-0 flex items-center pointer-events-none"
                          style={{ bottom: `${pct}%` }}
                        >
                          <span className="text-[9px] text-gray-600 w-8 text-right pr-2 -ml-8 shrink-0">
                            {pct === 0 ? '' : `${(maxHours * pct / 100).toFixed(pct === 100 ? 0 : 1)}h`}
                          </span>
                          <div className="flex-1 h-px" style={{ background: pct === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)' }} />
                        </div>
                      ))}

                      {/* Bars */}
                      <div className="absolute inset-0 pl-8 pb-0.5 flex items-end gap-2">
                        {barData.map((day, i) => (
                          <BarItem
                            key={day.date}
                            day={day}
                            i={i}
                            maxHours={maxHours}
                            isToday={day.label === todayLabel}
                            subjects={subjects}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Day labels */}
                    <div className="flex gap-2 pl-8">
                      {barData.map((day, i) => {
                        const isToday = day.label === todayLabel;
                        return (
                          <div key={i} className="flex-1 text-center">
                            <span
                              className={`text-[10px] font-bold ${
                                isToday ? 'text-violet-400' : 'text-gray-500'
                              }`}
                            >
                              {day.label}
                            </span>
                            {isToday && (
                              <div className="mx-auto mt-0.5 w-1 h-1 rounded-full bg-violet-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="pt-3 mt-1"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {/* Stats row */}
                      <div className="flex items-center justify-between mb-3">
                        {[
                          { label: 'Best day', value: `${Math.max(...barData.map(d => d.hours)).toFixed(1)}h`, color: '#a855f7' },
                          { label: 'Daily avg', value: `${(barData.reduce((s,d)=>s+d.hours,0)/7).toFixed(1)}h`, color: '#6366f1' },
                          { label: 'Active days', value: `${barData.filter(d=>d.hours>0).length}/7`, color: '#3b82f6' },
                        ].map((stat, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1 + i * 0.08, type: 'spring', stiffness: 200 }}
                            className="flex flex-col items-center gap-0.5"
                          >
                            <span className="text-sm font-display font-bold" style={{ color: stat.color }}>{stat.value}</span>
                            <span className="text-[9px] text-gray-600 uppercase tracking-wider">{stat.label}</span>
                          </motion.div>
                        ))}
                      </div>
                      {/* Subject color legend */}
                      {subjects.filter(s => barData.some(d => d[s.name] > 0)).length > 0 && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {subjects
                            .filter(s => barData.some(d => d[s.name] > 0))
                            .map(s => (
                              <div key={s.id} className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: s.color || '#7c3aed' }} />
                                <span className="text-[9px] text-gray-500">{s.name}</span>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </motion.div>
                  </div>
                );
              })()}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-purple-400 to-blue-500 rounded-full" />
              Subject Distribution
            </h3>
            {pieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <p className="text-3xl mb-2">📈</p>
                <p className="text-sm">Log sessions to see distribution</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0f0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                      itemStyle={{ color: '#e2e8f0' }}
                      labelStyle={{ color: '#a0aec0', fontWeight: 600, marginBottom: 4 }}
                      formatter={(v, name) => [`${v}h`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-xs text-gray-300 truncate">{entry.name}</span>
                      <span className="text-xs font-bold text-white ml-auto">{entry.value}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Exam Countdowns */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
              Upcoming Exams
            </h3>
            {upcomingExams.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-sm">No upcoming exams</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[320px]">
                {upcomingExams.map(exam => (
                  <ExamCountdownItem key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-6">
            <h3 className="font-display font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-pink-400 to-purple-500 rounded-full" />
              Recent Activity
            </h3>
            {recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                <p className="text-2xl mb-2">📝</p>
                <p className="text-sm">No logs yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentLogs.map(log => {
                  const subj = subjects.find(s => s.name === log.subject);
                  const color = subj?.color || '#7c3aed';
                  const hoursDisplay = typeof log.hours === 'number' && log.hours % 1 !== 0
                    ? log.hours.toFixed(1)
                    : log.hours;
                  return (
                    <div key={log.id} className="group flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      {/* Avatar circle — uses subject color */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-200"
                        style={{
                          background: `${color}22`,
                          border: `1.5px solid ${color}50`,
                          color,
                        }}
                      >
                        {log.subject[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Subject name with colored dot */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <p className="text-sm font-medium text-white truncate">{log.subject}</p>
                        </div>
                        <p className="text-[10px] text-gray-500 ml-3">{formatDisplay(log.date)}{log.note ? ` · ${log.note}` : ''}</p>
                      </div>
                      {/* Hours badge — uses subject color */}
                      <div
                        className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                        style={{
                          color,
                          background: `${color}18`,
                          border: `1px solid ${color}35`,
                        }}
                      >
                        +{hoursDisplay}h
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
