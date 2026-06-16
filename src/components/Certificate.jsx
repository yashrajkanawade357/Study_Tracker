import React from 'react';
import { formatFull } from '../utils/dateUtils';

// Large neon hexagon badge
const HexBadge = ({ icon }) => (
  <div style={{ position: 'relative', width: '280px', height: '300px', flexShrink: 0 }}>
    {/* Outer glow */}
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '260px', height: '280px',
      filter: 'blur(35px)',
      background: 'radial-gradient(ellipse, rgba(139,92,246,0.6) 0%, rgba(59,130,246,0.35) 50%, transparent 80%)',
      zIndex: 0,
    }} />
    {/* Hexagon SVG */}
    <svg width="280" height="300" viewBox="0 0 280 300" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
      <defs>
        <linearGradient id="neonBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="hexFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0f0a2e" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <polygon points="140,15 265,78 265,222 140,285 15,222 15,78" fill="url(#hexFill)" />
      <polygon points="140,15 265,78 265,222 140,285 15,222 15,78"
        fill="none" stroke="url(#neonBorder)" strokeWidth="5" filter="url(#glow)" />
      <polygon points="140,35 248,90 248,210 140,265 32,210 32,90"
        fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="1" />
    </svg>
    {/* Sparkle dots */}
    {[{x:35,y:65,s:8},{x:240,y:80,s:7},{x:50,y:220,s:7},{x:235,y:215,s:6},{x:140,y:20,s:6},{x:20,y:150,s:5},{x:258,y:150,s:5}].map((p,i)=>(
      <div key={i} style={{
        position:'absolute', left:p.x, top:p.y, width:p.s, height:p.s,
        background:'#c4b5fd', borderRadius:'50%', zIndex:3,
        boxShadow:`0 0 ${p.s*3}px #a855f7`,
        opacity: 0.9
      }}/>
    ))}
    {/* Badge emoji */}
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: '100px', zIndex: 4,
      filter: 'drop-shadow(0 6px 30px rgba(251,191,36,0.5))',
      width: '120px', height: '120px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', lineHeight: '1',
    }}>
      {icon}
    </div>
  </div>
);

// Rarity pill
const RarityPill = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 22px',
    background: 'rgba(139,92,246,0.12)',
    border: '1.5px solid rgba(139,92,246,0.5)',
    borderRadius: '50px',
    boxShadow: '0 0 25px rgba(139,92,246,0.25)',
  }}>
    <span style={{ color: '#c4b5fd', fontSize: '16px' }}>✦</span>
    <span style={{ color: '#c4b5fd', fontSize: '15px', fontWeight: '700', letterSpacing: '2px' }}>EPIC ACHIEVEMENT</span>
  </div>
);

// XP Pill
const XpPill = ({ xp }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '12px',
    padding: '12px 32px',
    background: '#151025',
    border: '2px solid rgba(139,92,246,0.5)',
    borderRadius: '50px',
    marginTop: '18px',
    boxShadow: '0 0 24px rgba(139,92,246,0.2), inset 0 0 20px rgba(139,92,246,0.05)',
  }}>
    <span style={{ color: '#a855f7', fontSize: '20px' }}>✦</span>
    <span style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>+{xp} XP</span>
  </div>
);

