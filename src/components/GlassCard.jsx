import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', variant = 'purple', hover = false, onClick, style }) => {
  const baseClass = variant === 'cyan' ? 'glass-card-cyan' : 'glass-card';
  const hoverClass = hover ? 'cursor-pointer hover:border-purple-500/40 hover:shadow-glow-purple transition-all duration-300' : '';
  
  if (hover || onClick) {
    return (
      <motion.div
        className={`${baseClass} ${hoverClass} ${className}`}
        whileHover={{ y: -2, scale: 1.01 }}
        onClick={onClick}
        style={style}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseClass} ${className}`} style={style}>
      {children}
    </div>
  );
};

export default GlassCard;
