import React from 'react';

const Certificate = React.forwardRef(({ user, unlockedDefs, stats }, ref) => {
  if (!user || !unlockedDefs) return null;

  const achId = `VYORA-MST-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return (
    <div 
      ref={ref} 
      style={{
        display: 'flex',
        alignItems: 'flex-start',
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
        justifyContent: 'flex-start',
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



        {/* === CERTIFICATE CONTENT === */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '950px', marginTop: '100px' }}>
          
          <h3 style={{ color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '12px', marginBottom: '12px', fontWeight: 'bold' }}>
            Vyora Study Tracker
          </h3>
          
          <h1 style={{ fontSize: '50px', fontFamily: 'Georgia, serif', fontWeight: 'bold', color: '#132B40', marginBottom: '16px', letterSpacing: '0.025em', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
            Certificate of Consistency
          </h1>
          
          <p style={{ color: '#475569', fontSize: '16px', marginBottom: '12px', fontWeight: '500', margin: '0 0 12px 0' }}>
            This Certificate is Proudly Presented to
          </p>
          
          <h2 style={{ fontSize: '60px', fontWeight: 'bold', color: '#ECA620', marginBottom: '16px', letterSpacing: '-0.025em', fontFamily: 'system-ui, -apple-system, sans-serif', margin: '0 0 16px 0' }}>
            {user.name}
          </h2>
          
          <div style={{ width: '100%', maxWidth: '576px', borderBottom: '3px solid #ECA620', marginBottom: '20px' }} />
          
          <p style={{ color: '#334155', textAlign: 'center', fontSize: '16px', maxWidth: '768px', marginBottom: '20px', lineHeight: '1.5', fontWeight: '500', margin: '0 0 20px 0' }}>
            In sincere appreciation of your relentless dedication and outstanding study streaks. You have successfully unlocked <span style={{ fontWeight: 'bold', color: '#ECA620', fontSize: '20px', margin: '0 4px' }}>{unlockedDefs.length}</span> achievement badges.
          </p>
          
          {/* Badges Box */}
          <div style={{ width: '100%', maxWidth: '900px', border: '2px solid #132B40', padding: '16px', borderRadius: '8px', marginBottom: '24px', position: 'relative', marginTop: '16px', boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ffffff', padding: '0 16px', color: '#132B40', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '12px' }}>
              Badges Achieved
            </div>
            
            {/* Using flexWrap: 'wrap' but with enough width to fit up to 10 badges per row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '8px', minHeight: '60px' }}>
              {unlockedDefs.map(def => (
                <div key={def.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: '70px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '6px', filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.07))' }}>
                    {def.icon}
                  </div>
                  <span style={{ fontSize: '9px', color: '#132B40', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center', lineHeight: '1.1', letterSpacing: '0.05em' }}>
                    {def.name}
                  </span>
                </div>
              ))}
              {unlockedDefs.length === 0 && (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', width: '100%', margin: '16px 0 0 0' }}>No badges unlocked yet. Keep studying!</p>
              )}
            </div>
          </div>
          
          <p style={{ color: '#132B40', fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
            Awarded on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          
        </div>

        {/* Signature Area */}
        <div style={{ position: 'absolute', bottom: '60px', left: '96px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ width: '256px', borderBottom: '2px solid #94a3b8', marginBottom: '8px' }} />
          <span style={{ color: '#ECA620', fontWeight: 'bold', fontSize: '20px' }}>System AI</span>
          <span style={{ color: '#475569', fontWeight: '600' }}>Program Director</span>
        </div>

        {/* Verification ID */}
        <div style={{ position: 'absolute', bottom: '60px', right: '96px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', textAlign: 'right' }}>
            <span style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace', marginBottom: '4px' }}>ID: {achId}</span>
            <span style={{ color: '#132B40', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Master Certificate</span>
        </div>

      </div>
    </div>
  );
});

export default Certificate;
