import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import AnimatedCounter from '../components/AnimatedCounter';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
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
            <h3 className="font-display font-bold text-white mb-4">📊 Weekly Study Hours</h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
                  <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="hours" fill="url(#purpleGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#4c1d95" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
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
