import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AppSwitcher from './AppSwitcher';
import VoiceAssistant from './VoiceAssistant';
import { ArrowRightOnRectangleIcon, CalendarDaysIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const CAL_NAV = [
  { to: '/calendar', label: 'Calendar', icon: CalendarDaysIcon },
  { to: '/tasks', label: 'Tasks', icon: CheckCircleIcon },
];

export const EVENT_CATEGORIES = [
  { id: 'general', label: 'General', color: '#7c3aed' },
  { id: 'study', label: 'Study', color: '#06b6d4' },
  { id: 'work', label: 'Work', color: '#f59e0b' },
  { id: 'personal', label: 'Personal', color: '#10b981' },
  { id: 'health', label: 'Health', color: '#ec4899' },
  { id: 'exam', label: 'Exam', color: '#ef4444' },
];

export const categoryColor = (id) =>
  (EVENT_CATEGORIES.find(c => c.id === id) || EVENT_CATEGORIES[0]).color;

const CalendarLayout = ({ children }) => {
  const { userProfile, logout } = useApp();
  const navigate = useNavigate();
  const avatar = userProfile?.avatar || '🎓';
  const isImage = avatar.startsWith('http') || avatar.startsWith('data:');

  const handleLogout = async () => { await logout(); navigate('/auth'); };

  return (
    <div className="flex h-screen overflow-hidden bg-navy-950">
      {/* Sidebar */}
      <aside className="w-64 h-screen flex-col flex-shrink-0 hidden md:flex border-r border-cyan-700/20 z-40 bg-navy-950">
        {/* Logo */}
        <div className="p-6 border-b border-cyan-700/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Vyora" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-display font-bold text-white text-lg leading-tight">Vyora</h1>
              <p className="text-xs text-cyan-400">Smart Calendar</p>
            </div>
          </div>
        </div>

        {/* App Switcher */}
        <div className="px-4 pt-4">
          <AppSwitcher current="calendar" />
        </div>

        {/* Nav */}
        <nav className="px-4 pt-4 flex flex-col gap-1">
          {CAL_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30' : 'text-gray-400 hover:text-white hover:bg-navy-700/40'
                }`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Category legend */}
        <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1 mt-2">Categories</p>
          <div className="flex flex-col gap-1.5">
            {EVENT_CATEGORIES.map(c => (
              <div key={c.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <span className="text-sm text-gray-300">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User */}
        <div className="p-4 border-t border-cyan-700/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-purple-700 flex items-center justify-center text-sm font-bold font-display overflow-hidden">
              {isImage ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userProfile?.name || 'Study Pro'}</p>
              <p className="text-xs text-gray-500 truncate">{userProfile?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors" title="Logout">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        {/* Mobile top bar with switcher */}
        <div className="md:hidden p-3 border-b border-cyan-700/20 bg-navy-950">
          <AppSwitcher current="calendar" />
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* AI voice assistant — available across the Smart Calendar app */}
      <VoiceAssistant />
    </div>
  );
};

export default CalendarLayout;
