import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

const typeStyles = {
  success: 'border-emerald-500/50 bg-emerald-900/40 text-emerald-300',
  error: 'border-red-500/50 bg-red-900/40 text-red-300',
  warning: 'border-amber-500/50 bg-amber-900/40 text-amber-300',
  info: 'border-purple-500/50 bg-purple-900/40 text-purple-300',
};

const typeIcons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

const Toast = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`glass-card p-4 flex items-start gap-3 border ${typeStyles[toast.type] || typeStyles.info}`}
          >
            <span className="text-lg">{typeIcons[toast.type] || 'ℹ️'}</span>
            <p className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition-colors mt-0.5"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
