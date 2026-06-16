import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon, ChartBarIcon, CalendarDaysIcon, ClockIcon, EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import MobileMenu from './MobileMenu';

const BottomNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: HomeIcon },
    { path: '/analytics', label: 'Stats', icon: ChartBarIcon },
    { path: '/timetable', label: 'Plan', icon: CalendarDaysIcon },
    { path: '/pomodoro', label: 'Focus', icon: ClockIcon },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-navy-900/90 backdrop-blur-lg border-t border-purple-700/20 z-50 flex items-center justify-around px-2 pb-safe">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full text-xs transition-colors ${
                isActive ? 'text-purple-400 font-semibold' : 'text-gray-500 hover:text-gray-300'
              }`
            }
          >
            <Icon className="w-6 h-6 mb-1" />
            <span>{label}</span>
          </NavLink>
        ))}
        
        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <EllipsisHorizontalIcon className="w-6 h-6 mb-1" />
          <span>More</span>
        </button>
      </div>

      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default BottomNav;
