import React from 'react';
import { formatFull } from '../utils/dateUtils';

const HexagonGlow = ({ icon }) => (
  <div style={{
    position: 'relative',
    width: '160px',
    height: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.4))'
  }}>
    {/* SVG Hexagon border */}
    <svg width="160" height="180" viewBox="0 0 160 180" style={{ position: 'absolute', top: 0, left: 0 }}>
      <defs>
        <linearGradient id="hexGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <polygon 
        points="80,5 155,48 155,132 80,175 5,132 5,48" 
        fill="#1e1b4b" 
        stroke="url(#hexGrad)" 
        strokeWidth="6" 
      />
    </svg>
    <div style={{ fontSize: '70px', zIndex: 10 }}>{icon}</div>
  </div>
);

const Certificate = React.forwardRef(({ user, badge, achievement, stats }, ref) => {
  if (!badge || !user) return null;

  return (
    <div
      ref={ref}
      style={{
        width: '1000px',
        height: '660px',
        background: '#090914',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        boxSizing: 'border-box',
        overflow: 'hidden',
        color: '#ffffff',
        padding: '30px'
      }}
    >
      {/* Outer Border */}
      <div style={{ 
        position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', 
        border: '1px solid rgba(139, 92, 246, 0.2)', 
        borderRadius: '24px',
        pointerEvents: 'none'
      }} />

      {/* Decorative glows */}
      <div style={{ position: 'absolute', top: '0', left: '20%', width: '600px', height: '300px', background: 'radial-gradient(ellipse at top, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '0', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22L2 2L6 2L12 16L18 2L22 2L12 22Z" fill="#a855f7"/>
              <path d="M12 16L6 2H10L12 7.5L14 2H18L12 16Z" fill="#3b82f6"/>
            </svg>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#f8fafc' }}>Vyora</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
            <div style={{ height: '1px', width: '150px', background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.5))' }}></div>
            <span style={{ color: '#a855f7', fontSize: '14px', fontWeight: '700', letterSpacing: '3px' }}>✦ ACHIEVEMENT UNLOCKED ✦</span>
            <div style={{ height: '1px', width: '150px', background: 'linear-gradient(270deg, transparent, rgba(168,85,247,0.5))' }}></div>
          </div>
        </div>

        {/* Badge Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '50px', marginTop: '20px' }}>
          <HexagonGlow icon={badge.icon} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '64px', 
              fontWeight: '800', 
              color: '#c4b5fd',
              textShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
              lineHeight: '1.2'
            }}>
              {badge.name}
            </h1>
            <p style={{ margin: 0, fontSize: '24px', color: '#94a3b8' }}>
              {badge.description}
            </p>
            <div style={{ 
              marginTop: '10px',
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 24px', 
              background: 'rgba(168, 85, 247, 0.1)', 
              border: '1px solid rgba(168, 85, 247, 0.2)',
              borderRadius: '30px',
              width: 'fit-content'
            }}>
              <span style={{ color: '#c084fc', fontSize: '20px' }}>✦</span>
              <span style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: '600' }}>+{badge.xp} XP</span>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 80px', marginTop: '40px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%', 
              background: 'rgba(168, 85, 247, 0.1)', border: '2px solid rgba(168, 85, 247, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: 'bold', color: '#c084fc'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#a855f7', fontWeight: '700', letterSpacing: '1px' }}>AWARDED TO</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#f8fafc' }}>{user.name.replace(/\s+/g, '_')}</p>
            </div>
          </div>

          <div style={{ width: '1px', height: '50px', background: 'rgba(148, 163, 184, 0.2)' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
            </svg>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#a855f7', fontWeight: '700', letterSpacing: '1px' }}>UNLOCKED ON</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: 'bold', color: '#f8fafc' }}>
                {achievement?.unlockedAt ? formatFull(achievement.unlockedAt) : 'Today'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{ 
          margin: '30px 60px 0 60px', 
          background: 'rgba(30, 41, 59, 0.4)', 
          border: '1px solid rgba(148, 163, 184, 0.1)', 
          borderRadius: '16px',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '20px'
        }}>
          {/* Stat 1 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#60a5fa', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Total Hours</p>
              <p style={{ margin: '2px 0', fontSize: '24px', fontWeight: 'bold', color: '#f8fafc' }}>{stats.totalHours}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Time Invested</p>
            </div>
          </div>
          {/* Stat 2 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid rgba(148, 163, 184, 0.1)', paddingLeft: '20px' }}>
            <div style={{ fontSize: '40px' }}>🔥</div>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#60a5fa', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Longest Streak</p>
              <p style={{ margin: '2px 0', fontSize: '24px', fontWeight: 'bold', color: '#f8fafc' }}>{stats.longestStreak} Days</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Keep it going!</p>
            </div>
          </div>
          {/* Stat 3 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderLeft: '1px solid rgba(148, 163, 184, 0.1)', paddingLeft: '20px' }}>
            <div style={{ fontSize: '40px' }}>📅</div>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#60a5fa', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>Active Days</p>
              <p style={{ margin: '2px 0', fontSize: '24px', fontWeight: 'bold', color: '#f8fafc' }}>{stats.activeDays}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Days Active</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
            <div>
              <p style={{ margin: 0, fontSize: '10px', color: '#a855f7', fontWeight: '700', letterSpacing: '1px' }}>VERIFIED ACHIEVEMENT</p>
              <p style={{ margin: 0, fontSize: '10px', color: '#94a3b8' }}>vyora.app/verify/{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
            </div>
          </div>
          <div>
             <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
               Track. Focus. <span style={{ color: '#a855f7', fontWeight: 'bold' }}>Achieve.</span> →
             </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Certificate;
