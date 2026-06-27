import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import GlassCard from './GlassCard';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { buildSnapshot, diffSnapshots, formatWeekLabel } from '../utils/weeklyCheckin';
import { callAI } from '../utils/claude';
import { getAvailableProvider } from '../utils/claude';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, CheckBadgeIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Delta = ({ value, unit = 'h', invertGood = false }) => {
  if (Math.abs(value) < 0.1) return <span className="text-gray-500">±0{unit}</span>;
  const good = invertGood ? value < 0 : value > 0;
  const Icon = value > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  return (
    <span className={`inline-flex items-center gap-0.5 font-semibold ${good ? 'text-emerald-400' : 'text-red-400'}`}>
      <Icon className="w-3.5 h-3.5" />{value > 0 ? '+' : ''}{value}{unit}
    </span>
  );
};

const WeeklyCheckin = () => {
  const { studyLogs, subjects, sleepLogs, currentStreak, currentXp, addToast } = useApp();
  const hasKey = !!getAvailableProvider();

  const [checkins, setCheckins] = useState(() => storage.get(STORAGE_KEYS.WEEKLY_CHECKINS, []));
  const [reflection, setReflection] = useState('');
  const [reflecting, setReflecting] = useState(false);

  const current = useMemo(
    () => buildSnapshot({ studyLogs, subjects, sleepLogs, streak: currentStreak, xp: currentXp }),
    [studyLogs, subjects, sleepLogs, currentStreak, currentXp]
  );

  const sorted = useMemo(() => [...checkins].sort((a, b) => b.weekStart.localeCompare(a.weekStart)), [checkins]);
  const lastSaved = useMemo(() => sorted.find((c) => c.weekStart < current.weekStart), [sorted, current.weekStart]);
  const diff = useMemo(() => diffSnapshots(current, lastSaved), [current, lastSaved]);
  const savedThisWeek = sorted.some((c) => c.weekStart === current.weekStart);

  const persist = (next) => { setCheckins(next); storage.set(STORAGE_KEYS.WEEKLY_CHECKINS, next); };

  const save = () => {
    const snap = { ...current, takenAt: new Date().toISOString() };
    const next = [...checkins.filter((c) => c.weekStart !== snap.weekStart), snap];
    persist(next);
    addToast('✅ Weekly check-in saved', 'success');
  };

  const reflect = async () => {
    setReflecting(true);
    setReflection('');
    try {
      const sys = 'You are an encouraging study coach. In 2-3 short sentences, reflect on the student\'s week-over-week progress. Be specific, warm, and end with one concrete suggestion. Plain text only.';
      const msg = `This week: ${JSON.stringify(current)}. Previous check-in: ${JSON.stringify(lastSaved || 'none')}. Changes: ${JSON.stringify(diff || 'no prior data')}.`;
      const res = await callAI([{ role: 'user', content: msg }], sys);
      setReflection(res.trim());
    } catch (err) {
      addToast(`AI Error: ${err.message}`, 'error');
    } finally {
      setReflecting(false);
    }
  };

  return (
    <GlassCard className="p-6 mb-6 border-l-4 border-l-emerald-500">
      <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
        <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
          <CheckBadgeIcon className="w-6 h-6 text-emerald-400" /> Weekly Check-in
        </h3>
        <button onClick={save} className="btn-primary text-sm">
          {savedThisWeek ? 'Update this week' : 'Save this week'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-5">Snapshot your week ({formatWeekLabel(current.weekStart)}) and watch your progress build over time.</p>

      {/* This week stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Hours', val: `${current.totalHours}h`, d: diff && <Delta value={diff.totalDelta} /> },
          { label: 'Sessions', val: current.sessions, d: diff && <Delta value={diff.sessionsDelta} unit="" /> },
          { label: 'Streak', val: `${current.streak}d`, d: diff && <Delta value={diff.streakDelta} unit="d" /> },
          { label: 'Avg sleep', val: current.avgSleep ? `${current.avgSleep}h` : '—', d: diff && current.avgSleep ? <Delta value={diff.sleepDelta} /> : null },
        ].map((s) => (
          <div key={s.label} className="bg-navy-800/40 rounded-xl p-3 border border-gray-700/40">
            <p className="text-lg font-display font-bold text-white">{s.val}</p>
            <p className="text-[11px] text-gray-500">{s.label}</p>
            {s.d && <p className="text-[11px] mt-0.5">{s.d} <span className="text-gray-600">vs last</span></p>}
          </div>
        ))}
      </div>

      {/* Subject movements */}
      {diff && diff.subjectDeltas.length > 0 && (
        <div className="mb-5">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Since your last check-in</p>
          <div className="flex flex-wrap gap-2">
            {diff.subjectDeltas.slice(0, 6).map((s) => (
              <span key={s.name} className="text-xs px-2.5 py-1 rounded-lg bg-navy-800/60 border border-gray-700/40 text-gray-300">
                {s.name} <Delta value={s.delta} />
              </span>
            ))}
          </div>
        </div>
      )}

      {!lastSaved && (
        <p className="text-xs text-gray-500 mb-4">💡 Save your first check-in now, then come back next week to see your progress compared.</p>
      )}

      {/* AI reflection */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={reflect} disabled={!hasKey || reflecting} className="btn-cyan text-sm flex items-center gap-1.5 disabled:opacity-50">
          {reflecting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Reflecting…</> : <><SparklesIcon className="w-4 h-4" /> AI reflection</>}
        </button>
        {!hasKey && <span className="text-xs text-gray-500">Add an AI key in Settings</span>}
      </div>
      {reflection && (
        <div className="rounded-xl bg-navy-800/50 border border-cyan-700/20 p-3.5 text-sm text-gray-200 leading-relaxed">{reflection}</div>
      )}

      {/* History */}
      {sorted.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-700/40">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">History</p>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto no-scrollbar">
            {sorted.map((c) => (
              <div key={c.weekStart} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-navy-800/30">
                <span className="text-gray-400">{formatWeekLabel(c.weekStart)}</span>
                <span className="text-white font-semibold">{c.totalHours}h · {c.sessions} sessions</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

export default WeeklyCheckin;
