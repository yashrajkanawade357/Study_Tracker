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
} from '@heroicons/react/24/outline';

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats`;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

const Admin = () => {
  const { userProfile, addToast } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => { load(); }, [load]);

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
            <h1 className="text-2xl font-bold font-display text-white flex items-center gap-2">
              <ShieldCheckIcon className="w-7 h-7 text-purple-400" />
              Admin Portal
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Platform overview & user management · signed in as {userProfile?.email}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-700 hover:bg-navy-600 text-sm text-gray-200 transition-all disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
