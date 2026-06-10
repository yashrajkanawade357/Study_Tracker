import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getLast7Days, getLast30Days, formatDate, formatDisplay, aggregateHoursByDay } from '../utils/dateUtils';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const HeatmapCalendar = ({ studyLogs }) => {
  const days = getLast30Days();
  const logMap = useMemo(() => {
    const map = {};
    studyLogs.forEach(l => {
      map[l.date] = (map[l.date] || 0) + l.hours;
    });
    return map;
  }, [studyLogs]);

  const maxHours = Math.max(...Object.values(logMap), 4);

  const getColor = (hours) => {
    if (!hours) return 'rgba(255,255,255,0.04)';
    const intensity = Math.min(hours / maxHours, 1);
    if (intensity < 0.25) return 'rgba(124,58,237,0.25)';
    if (intensity < 0.5) return 'rgba(124,58,237,0.5)';
    if (intensity < 0.75) return 'rgba(124,58,237,0.75)';
    return 'rgba(124,58,237,1)';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {days.map(day => {
          const ds = formatDate(day);
          const hours = logMap[ds] || 0;
          return (
            <div
              key={ds}
              title={`${formatDisplay(day)}: ${hours.toFixed(1)}h`}
              className="heatmap-cell"
              style={{
                backgroundColor: getColor(hours),
                paddingBottom: '100%',
                borderRadius: '4px',
                position: 'relative',
              }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
        <span>Less</span>
        {[0.04, 0.25, 0.5, 0.75, 1].map(opacity => (
          <div key={opacity} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(124,58,237,${opacity})` }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card p-3 text-xs">
        <p className="font-bold text-white mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color || p.fill }}>{p.name}: {Number(p.value).toFixed(1)}h</p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const { studyLogs, subjects, sleepLogs, addSleepLog, addToast } = useApp();
  const [view, setView] = useState('weekly');
  const [sleepDate, setSleepDate] = useState(formatDate(new Date()));
  const [sleepHrs, setSleepHrs] = useState('');
  const [breakHrs, setBreakHrs] = useState('');

  const days = view === 'weekly' ? getLast7Days() : getLast30Days();
  const chartData = useMemo(() => aggregateHoursByDay(studyLogs, days), [studyLogs, days]);

  // Line chart data (total per day)
  const lineData = chartData.map(d => ({
    label: d.label,
    total: d.hours,
    ...subjects.reduce((acc, s) => ({ ...acc, [s.name]: d[s.name] || 0 }), {}),
  }));

  // Sleep vs Study
  const sleepStudyData = useMemo(() => {
    return getLast7Days().map(day => {
      const ds = formatDate(day);
      const studyH = studyLogs.filter(l => l.date === ds).reduce((s, l) => s + l.hours, 0);
      const sleepLog = sleepLogs.find(l => l.date === ds);
      return {
        label: formatDisplay(day),
        study: parseFloat(studyH.toFixed(1)),
        sleep: sleepLog?.sleepHours || 0,
        break: sleepLog?.breakHours || 0,
      };
    });
  }, [studyLogs, sleepLogs]);

  // Goal progress
  const goalProgress = useMemo(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    return subjects.map(s => {
      const actual = studyLogs
        .filter(l => l.subject === s.name && new Date(l.date) >= weekStart)
        .reduce((sum, l) => sum + l.hours, 0);
      const goal = s.weeklyGoal || s.weekly_goal || 0;
      const pct = goal > 0 ? Math.min((actual / goal) * 100, 100) : 0;
      const status = pct >= 80 ? 'green' : pct >= 50 ? 'amber' : 'red';
      return { ...s, actual: parseFloat(actual.toFixed(1)), goal, pct, status };
    });
  }, [subjects, studyLogs]);

  // Warning check
  const warnings = useMemo(() => {
    return getLast7Days().map(day => {
      const ds = formatDate(day);
      const studyH = studyLogs.filter(l => l.date === ds).reduce((s, l) => s + l.hours, 0);
      const sleepLog = sleepLogs.find(l => l.date === ds);
      if (studyH > 8 && sleepLog && sleepLog.sleepHours < 6) {
        return { date: formatDisplay(day), studyH, sleepH: sleepLog.sleepHours };
      }
      return null;
    }).filter(Boolean);
  }, [studyLogs, sleepLogs]);

  const handleLogSleep = () => {
    if (!sleepHrs) { addToast('Enter sleep hours', 'warning'); return; }
    addSleepLog({ date: sleepDate, sleepHours: parseFloat(sleepHrs), breakHours: parseFloat(breakHrs) || 0 });
    addToast('✅ Sleep data logged!', 'success');
    setSleepHrs('');
    setBreakHrs('');
  };

  const statusColors = {
    green: { bar: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500' },
    amber: { bar: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500' },
    red: { bar: '#ef4444', text: 'text-red-400', bg: 'bg-red-500' },
  };

  return (
    <Layout title="Analytics">
      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        {['weekly', 'monthly'].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold font-display transition-all duration-200 capitalize ${
              view === v ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            {v === 'weekly' ? '📅 Weekly' : '📆 Monthly'}
          </button>
        ))}
      </div>

      {/* Warning Banner */}
      {warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl border border-amber-500/40 bg-amber-900/20 flex items-start gap-3"
        >
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400">⚠️ Study-Sleep Imbalance Detected</p>
            {warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-300/70 mt-1">
                {w.date}: {w.studyH}h study + only {w.sleepH}h sleep — rest more!
              </p>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line Chart */}
        <GlassCard className="p-5">
          <h3 className="font-display font-bold text-white mb-4">📈 Study Hours Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
              {subjects.slice(0, 5).map((s, i) => (
                <Line
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={s.color || COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Stacked Bar Chart */}
        <GlassCard className="p-5">
          <h3 className="font-display font-bold text-white mb-4">📊 Stacked Subject Hours</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={lineData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
              {subjects.slice(0, 5).map((s, i) => (
                <Bar key={s.name} dataKey={s.name} stackId="a" fill={s.color || COLORS[i]} radius={i === 0 ? [0, 0, 4, 4] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Heatmap */}
      <GlassCard className="p-5 mb-6">
        <h3 className="font-display font-bold text-white mb-4">🔥 Study Heatmap (Last 30 Days)</h3>
        <HeatmapCalendar studyLogs={studyLogs} />
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sleep Logger */}
        <GlassCard className="p-5">
          <h3 className="font-display font-bold text-white mb-4">😴 Sleep & Break Tracker</h3>

          {/* Log Form */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <input type="date" className="input-field text-sm" value={sleepDate} onChange={e => setSleepDate(e.target.value)} />
            <input type="number" className="input-field text-sm" placeholder="Sleep hrs" value={sleepHrs} onChange={e => setSleepHrs(e.target.value)} min="0" max="24" step="0.5" />
            <input type="number" className="input-field text-sm" placeholder="Break hrs" value={breakHrs} onChange={e => setBreakHrs(e.target.value)} min="0" max="12" step="0.5" />
          </div>
          <button onClick={handleLogSleep} className="btn-secondary w-full mb-4 text-sm">📝 Log Sleep</button>

          {/* Sleep vs Study Chart */}
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={sleepStudyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
              <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }} />
              <Line type="monotone" dataKey="study" stroke="#7c3aed" strokeWidth={2} dot={false} name="Study" />
              <Line type="monotone" dataKey="sleep" stroke="#06b6d4" strokeWidth={2} dot={false} name="Sleep" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Goal Progress */}
        <GlassCard className="p-5">
          <h3 className="font-display font-bold text-white mb-4">🎯 Weekly Goal Progress</h3>
          {goalProgress.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Add subjects in Settings to track goals</p>
          ) : (
            <div className="flex flex-col gap-4">
              {goalProgress.map(s => {
                const c = statusColors[s.status];
                return (
                  <div key={s.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-sm font-semibold text-white">{s.name}</span>
                      </div>
                      <span className={`text-xs font-bold ${c.text}`}>
                        {s.actual}h / {s.goal}h ({s.pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        className={`progress-fill ${c.bg}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </Layout>
  );
};

export default Analytics;
