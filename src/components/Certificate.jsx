import React from 'react';
import { formatFull } from '../utils/dateUtils';

// Neon Hexagon with large emoji icon
const HexBadge = ({ icon }) => (
  <div style={{ position: 'relative', width: '220px', height: '240px', flexShrink: 0 }}>
    {/* Outer glow layer */}
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '200px', height: '220px',
      filter: 'blur(30px)',
      background: 'radial-gradient(ellipse, rgba(139,92,246,0.7) 0%, rgba(59,130,246,0.4) 50%, transparent 80%)',
      zIndex: 0,
    }} />
    {/* Hexagon SVG border */}
    <svg width="220" height="240" viewBox="0 0 220 240" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
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
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Inner fill hex */}
      <polygon points="110,12 208,63 208,177 110,228 12,177 12,63" fill="url(#hexFill)" />
      {/* Neon border hex */}
      <polygon points="110,12 208,63 208,177 110,228 12,177 12,63"
        fill="none" stroke="url(#neonBorder)" strokeWidth="4" filter="url(#glow)" />
      {/* Inner accent ring */}
      <polygon points="110,28 194,72 194,168 110,212 26,168 26,72"
        fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
    </svg>
    {/* Floating sparkles */}
    {[{x:40,y:55,s:8},{x:175,y:70,s:6},{x:55,y:170,s:7},{x:170,y:165,s:5},{x:110,y:25,s:5}].map((p,i)=>(
      <div key={i} style={{
        position:'absolute', left:p.x, top:p.y, width:p.s, height:p.s,
        background:'#c4b5fd', borderRadius:'50%', zIndex:3,
        boxShadow:`0 0 ${p.s*2}px #a855f7`,
        opacity: 0.8
      }}/>
    ))}
    {/* Emoji icon */}
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -52%)',
      fontSize: '90px', zIndex: 4,
      filter: 'drop-shadow(0 4px 24px rgba(251,191,36,0.5))',
      lineHeight: 1,
    }}>
      {icon}
    </div>
  </div>
);

// Rarity pill top-right
const RarityPill = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 18px',
    background: 'rgba(139,92,246,0.15)',
    border: '1px solid rgba(139,92,246,0.5)',
    borderRadius: '50px',
    boxShadow: '0 0 20px rgba(139,92,246,0.3)',
  }}>
    <span style={{ color: '#c4b5fd', fontSize: '14px' }}>✦</span>
    <span style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: '700', letterSpacing: '1.5px' }}>EPIC ACHIEVEMENT</span>
  </div>
);

// XP Pill
const XpPill = ({ xp }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '10px',
    padding: '10px 28px',
    background: 'rgba(15,10,46,0.8)',
    border: '1px solid rgba(139,92,246,0.4)',
    borderRadius: '50px',
    marginTop: '14px',
  }}>
    <span style={{ color: '#a855f7', fontSize: '18px' }}>✦</span>
    <span style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: '700' }}>+{xp} XP</span>
  </div>
);

