import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import AppSwitcher from './AppSwitcher';
import {
  HomeIcon, ChartBarIcon, SparklesIcon, CalendarDaysIcon,
  TrophyIcon, ClockIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, BookOpenIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { path: '/analytics', label: 'Analytics', icon: ChartBarIcon },
  { path: '/ai', label: 'AI Coach', icon: SparklesIcon },
  { path: '/timetable', label: 'Timetable', icon: CalendarDaysIcon },
  { path: '/achievements', label: 'Achievements', icon: TrophyIcon },
  { path: '/pomodoro', label: 'Pomodoro', icon: ClockIcon },
  { path: '/settings', label: 'Settings', icon: Cog6ToothIcon },
  { path: '/manual', label: 'User Manual', icon: BookOpenIcon },
];

const Sidebar = () => {
  const { userProfile, logout, currentXp, isAdmin } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const xp = currentXp;
  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const avatar = userProfile?.avatar || '🎓';
  const isImage = avatar.startsWith('http') || avatar.startsWith('data:');

  return (
    <div className="sidebar w-64 h-screen flex-col flex-shrink-0 hidden md:flex border-r border-purple-700/20 z-40 bg-navy-950">
      {/* Logo */}
      <div className="p-6 border-b border-purple-700/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Vyora Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-tight">Vyora</h1>
            <p className="text-xs text-cyan-400">Pro Edition</p>
          </div>
        </div>
      </div>

      {/* App Switcher */}
      <div className="px-4 pt-4">
        <AppSwitcher current="tracker" />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" />
            <span>Admin</span>
          </NavLink>
        )}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-purple-700/20">
        {/* XP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span className="font-display font-semibold text-purple-400">Level {level}</span>
            <span>{xp} XP</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-sm font-bold font-display overflow-hidden">
            {isImage ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{userProfile?.name || 'Study Pro'}</p>
            <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
