import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from './Layout';
import GlassCard from './GlassCard';
import Admin from '../pages/Admin';
import { LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

// ── Shared password for the admin PREVIEW ──────────────────────────
// Give this to anyone (e.g. hackathon judges) who should be able to
// open the non-operational admin preview. It's only a soft gate — the
// preview shows fake data and can't change anything, so it's safe that
// this lives in the client. (TEMPORARY: remove this gate later.)
const ADMIN_PREVIEW_PASSWORD = 'VyoraAdmin2026';

const AdminGate = () => {
  const { isAdmin } = useApp();
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  // Real admins (you) get the live, operational portal — no gate.
  if (isAdmin) return <Admin />;

  // Everyone else: unlock with the shared password to see the preview.
  if (unlocked) return <Admin preview />;

  const submit = (e) => {
    e.preventDefault();
    if (value.trim() === ADMIN_PREVIEW_PASSWORD) {
      setUnlocked(true);
    } else {
      setError('Incorrect password. Ask the Vyora team for access.');
    }
  };

  return (
    <Layout title="Admin Portal">
      <div className="max-w-md mx-auto mt-10">
        <GlassCard className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-300 flex items-center justify-center mx-auto mb-5">
            <LockClosedIcon className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold font-display text-white flex items-center justify-center gap-2">
            <ShieldCheckIcon className="w-5 h-5 text-purple-400" />
            Admin Portal
          </h1>
          <p className="text-sm text-gray-400 mt-2 mb-6">
            This area is restricted. Enter the access password to view the
            admin dashboard. <span className="text-gray-500">(Judges: ask the team for the password.)</span>
          </p>

          <form onSubmit={submit} className="space-y-3">
            <input
              type="password"
              autoFocus
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(''); }}
              placeholder="Access password"
              className="w-full px-4 py-3 rounded-xl bg-navy-700 text-white text-sm text-center placeholder-gray-500 outline-none focus:ring-1 focus:ring-purple-500"
            />
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs">
                {error}
              </motion.p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}
            >
              Unlock dashboard
            </button>
          </form>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default AdminGate;
