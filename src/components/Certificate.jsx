import React from 'react';
import { formatFull } from '../utils/dateUtils';

const Certificate = React.forwardRef(({ user, badge, achievement, stats }, ref) => {
  if (!badge || !user) return null;

  return (
    <div
      ref={ref}
      style={{
        width: '800px',
        height: '500px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '40px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        color: '#ffffff',
      }}
    >
      {/* Decorative borders */}
      <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: '2px solid rgba(139, 92, 246, 0.3)', borderRadius: '16px' }} />
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: '1px solid rgba(139, 92, 246, 0.1)', borderRadius: '12px' }} />

      {/* Decorative glow */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }} />

      <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800', letterSpacing: '2px', color: '#c4b5fd', textTransform: 'uppercase' }}>
            Certificate of Achievement
          </h1>
          <p style={{ margin: '10px 0 0 0', fontSize: '16px', color: '#94a3b8' }}>
            Study Tracker App
          </p>
        </div>

        {/* User & Badge Info */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <p style={{ fontSize: '18px', color: '#cbd5e1', marginBottom: '8px' }}>This certifies that</p>
          <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 20px 0', color: '#ffffff' }}>
            {user.name}
          </h2>
          <p style={{ fontSize: '18px', color: '#cbd5e1', marginBottom: '20px' }}>has successfully unlocked the achievement</p>
          
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '15px', 
            padding: '15px 30px', 
            background: 'rgba(139, 92, 246, 0.1)', 
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '50px' 
          }}>
            <span style={{ fontSize: '36px' }}>{badge.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#c4b5fd' }}>{badge.name}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>{badge.description} (+{badge.xp} XP)</p>
            </div>
          </div>
        </div>

        {/* Stats & Footer */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(148, 163, 184, 0.2)', paddingTop: '20px' }}>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Total Hours</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0' }}>{stats.totalHours}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Longest Streak</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0' }}>{stats.longestStreak} Days</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Active Days</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0' }}>{stats.activeDays}</p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>Date Unlocked</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#c4b5fd' }}>
              {achievement?.unlockedAt ? formatFull(achievement.unlockedAt) : 'Today'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
});

export default Certificate;
