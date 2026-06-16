import React from 'react';

const Certificate = React.forwardRef(({ user, unlockedDefs, stats }, ref) => {
  if (!user || !unlockedDefs) return null;

  const achId = `VYORA-MST-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return (
    <div 
      ref={ref} 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '1200px',
        height: '848px',
        padding: 0,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#ffffff',
        color: '#1e293b'
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}>
        
        {/* === GEOMETRIC BACKGROUND SHAPES === */}

        {/* Top Left Corner */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '450px', height: '450px', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="0,95 95,0 100,0 0,100" fill="#ECA620" />
          <polygon points="0,0 75,0 0,75" fill="#ECA620" />
          <polygon points="0,0 60,0 0,60" fill="#132B40" />
        </svg>

        {/* Middle Left Triangle */}
        <svg style={{ position: 'absolute', top: '45%', left: 0, width: '120px', height: '160px', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="0,0 100,50 0,100" fill="#ECA620" />
        </svg>

        {/* Middle Right Triangle */}
        <svg style={{ position: 'absolute', top: '40%', right: 0, width: '150px', height: '200px', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="100,0 0,50 100,100" fill="#ECA620" />
        </svg>

        {/* Bottom Right Corner */}
        <svg style={{ position: 'absolute', bottom: 0, right: 0, width: '550px', height: '450px', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="0,100 100,0 100,5 5,100" fill="#ECA620" />
          <polygon points="10,100 100,10 100,20 20,100" fill="#132B40" />
          <polygon points="100,100 35,100 100,35" fill="#ECA620" />
          <polygon points="100,100 50,100 100,50" fill="#132B40" />
        </svg>

        {/* Top Right Seal */}
        <div style={{ position: 'absolute', top: '64px', right: '96px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="150" height="180" viewBox="0 0 100 120" style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
             <polygon points="25,70 10,115 35,105 45,115" fill="#ECA620" />
             <polygon points="75,70 90,115 65,105 55,115" fill="#ECA620" />
             <polygon points="28,70 15,110 35,100 45,110" fill="#132B40" opacity="0.9" />
             <polygon points="72,70 85,110 65,100 55,110" fill="#132B40" opacity="0.9" />
             <circle cx="50" cy="50" r="42" fill="#132B40" />
             <circle cx="50" cy="50" r="35" fill="#ECA620" />
             <circle cx="50" cy="50" r="31" fill="#FFFFFF" />
             <circle cx="50" cy="50" r="27" fill="none" stroke="#132B40" strokeWidth="1.5" strokeDasharray="3,3" />
          </svg>
        </div>

        {/* === CERTIFICATE CONTENT === */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '900px', marginTop: '32px' }}>
          
          <h3 style={{ color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '14px', marginBottom: '24px', fontWeight: 'bold' }}>
            Vyora Study Tracker
          </h3>
          
          <h1 style={{ fontSize: '60px', fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#132B40', marginBottom: '24px', letterSpacing: '0.025em', textTransform: 'uppercase', margin: '0 0 24px 0' }}>
            Certificate of Consistency
          </h1>
          
          <p style={{ color: '#475569', fontSize: '18px', marginBottom: '16px', fontWeight: '500', margin: '0 0 16px 0' }}>
            This Certificate is Proudly Presented to
          </p>
          
          <h2 style={{ fontSize: '72px', fontWeight: 'bold', color: '#ECA620', marginBottom: '24px', letterSpacing: '-0.025em', fontFamily: 'system-ui, -apple-system, sans-serif', margin: '0 0 24px 0' }}>
            {user.name}
          </h2>
          
          <div style={{ width: '100%', maxWidth: '576px', borderBottom: '4px solid #ECA620', marginBottom: '32px' }} />
          
          <p style={{ color: '#334155', textAlign: 'center', fontSize: '20px', maxWidth: '768px', marginBottom: '32px', lineHeight: '1.6', fontWeight: '500', margin: '0 0 32px 0' }}>
            In sincere appreciation of your relentless dedication and outstanding study streaks. You have successfully unlocked <span style={{ fontWeight: 'bold', color: '#ECA620', fontSize: '24px', margin: '0 4px' }}>{unlockedDefs.length}</span> achievement badges.
          </p>
          
          {/* Badges Box */}
          <div style={{ width: '100%', maxWidth: '768px', border: '2px solid #132B40', padding: '24px', borderRadius: '8px', marginBottom: '48px', position: 'relative', marginTop: '24px', boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ffffff', padding: '0 16px', color: '#132B40', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '14px' }}>
              Badges Achieved
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px', marginTop: '8px', minHeight: '80px' }}>
              {unlockedDefs.map(def => (
                <div key={def.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: '80px' }}>
                  {/* Icon without the circle background */}
                  <div style={{ fontSize: '36px', marginBottom: '8px', filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.07))' }}>
                    {def.icon}
                  </div>
                  <span style={{ fontSize: '10px', color: '#132B40', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', lineHeight: '1.2', letterSpacing: '0.05em' }}>
                    {def.name}
                  </span>
                </div>
              ))}
              {unlockedDefs.length === 0 && (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', width: '100%', margin: '16px 0 0 0' }}>No badges unlocked yet. Keep studying!</p>
              )}
            </div>
          </div>
          
          <p style={{ color: '#132B40', fontSize: '24px', fontWeight: 'bold', marginBottom: '64px', margin: '0 0 64px 0' }}>
            Awarded on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          
        </div>

        {/* Signature Area */}
        <div style={{ position: 'absolute', bottom: '80px', left: '96px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ width: '256px', borderBottom: '2px solid #94a3b8', marginBottom: '8px' }} />
          <span style={{ color: '#ECA620', fontWeight: 'bold', fontSize: '20px' }}>System AI</span>
          <span style={{ color: '#475569', fontWeight: '600' }}>Program Director</span>
        </div>

        {/* Verification ID */}
        <div style={{ position: 'absolute', bottom: '80px', right: '96px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace', marginBottom: '4px' }}>ID: {achId}</span>
            <span style={{ color: '#132B40', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Master Certificate</span>
        </div>

      </div>
    </div>
  );
});

export default Certificate;
