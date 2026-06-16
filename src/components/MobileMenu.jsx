import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  SparklesIcon, TrophyIcon, Cog6ToothIcon, BookOpenIcon, ArrowRightOnRectangleIcon, XMarkIcon
} from '@heroicons/react/24/outline';

const MobileMenu = ({ isOpen, onClose }) => {
  const { userProfile, logout, currentXp } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/auth');
  };

  const navItems = [
    { path: '/ai', label: 'AI Coach', icon: SparklesIcon },
    { path: '/achievements', label: 'Achievements', icon: TrophyIcon },
    { path: '/settings', label: 'Settings', icon: Cog6ToothIcon },
    { path: '/manual', label: 'User Manual', icon: BookOpenIcon },
  ];

  const xp = currentXp;
  const level = Math.floor(xp / 100) + 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-purple-700/30 rounded-t-3xl z-50 p-6 md:hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-display font-bold text-white">More Options</h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors bg-navy-800 rounded-full">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Profile Summary */}
            <div className="flex items-center gap-4 mb-6 p-4 glass-card rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-xl overflow-hidden">
                {userProfile?.avatar?.startsWith('http') || userProfile?.avatar?.startsWith('data:') 
                  ? <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover" /> 
                  : userProfile?.avatar || '🎓'}
              </div>
              <div>
                <p className="font-bold text-white">{userProfile?.name || 'Student'}</p>
                <p className="text-xs text-purple-400 font-semibold">Level {level} • {xp} XP</p>
              </div>
            </div>

            {/* Menu Links */}
            <div className="flex flex-col gap-2 mb-6">
              {navItems.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isActive ? 'bg-purple-600/20 text-white border border-purple-600/30' : 'text-gray-400 hover:bg-navy-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-6 h-6" />
                  <span className="font-medium text-base">{label}</span>
                </NavLink>
              ))}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 w-full rounded-xl text-red-400 hover:bg-red-900/20 transition-all font-medium text-base"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
              <span>Sign Out</span>
            </button>
            
            {/* Safe area padding for bottom nav space since it's an overlay it should pad the bottom so not to be cut off by phone bezels */}
            <div className="h-6"></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