// Stat box
const Stat = ({ iconEl, label, value, sub, borderLeft }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '14px', flex: 1,
    borderLeft: borderLeft ? '1px solid rgba(148,163,184,0.12)' : 'none',
    paddingLeft: borderLeft ? '24px' : '0',
  }}>
    <div style={{ flexShrink: 0 }}>{iconEl}</div>
    <div>
      <p style={{ margin: 0, fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', color: label.color, textTransform: 'uppercase' }}>{label.text}</p>
      <p style={{ margin: '3px 0 1px 0', fontSize: '24px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.5px' }}>{value}</p>
      <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{sub}</p>
    </div>
  </div>
);

const Certificate = React.forwardRef(({ user, badge, achievement, stats }, ref) => {
  if (!badge || !user) return null;

  const achId = `VYORA-ACH-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  // Clock icon (blue)
  const ClockIcon = (
    <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(59,130,246,0.15)', border:'1.5px solid rgba(59,130,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    </div>
  );
  // Flame icon (orange)
  const FlameIcon = (
    <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(249,115,22,0.12)', border:'1.5px solid rgba(249,115,22,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ fontSize:'26px', lineHeight:1 }}>🔥</span>
    </div>
  );
  // Calendar icon (green)
  const CalIcon = (
    <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(34,197,94,0.12)', border:'1.5px solid rgba(34,197,94,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        width: '1000px',
        height: '563px',
        background: '#09090f',
        position: 'relative',
        fontFamily: '"Segoe UI", system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        boxSizing: 'border-box',
        overflow: 'hidden',
        color: '#ffffff',
        padding: '32px 36px 24px 36px',
      }}
    >
      {/* Outer rounded border */}
      <div style={{ position:'absolute', inset:'0', border:'1.5px solid rgba(99,102,241,0.25)', borderRadius:'20px', pointerEvents:'none', zIndex:20 }} />

      {/* Ambient glow blobs */}
      <div style={{ position:'absolute', top:'-60px', left:'10%', width:'400px', height:'300px', background:'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-80px', right:'5%', width:'350px', height:'350px', background:'radial-gradient(ellipse, rgba(59,130,246,0.12) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', top:'30%', left:'-5%', width:'250px', height:'250px', background:'radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)', pointerEvents:'none' }}/>

      {/* Subtle grid overlay */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none' }}/>

      <div style={{ position:'relative', zIndex:10, height:'100%', display:'flex', flexDirection:'column' }}>

        {/* ── TOP BAR ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 22L2 2L6 2L12 16L18 2L22 2L12 22Z" fill="#a855f7"/>
              <path d="M12 16L6 2H10L12 7.5L14 2H18L12 16Z" fill="#60a5fa"/>
            </svg>
            <span style={{ fontSize:'22px', fontWeight:'800', color:'#f8fafc', letterSpacing:'-0.5px' }}>Vyora</span>
          </div>
          {/* Rarity pill */}
          <RarityPill />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ display:'flex', alignItems:'center', gap:'40px', flex:1 }}>

          {/* LEFT: Hexagon Badge */}
          <HexBadge icon={badge.icon} />

          {/* RIGHT: Achievement Info */}
          <div style={{ flex:1 }}>
            {/* ACHIEVEMENT UNLOCKED label */}
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
              <div style={{ height:'1px', width:'30px', background:'rgba(168,85,247,0.5)' }}/>
              <span style={{ color:'#a78bfa', fontSize:'12px', fontWeight:'700', letterSpacing:'2.5px' }}>ACHIEVEMENT UNLOCKED</span>
              <div style={{ height:'1px', width:'30px', background:'rgba(168,85,247,0.5)' }}/>
            </div>

            {/* Title */}
            <h1 style={{
              margin:'0 0 6px 0',
              fontSize:'58px',
              fontWeight:'900',
              color:'#f1f5f9',
              letterSpacing:'-2px',
              lineHeight:'1.05',
              textShadow:'0 0 40px rgba(168,85,247,0.3)',
            }}>
              {badge.name}
            </h1>

            {/* Subtitle */}
            <p style={{ margin:'0', fontSize:'18px', color:'#94a3b8', fontWeight:'400' }}>
              {badge.description}
            </p>

            {/* XP Pill */}
            <XpPill xp={badge.xp} />

            {/* User + Date row */}
            <div style={{ display:'flex', alignItems:'center', marginTop:'22px', gap:'30px' }}>
              {/* Avatar + name */}
              <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{
                  width:'52px', height:'52px', borderRadius:'50%',
                  background:'linear-gradient(135deg, #7c3aed, #2563eb)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'22px', fontWeight:'800', color:'#fff',
                  boxShadow:'0 0 16px rgba(124,58,237,0.5)',
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ margin:0, fontSize:'10px', color:'#6366f1', fontWeight:'700', letterSpacing:'1.5px' }}>AWARDED TO</p>
                  <p style={{ margin:'3px 0 0', fontSize:'20px', fontWeight:'700', color:'#f1f5f9' }}>
                    {user.name.replace(/\s+/g, '_')}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div style={{ width:'1px', height:'44px', background:'rgba(148,163,184,0.15)' }}/>

              {/* Unlock date */}
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                </svg>
                <div>
                  <p style={{ margin:0, fontSize:'10px', color:'#6366f1', fontWeight:'700', letterSpacing:'1.5px' }}>UNLOCKED ON</p>
                  <p style={{ margin:'3px 0 0', fontSize:'18px', fontWeight:'700', color:'#f1f5f9' }}>
                    {achievement?.unlockedAt ? formatFull(achievement.unlockedAt) : new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── STATS PANEL ── */}
        <div style={{
          display:'flex', alignItems:'center',
          background:'rgba(15,23,42,0.7)',
          border:'1px solid rgba(148,163,184,0.1)',
          borderRadius:'14px',
          padding:'16px 24px',
          marginTop:'20px',
          gap:'0',
          backdropFilter:'blur(12px)',
        }}>
          <Stat iconEl={ClockIcon} label={{ text:'Total Hours', color:'#3b82f6' }} value={stats.totalHours} sub="Time Invested" />
          <Stat iconEl={FlameIcon} label={{ text:'Longest Streak', color:'#f97316' }} value={`${stats.longestStreak} Days`} sub="Keep it going! 🔥" borderLeft />
          <Stat iconEl={CalIcon} label={{ text:'Active Days', color:'#22c55e' }} value={stats.activeDays} sub="Days Active" borderLeft />
        </div>

        {/* ── FOOTER ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            <div>
              <p style={{ margin:0, fontSize:'10px', color:'#22c55e', fontWeight:'700', letterSpacing:'1px' }}>VERIFIED ACHIEVEMENT</p>
              <p style={{ margin:0, fontSize:'10px', color:'#475569' }}>ID: {achId}</p>
            </div>
          </div>
          <p style={{ margin:0, fontSize:'13px', color:'#64748b', fontWeight:'500' }}>
            Track. Focus. <span style={{ color:'#a855f7', fontWeight:'700' }}>Achieve.</span>
            <span style={{ color:'#6366f1', marginLeft:'6px' }}>⚡</span>
          </p>
        </div>

      </div>
    </div>
  );
});

export default Certificate;
