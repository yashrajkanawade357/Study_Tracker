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
  getLast7Days, formatDate, formatDisplay, formatFull,
  getStudyLogsForWeek, aggregateHoursByDay, aggregateHoursBySubject,
  getDaysRemaining
} from '../utils/dateUtils';

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
  const colors = {
    red: 'border-red-500/30 bg-red-900/20 text-red-400',
    amber: 'border-amber-500/30 bg-amber-900/20 text-amber-400',
    emerald: 'border-emerald-500/30 bg-emerald-900/20 text-emerald-400',
  };

  return (
    <div className={`flex flex-col p-3 rounded-xl border ${colors[urgency]}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-semibold text-white">{exam.name}</p>
          <p className="text-xs opacity-70">{formatFull(exam.date)}</p>
        </div>
      </div>
      <div className="flex justify-between items-center bg-black/20 rounded-lg p-2">
        <div className="text-center flex-1">
          <p className="text-lg font-display font-bold leading-none">{timeLeft.days}</p>
          <p className="text-[10px] uppercase tracking-wider opacity-70">Days</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-lg font-display font-bold leading-none">{timeLeft.hours.toString().padStart(2, '0')}</p>
          <p className="text-[10px] uppercase tracking-wider opacity-70">Hrs</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-lg font-display font-bold leading-none">{timeLeft.minutes.toString().padStart(2, '0')}</p>
          <p className="text-[10px] uppercase tracking-wider opacity-70">Min</p>
        </div>
        <div className="text-center flex-1">
          <p className="text-lg font-display font-bold leading-none">{timeLeft.seconds.toString().padStart(2, '0')}</p>
          <p className="text-[10px] uppercase tracking-wider opacity-70">Sec</p>
        </div>
      </div>
    </div>
  );
};

/* ── Bar Chart Item ──────────────────────────────────────── */
const BarItem = ({ day, i, maxHours, isToday, barColors }) => {
  const [hovered, setHovered] = useState(false);
  const pct = maxHours > 0 ? (day.hours / maxHours) * 100 : 0;
  const [c1, c2] = barColors[i % barColors.length];
  return (
    <div
      className="flex flex-col items-center justify-end flex-1 h-full gap-1 cursor-pointer relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover tooltip */}
      {hovered && day.hours > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-8 px-2 py-1 rounded-lg text-[10px] font-bold text-white z-20 whitespace-nowrap pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 4px 12px ${c1}50` }}
        >
          {day.hours.toFixed(1)}h
        </motion.div>
      )}
      {/* Value label */}
      {day.hours > 0 && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0.65 }}
          transition={{ delay: 0.4 + i * 0.08 }}
          className="text-[9px] font-bold"
          style={{ color: c1 }}
        >
          {day.hours.toFixed(1)}h
        </motion.span>
      )}
      {/* Bar */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: pct > 0 ? `${Math.max(pct, 4)}%` : '3px',
          opacity: 1,
          scaleX: hovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.8, delay: i * 0.07, ease: [0.23, 1, 0.32, 1] }}
        className="w-full rounded-t-xl relative overflow-hidden"
        style={{
          background: pct > 0 ? `linear-gradient(to top, ${c1}, ${c2})` : 'rgba(255,255,255,0.06)',
          boxShadow: pct > 0 ? `0 0 16px ${c1}40, inset 0 1px 0 rgba(255,255,255,0.2)` : 'none',
          minHeight: 3,
          transformOrigin: 'bottom',
          outline: isToday ? `1.5px solid ${c2}` : 'none',
          outlineOffset: '2px',
        }}
      >
        {pct > 0 && (
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, delay: 1 + i * 0.1, repeat: Infinity, repeatDelay: 5 }}
            className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', width: '40%' }}
          />
        )}
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
  const last7Days = useMemo(() => getLast7Days(), []);

  // Stats
  const weekHours = useMemo(() => weekLogs.reduce((s, l) => s + l.hours, 0), [weekLogs]);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthLogs = useMemo(() => studyLogs.filter(l => new Date(l.date) >= monthStart), [studyLogs]);
  const monthHours = useMemo(() => monthLogs.reduce((s, l) => s + l.hours, 0), [monthLogs]);
  const activeSubjects = subjects.length;
  const streak = currentStreak;

  // Chart data
  const barData = useMemo(() => aggregateHoursByDay(studyLogs, last7Days), [studyLogs, last7Days]);
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

  const statCards = [
    { label: 'Hours This Week', value: weekHours, icon: ClockIcon, color: 'text-cyan-400', suffix: 'h', decimals: 1 },
    { label: 'Hours This Month', value: monthHours, icon: BookOpenIcon, color: 'text-purple-400', suffix: 'h', decimals: 1 },
    { label: 'Active Subjects', value: activeSubjects, icon: TrophyIcon, color: 'text-emerald-400', suffix: '' },
    { label: 'Current Streak', value: streak, icon: FireIcon, color: 'text-orange-400', suffix: ' days' },
  ];

  return (
    <Layout title="Dashboard">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color, suffix, decimals }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
                <div className={`w-8 h-8 rounded-lg bg-navy-800 flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-3xl font-display font-bold ${color}`}>
                <AnimatedCounter target={value} decimals={decimals || 0} suffix={suffix} />
              </p>
            </GlassCard>
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
                <p className="text-xs text-gray-500 mt-0.5">Last 7 days performance</p>
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
                const barColors = [
                  ['#3b82f6', '#6366f1'],
                  ['#6366f1', '#8b5cf6'],
                  ['#8b5cf6', '#a855f7'],
                  ['#a855f7', '#c026d3'],
                  ['#7c3aed', '#6366f1'],
                  ['#06b6d4', '#3b82f6'],
                  ['#10b981', '#06b6d4'],
                ];
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
                            barColors={barColors}
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
                      className="flex items-center justify-between pt-3 mt-1"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                    >
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
          <GlassCard className="p-5">
            <h3 className="font-display font-bold text-white mb-4">🎯 Subject Distribution</h3>
            {pieData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <p className="text-3xl mb-2">📈</p>
                <p className="text-sm">Log sessions to see distribution</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}h`, '']} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span>{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>

        {/* Exam Countdowns */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard className="p-5">
            <h3 className="font-display font-bold text-white mb-4">📅 Exam Countdowns</h3>
            {upcomingExams.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-sm">No upcoming exams</p>
                <p className="text-xs text-gray-600">Add exams in Settings</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
                {upcomingExams.map(exam => (
                  <ExamCountdownItem key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-5">
            <h3 className="font-display font-bold text-white mb-4">🕒 Recent Activity</h3>
            {recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <p className="text-2xl mb-2">📝</p>
                <p className="text-sm">No study sessions yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {recentLogs.map(log => {
                  const subj = subjects.find(s => s.name === log.subject);
                  return (
                    <div key={log.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-navy-700/30 transition-colors">
                      <div
                        className="w-2 h-10 rounded-full flex-shrink-0"
                        style={{ backgroundColor: subj?.color || '#7c3aed' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{log.subject}</p>
                        <p className="text-xs text-gray-500">{formatDisplay(log.date)}{log.note ? ` · ${log.note}` : ''}</p>
                      </div>
                      <span className="text-sm font-bold text-cyan-400 font-display">{log.hours}h</span>
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
