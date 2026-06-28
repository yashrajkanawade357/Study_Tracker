import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { useApp } from '../context/AppContext';
import { supabase } from '../utils/supabaseClient';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  UsersIcon, ClockIcon, BookOpenIcon, CalendarDaysIcon,
  CheckCircleIcon, MoonIcon, MagnifyingGlassIcon, TrashIcon,
  ShieldCheckIcon, ArrowPathIcon, ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon, StarIcon,
} from '@heroicons/react/24/outline';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats`;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ── Fake data for the non-operational PREVIEW (judges / regular users) ──
// Nothing here touches the database; actions are disabled in preview mode.
const FAKE_ADMIN_DATA = {
  totals: { users: 248, studyHours: 5124.5, sessions: 1843, events: 612, tasks: 934, sleepLogs: 408, feedback: 37 },
  users: [
    { id: 'f1', email: 'aarav.sharma@email.com',   name: 'Aarav Sharma',   xp: 4820, level: 49, streak: 64, isAdmin: false, createdAt: '2026-02-11', lastSignInAt: '2026-06-28T07:40:00', hours: 312.5, sessions: 142 },
    { id: 'f2', email: 'priya.nair@email.com',      name: 'Priya Nair',     xp: 3990, level: 40, streak: 41, isAdmin: false, createdAt: '2026-03-02', lastSignInAt: '2026-06-28T06:10:00', hours: 268.0, sessions: 119 },
    { id: 'f3', email: 'rohan.mehta@email.com',     name: 'Rohan Mehta',    xp: 3650, level: 37, streak: 28, isAdmin: false, createdAt: '2026-01-19', lastSignInAt: '2026-06-27T21:30:00', hours: 244.5, sessions: 108 },
    { id: 'f4', email: 'ananya.iyer@email.com',     name: 'Ananya Iyer',    xp: 3120, level: 32, streak: 19, isAdmin: false, createdAt: '2026-04-08', lastSignInAt: '2026-06-28T05:05:00', hours: 201.0, sessions: 95  },
    { id: 'f5', email: 'kabir.singh@email.com',     name: 'Kabir Singh',    xp: 2780, level: 28, streak: 12, isAdmin: false, createdAt: '2026-05-21', lastSignInAt: '2026-06-26T18:45:00', hours: 178.5, sessions: 81  },
    { id: 'f6', email: 'diya.patel@email.com',      name: 'Diya Patel',     xp: 2210, level: 23, streak: 7,  isAdmin: false, createdAt: '2026-05-30', lastSignInAt: '2026-06-28T08:02:00', hours: 142.0, sessions: 66  },
    { id: 'f7', email: 'vivaan.rao@email.com',      name: 'Vivaan Rao',     xp: 1540, level: 16, streak: 3,  isAdmin: false, createdAt: '2026-06-12', lastSignInAt: '2026-06-25T11:20:00', hours: 96.5,  sessions: 44  },
    { id: 'f8', email: 'demo@vyora.app',            name: 'Demo Student',   xp: 1850, level: 19, streak: 32, isAdmin: false, createdAt: '2026-06-28', lastSignInAt: '2026-06-28T09:00:00', hours: 188.0, sessions: 78  },
  ],
  growth: {
    signups: [
      { date: '2026-06-17', signups: 6 }, { date: '2026-06-18', signups: 9 },
      { date: '2026-06-19', signups: 5 }, { date: '2026-06-20', signups: 12 },
      { date: '2026-06-21', signups: 8 }, { date: '2026-06-22', signups: 14 },
      { date: '2026-06-23', signups: 11 }, { date: '2026-06-24', signups: 16 },
      { date: '2026-06-25', signups: 13 }, { date: '2026-06-26', signups: 19 },
      { date: '2026-06-27', signups: 15 }, { date: '2026-06-28', signups: 22 },
    ],
    hours: [
      { date: '2026-06-17', hours: 142 }, { date: '2026-06-18', hours: 168 },
      { date: '2026-06-19', hours: 121 }, { date: '2026-06-20', hours: 205 },
      { date: '2026-06-21', hours: 187 }, { date: '2026-06-22', hours: 224 },
      { date: '2026-06-23', hours: 196 }, { date: '2026-06-24', hours: 241 },
      { date: '2026-06-25', hours: 213 }, { date: '2026-06-26', hours: 268 },
      { date: '2026-06-27', hours: 232 }, { date: '2026-06-28', hours: 154 },
    ],
  },
  recent: {
    signups: [
      { name: 'Ishaan Gupta',  email: 'ishaan.g@email.com',  createdAt: '2026-06-28T08:50:00' },
      { name: 'Sara Khan',     email: 'sara.khan@email.com', createdAt: '2026-06-28T08:12:00' },
      { name: 'Demo Student',  email: 'demo@vyora.app',      createdAt: '2026-06-28T07:30:00' },
      { name: 'Aditya Verma',  email: 'aditya.v@email.com',  createdAt: '2026-06-27T22:05:00' },
      { name: 'Meera Joshi',   email: 'meera.j@email.com',   createdAt: '2026-06-27T19:40:00' },
    ],
    logs: [
      { name: 'Aarav Sharma', subject: 'Mathematics',      hours: 2.5, when: '2026-06-28T08:40:00' },
      { name: 'Priya Nair',   subject: 'Physics',          hours: 1.5, when: '2026-06-28T08:05:00' },
      { name: 'Diya Patel',   subject: 'Computer Science', hours: 3.0, when: '2026-06-28T07:20:00' },
      { name: 'Rohan Mehta',  subject: 'Chemistry',        hours: 2.0, when: '2026-06-27T23:10:00' },
      { name: 'Ananya Iyer',  subject: 'English',          hours: 1.0, when: '2026-06-27T21:35:00' },
      { name: 'Kabir Singh',  subject: 'Mathematics',      hours: 2.5, when: '2026-06-27T20:00:00' },
    ],
  },
  feedback: [
    { id: 'fb1', name: 'Priya Nair',  email: 'priya.nair@email.com', rating: 5, message: 'The streaks keep me coming back every day. Best study app I\'ve used!', created_at: '2026-06-28T08:30:00' },
    { id: 'fb2', name: 'Rohan Mehta', email: 'rohan.mehta@email.com', rating: 4, message: 'Love the analytics heatmap. Would be great to export my data as CSV.', created_at: '2026-06-27T19:15:00' },
    { id: 'fb3', name: '',            email: '',                      rating: 5, message: 'The AI study coach actually helped me plan for finals. Thank you!', created_at: '2026-06-27T12:40:00' },
    { id: 'fb4', name: 'Kabir Singh', email: 'kabir.singh@email.com', rating: 3, message: 'Voice assistant is cool but sometimes mishears subject names.', created_at: '2026-06-26T21:05:00' },
    { id: 'fb5', name: 'Ananya Iyer', email: 'ananya.iyer@email.com', rating: 5, message: 'Clean UI, fast, and motivating. Please add a light theme!', created_at: '2026-06-26T09:20:00' },
  ],
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtAgo = (d) => {
  if (!d) return '—';
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <GlassCard className="p-5">
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-white leading-none">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </div>
  </GlassCard>
);

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs">
      <p className="text-gray-300 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-semibold" style={{ color: p.color }}>
          {p.value} {p.dataKey}
        </p>
      ))}
    </div>
  );
};

const Admin = ({ preview = false }) => {
  const { userProfile, addToast } = useApp();
  const [data, setData] = useState(preview ? FAKE_ADMIN_DATA : null);
  const [loading, setLoading] = useState(!preview);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // user obj

  const callFn = useCallback(async (body) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error('Your session expired — please sign in again.');
    const res = await fetch(FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(out.error || `Request failed (${res.status})`);
    return out;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await callFn({ action: 'stats' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [callFn]);

  useEffect(() => { if (!preview) load(); }, [load, preview]);

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    const q = search.trim().toLowerCase();
    const rows = q
      ? data.users.filter(
          (u) => u.email.toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q),
        )
      : data.users;
    return [...rows].sort((a, b) => b.hours - a.hours);
  }, [data, search]);

  const toggleAdmin = async (u) => {
    if (preview) { addToast('🔒 Actions are disabled in preview mode.', 'info'); return; }
    setBusyId(u.id);
    try {
      await callFn({ action: 'set_admin', userId: u.id, value: !u.isAdmin });
      setData((d) => ({
        ...d,
        users: d.users.map((x) => (x.id === u.id ? { ...x, isAdmin: !u.isAdmin } : x)),
      }));
      addToast(`${u.name} is ${!u.isAdmin ? 'now an admin' : 'no longer an admin'}.`, 'success');
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const deleteUser = async (u) => {
    if (preview) { addToast('🔒 Actions are disabled in preview mode.', 'info'); setConfirmDelete(null); return; }
    setBusyId(u.id);
    try {
      await callFn({ action: 'delete_user', userId: u.id });
      setData((d) => ({
        ...d,
        users: d.users.filter((x) => x.id !== u.id),
        totals: { ...d.totals, users: Math.max(0, d.totals.users - 1) },
      }));
      addToast(`Deleted ${u.email} and all their data.`, 'success');
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  const t = data?.totals;

  return (
    <Layout title="Admin Portal">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2 flex-wrap">
              <ShieldCheckIcon className="w-7 h-7 text-purple-400" />
              Admin Portal
              {preview && (
                <span className="text-[11px] uppercase tracking-wide bg-amber-500/20 text-amber-300 px-2 py-1 rounded-full">
                  Preview · sample data
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {preview
                ? 'A read-only look at the admin dashboard. Data is illustrative; actions are disabled.'
                : <>Platform overview & user management · signed in as {userProfile?.email}</>}
            </p>
          </div>
          {!preview && (
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-700 hover:bg-navy-600 text-sm text-gray-200 transition-all disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        {error && (
          <GlassCard className="p-4 border border-red-500/30">
            <div className="flex items-center gap-3 text-red-300 text-sm">
              <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </GlassCard>
        )}

        {loading && !data ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : data ? (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard icon={UsersIcon} label="Total users" value={t.users} accent="bg-purple-600/20 text-purple-300" />
              <StatCard icon={ClockIcon} label="Study hours" value={t.studyHours} accent="bg-cyan-600/20 text-cyan-300" />
              <StatCard icon={BookOpenIcon} label="Study sessions" value={t.sessions} accent="bg-emerald-600/20 text-emerald-300" />
              <StatCard icon={CalendarDaysIcon} label="Calendar events" value={t.events} accent="bg-amber-600/20 text-amber-300" />
              <StatCard icon={CheckCircleIcon} label="Tasks" value={t.tasks} accent="bg-pink-600/20 text-pink-300" />
              <StatCard icon={MoonIcon} label="Sleep logs" value={t.sleepLogs} accent="bg-indigo-600/20 text-indigo-300" />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              <GlassCard className="p-5">
                <p className="text-sm font-semibold text-gray-200 mb-4">User signups</p>
                {data.growth.signups.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data.growth.signups}>
                      <defs>
                        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.5} />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" tick={{ fill: '#9aa3b2', fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fill: '#9aa3b2', fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="signups" stroke="#7c3aed" strokeWidth={2} fill="url(#sg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-500 py-12 text-center">No signup data yet.</p>
                )}
              </GlassCard>

              <GlassCard className="p-5">
                <p className="text-sm font-semibold text-gray-200 mb-4">Study hours logged (per day)</p>
                {data.growth.hours.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.growth.hours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis dataKey="date" tick={{ fill: '#9aa3b2', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#9aa3b2', fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="hours" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-500 py-12 text-center">No study hours logged yet.</p>
                )}
              </GlassCard>
            </div>

            {/* User table */}
            <GlassCard className="p-5">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <p className="text-sm font-semibold text-gray-200">
                  Users <span className="text-gray-500">({filteredUsers.length})</span>
                </p>
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name or email…"
                    className="pl-9 pr-3 py-2 rounded-xl bg-navy-700 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-purple-500 w-64 max-w-full"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-700/40">
                      <th className="py-2 pr-4 font-medium">User</th>
                      <th className="py-2 px-4 font-medium">Hours</th>
                      <th className="py-2 px-4 font-medium">Sessions</th>
                      <th className="py-2 px-4 font-medium">Streak</th>
                      <th className="py-2 px-4 font-medium">Level</th>
                      <th className="py-2 px-4 font-medium">Joined</th>
                      <th className="py-2 px-4 font-medium">Last seen</th>
                      <th className="py-2 pl-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-gray-700/20 hover:bg-navy-700/30">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-white font-medium flex items-center gap-1.5">
                                {u.name}
                                {u.isAdmin && (
                                  <span className="text-[10px] uppercase tracking-wide bg-purple-600/30 text-purple-300 px-1.5 py-0.5 rounded">
                                    Admin
                                  </span>
                                )}
                              </p>
                              <p className="text-gray-500 text-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-cyan-300 font-semibold">{u.hours}</td>
                        <td className="py-3 px-4 text-gray-300">{u.sessions}</td>
                        <td className="py-3 px-4 text-orange-300">{u.streak}🔥</td>
                        <td className="py-3 px-4 text-gray-300">{u.level}</td>
                        <td className="py-3 px-4 text-gray-400">{fmtDate(u.createdAt)}</td>
                        <td className="py-3 px-4 text-gray-400">{fmtAgo(u.lastSignInAt)}</td>
                        <td className="py-3 pl-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => toggleAdmin(u)}
                              disabled={busyId === u.id}
                              title={u.isAdmin ? 'Revoke admin' : 'Make admin'}
                              className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${
                                u.isAdmin
                                  ? 'text-purple-300 bg-purple-600/20 hover:bg-purple-600/30'
                                  : 'text-gray-400 hover:text-purple-300 hover:bg-navy-600'
                              }`}
                            >
                              <ShieldCheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setConfirmDelete(u)}
                              disabled={busyId === u.id}
                              title="Delete user"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all disabled:opacity-40"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500 text-sm">
                          No users match “{search}”.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Recent activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <GlassCard className="p-5">
                <p className="text-sm font-semibold text-gray-200 mb-4">Newest signups</p>
                <div className="space-y-3">
                  {data.recent.signups.length ? data.recent.signups.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-white">{s.name}</p>
                        <p className="text-gray-500 text-xs">{s.email}</p>
                      </div>
                      <span className="text-gray-400 text-xs">{fmtAgo(s.createdAt)}</span>
                    </div>
                  )) : <p className="text-xs text-gray-500">No signups yet.</p>}
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <p className="text-sm font-semibold text-gray-200 mb-4">Recent study logs</p>
                <div className="space-y-3">
                  {data.recent.logs.length ? data.recent.logs.map((l, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-white">{l.name} · <span className="text-cyan-300">{l.subject}</span></p>
                        <p className="text-gray-500 text-xs">{l.hours}h logged</p>
                      </div>
                      <span className="text-gray-400 text-xs">{fmtAgo(l.when)}</span>
                    </div>
                  )) : <p className="text-xs text-gray-500">No study logs yet.</p>}
                </div>
              </GlassCard>
            </div>

            {/* Recent feedback */}
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
                <p className="text-sm font-semibold text-gray-200">
                  Recent feedback
                  {data.totals?.feedback != null && (
                    <span className="text-gray-500 font-normal"> · {data.totals.feedback} total</span>
                  )}
                </p>
              </div>
              {data.feedback?.length ? (
                <div className="space-y-3">
                  {data.feedback.map((f, i) => (
                    <div key={f.id || i} className="rounded-2xl p-4"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">
                            {f.name?.trim() || 'Anonymous'}
                          </p>
                          {f.email && <p className="text-xs text-gray-500 truncate">{f.email}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {f.rating ? (
                            <span className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <StarIcon key={n} className="w-3.5 h-3.5"
                                  style={{ color: n <= f.rating ? '#fbbf24' : 'rgba(255,255,255,0.18)', fill: n <= f.rating ? '#fbbf24' : 'transparent' }} />
                              ))}
                            </span>
                          ) : null}
                          <span className="text-xs text-gray-400 whitespace-nowrap">{fmtAgo(f.created_at)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">{f.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No feedback submitted yet.</p>
              )}
            </GlassCard>
          </>
        ) : null}
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-sm w-full"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-900/30 text-red-400 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Delete user?</h3>
            </div>
            <p className="text-sm text-gray-400 mb-1">
              This permanently deletes <span className="text-white font-medium">{confirmDelete.email}</span> and
              all of their study data. This cannot be undone.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-xl bg-navy-700 hover:bg-navy-600 text-sm text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser(confirmDelete)}
                disabled={busyId === confirmDelete.id}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-sm text-white font-medium disabled:opacity-50"
              >
                {busyId === confirmDelete.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default Admin;
