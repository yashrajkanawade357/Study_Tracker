import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { BellIcon, FireIcon, ArrowRightOnRectangleIcon, Cog6ToothIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ title, onMenuClick }) => {
  const { userProfile, exams, logout } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const streak = userProfile?.streak || 0;
  const initials = (userProfile?.name || 'SP').slice(0, 2).toUpperCase();

  const upcomingExams = exams
    .filter(e => {
      const days = Math.ceil((new Date(e.date) - new Date()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 7;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleLogout = async () => {
    setShowProfile(false);
    await logout();
    navigate('/auth');
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-purple-700/15 bg-navy-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden text-gray-400 hover:text-white transition-colors">
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-lg font-display font-bold text-white">{title}</h2>
          <p className="text-xs text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5 glass-card px-3 py-1.5 text-sm">
          <FireIcon className="w-4 h-4 text-orange-400" />
          <span className="font-bold text-orange-400 font-display">{streak}</span>
          <span className="text-gray-400 text-xs">day streak</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
            className="relative w-9 h-9 rounded-xl bg-navy-700 hover:bg-navy-600 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <BellIcon className="w-5 h-5" />
            {upcomingExams.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full text-xs font-bold flex items-center justify-center">
                {upcomingExams.length}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-72 glass-card p-4 z-50"
                onMouseLeave={() => setShowNotifs(false)}
              >
                <p className="text-sm font-semibold text-gray-300 mb-3">📅 Upcoming Exams</p>
                {upcomingExams.length === 0 ? (
                  <p className="text-xs text-gray-500">No exams within 7 days</p>
                ) : (
                  upcomingExams.map(exam => {
                    const days = Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={exam.id} className="flex items-center justify-between py-2 border-b border-gray-700/30 last:border-0">
                        <span className="text-sm text-white">{exam.name}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${days <= 2 ? 'bg-red-900/50 text-red-400' : days <= 5 ? 'bg-amber-900/50 text-amber-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                          {days === 0 ? 'Today!' : `${days}d`}
                        </span>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-sm font-bold font-display hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            {initials}
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-64 glass-card p-4 z-50"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-700/40">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-sm font-bold font-display flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{userProfile?.name || 'Study Pro'}</p>
                    <p className="text-xs text-gray-400 truncate">{userProfile?.email || ''}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-700/40">
                  <div className="text-center">
                    <p className="text-base font-bold text-purple-400 font-display">{userProfile?.level || 1}</p>
                    <p className="text-xs text-gray-500">Level</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-cyan-400 font-display">{userProfile?.xp || 0}</p>
                    <p className="text-xs text-gray-500">XP</p>
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-orange-400 font-display">{streak}</p>
                    <p className="text-xs text-gray-500">Streak</p>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => { setShowProfile(false); navigate('/settings'); }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-navy-700/60 transition-all text-sm w-full text-left"
                  >
                    <Cog6ToothIcon className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all text-sm w-full text-left"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