// Stat item
const Stat = ({ iconEl, label, value, sub, borderLeft }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '16px', flex: 1,
    borderLeft: borderLeft ? '1px solid rgba(148,163,184,0.12)' : 'none',
    paddingLeft: borderLeft ? '28px' : '0',
  }}>
    <div style={{ flexShrink: 0 }}>{iconEl}</div>
    <div>
      <p style={{ margin: 0, fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', color: label.color, textTransform: 'uppercase' }}>{label.text}</p>
      <p style={{ margin: '4px 0 2px 0', fontSize: '28px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.5px' }}>{value}</p>
      <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{sub}</p>
    </div>
  </div>
);

const Certificate = React.forwardRef(({ user, badge, achievement, stats }, ref) => {
  if (!badge || !user) return null;

  const achId = `VYORA-ACH-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Clock icon (blue)
  const ClockIcon = (
    <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'rgba(59,130,246,0.15)', border:'1.5px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    </div>
  );
  // Flame icon (orange)
  const FlameIcon = (
    <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'rgba(249,115,22,0.12)', border:'1.5px solid rgba(249,115,22,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#f97316" stroke="none">
        <path d="M12 23c-3.866 0-7-3.134-7-7 0-3.866 4-9 7-12 3 3 7 8.134 7 12 0 3.866-3.134 7-7 7zm-1-9c-1.5 1.5-2 3-2 4 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1-.5-2.5-2-4l-1-1-1 1z"/>
      </svg>
    </div>
  );
  // Calendar icon (green)
  const CalIcon = (
    <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'rgba(34,197,94,0.12)', border:'1.5px solid rgba(34,197,94,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
      </svg>
    </div>
  );

  return (
    <div
      ref={ref}
      style={{
        width: '1100px',
        height: '700px',
        background: '#08081a',
        position: 'relative',
        fontFamily: '"Segoe UI", system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        boxSizing: 'border-box',
        overflow: 'hidden',
        color: '#ffffff',
        padding: '36px 44px 28px 44px',
      }}
    >
      {/* Outer border */}
      <div style={{ position:'absolute', inset:'0', border:'1.5px solid rgba(99,102,241,0.2)', borderRadius:'24px', pointerEvents:'none', zIndex:20 }} />

      {/* Ambient glows */}
      <div style={{ position:'absolute', top:'-80px', left:'15%', width:'500px', height:'400px', background:'radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-100px', right:'5%', width:'400px', height:'400px', background:'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', top:'40%', left:'-8%', width:'300px', height:'300px', background:'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents:'none' }}/>

      {/* Subtle grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)', backgroundSize:'50px 50px', pointerEvents:'none' }}/>

      <div style={{ position:'relative', zIndex:10, height:'100%', display:'flex', flexDirection:'column' }}>

        {/* ── TOP BAR ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 22L2 2L6 2L12 16L18 2L22 2L12 22Z" fill="#a855f7"/>
              <path d="M12 16L6 2H10L12 7.5L14 2H18L12 16Z" fill="#60a5fa"/>
            </svg>
            <span style={{ fontSize:'26px', fontWeight:'800', color:'#f8fafc', letterSpacing:'-0.5px' }}>Vyora</span>
          </div>
          <RarityPill />
        </div>

        {/* ── MAIN SECTION ── */}
        <div style={{ display:'flex', alignItems:'center', gap:'30px', flex:1 }}>

          {/* LEFT: Large hex badge */}
          <HexBadge icon={badge.icon} />

          {/* RIGHT: Info */}
          <div style={{ flex:1, paddingTop:'10px' }}>
            {/* ACHIEVEMENT UNLOCKED */}
            <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'14px' }}>
              <span style={{ color:'#a78bfa', fontSize:'16px' }}>✦</span>
              <span style={{ color:'#a78bfa', fontSize:'13px', fontWeight:'700', letterSpacing:'3px' }}>ACHIEVEMENT UNLOCKED</span>
              <span style={{ color:'#a78bfa', fontSize:'16px' }}>✦</span>
            </div>

            {/* Title */}
            <h1 style={{
              margin:'0 0 8px 0',
              fontSize:'68px',
              fontWeight:'900',
              color:'#f1f5f9',
              letterSpacing:'-2px',
              lineHeight:'1.05',
              textShadow:'0 0 50px rgba(168,85,247,0.3)',
            }}>
              {badge.name}
            </h1>

            {/* Subtitle */}
            <p style={{ margin:'0', fontSize:'22px', color:'#94a3b8', fontWeight:'400' }}>
              {badge.description}
            </p>

            {/* XP Pill */}
            <XpPill xp={badge.xp} />
          </div>
        </div>

        {/* ── USER + DATE ROW ── */}
        <div style={{ display:'flex', alignItems:'center', marginTop:'8px', marginBottom:'16px', gap:'40px', padding:'0 16px' }}>
          {/* Avatar + name */}
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <div style={{
              width:'54px', height:'54px', borderRadius:'50%',
              background:'linear-gradient(135deg, #7c3aed, #2563eb)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'24px', fontWeight:'800', color:'#fff',
              boxShadow:'0 0 20px rgba(124,58,237,0.4)',
              flexShrink: 0,
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin:0, fontSize:'11px', color:'#6366f1', fontWeight:'700', letterSpacing:'2px' }}>AWARDED TO</p>
              <p style={{ margin:'4px 0 0', fontSize:'24px', fontWeight:'700', color:'#f1f5f9' }}>
                {user.name.replace(/\s+/g, '_')}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ width:'1px', height:'48px', background:'rgba(148,163,184,0.2)', flexShrink:0 }}/>

          {/* Unlock date */}
          <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <div>
              <p style={{ margin:0, fontSize:'11px', color:'#6366f1', fontWeight:'700', letterSpacing:'2px' }}>UNLOCKED ON</p>
              <p style={{ margin:'4px 0 0', fontSize:'22px', fontWeight:'700', color:'#f1f5f9' }}>
                {achievement?.unlockedAt ? formatFull(achievement.unlockedAt) : new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* ── STATS PANEL ── */}
        <div style={{
          display:'flex', alignItems:'center',
          background:'rgba(15,23,42,0.7)',
          border:'1px solid rgba(148,163,184,0.1)',
          borderRadius:'16px',
          padding:'20px 28px',
          gap:'0',
        }}>
          <Stat iconEl={ClockIcon} label={{ text:'Total Hours', color:'#3b82f6' }} value={stats.totalHours} sub="Time Invested" />
          <Stat iconEl={FlameIcon} label={{ text:'Longest Streak', color:'#f97316' }} value={`${stats.longestStreak} Days`} sub="Keep it going!" borderLeft />
          <Stat iconEl={CalIcon} label={{ text:'Active Days', color:'#22c55e' }} value={stats.activeDays} sub="Days Active" borderLeft />
        </div>

        {/* ── FOOTER ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'16px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <div>
              <p style={{ margin:0, fontSize:'11px', color:'#22c55e', fontWeight:'700', letterSpacing:'1px' }}>VERIFIED ACHIEVEMENT</p>
              <p style={{ margin:0, fontSize:'11px', color:'#475569' }}>ID: {achId}</p>
            </div>
          </div>
          <p style={{ margin:0, fontSize:'14px', color:'#64748b', fontWeight:'500' }}>
            Track. Focus. <span style={{ color:'#a855f7', fontWeight:'700' }}>Achieve.</span>
            <span style={{ color:'#6366f1', marginLeft:'8px' }}>⚡</span>
          </p>
        </div>

      </div>
    </div>
  );
});

export default Certificate;
