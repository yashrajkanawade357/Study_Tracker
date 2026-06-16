import React from 'react';

const Certificate = React.forwardRef(({ user, unlockedDefs, stats }, ref) => {
  if (!user || !unlockedDefs) return null;

  const achId = `VYORA-MST-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return (
    <div ref={ref} className="flex items-center justify-center w-[1200px] h-[848px] p-0 font-sans bg-white text-slate-800">
      <div className="relative w-full h-full bg-white overflow-hidden shadow-2xl flex flex-col items-center justify-center">
        
        {/* === GEOMETRIC BACKGROUND SHAPES === */}

        {/* Top Left Corner */}
        <svg className="absolute top-0 left-0 w-[450px] h-[450px] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Yellow outer line */}
          <polygon points="0,95 95,0 100,0 0,100" fill="#ECA620" />
          {/* Yellow Triangle */}
          <polygon points="0,0 75,0 0,75" fill="#ECA620" />
          {/* Navy Triangle */}
          <polygon points="0,0 60,0 0,60" fill="#132B40" />
        </svg>

        {/* Middle Left Triangle */}
        <svg className="absolute top-[45%] left-0 w-[120px] h-[160px] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="0,0 100,50 0,100" fill="#ECA620" />
        </svg>

        {/* Middle Right Triangle */}
        <svg className="absolute top-[40%] right-0 w-[150px] h-[200px] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="100,0 0,50 100,100" fill="#ECA620" />
        </svg>

        {/* Bottom Right Corner */}
        <svg className="absolute bottom-0 right-0 w-[550px] h-[450px] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Yellow outer line */}
          <polygon points="0,100 100,0 100,5 5,100" fill="#ECA620" />
          {/* Navy outer line */}
          <polygon points="10,100 100,10 100,20 20,100" fill="#132B40" />
          {/* Yellow Triangle */}
          <polygon points="100,100 35,100 100,35" fill="#ECA620" />
          {/* Navy Triangle */}
          <polygon points="100,100 50,100 100,50" fill="#132B40" />
        </svg>

        {/* Top Right Seal */}
        <div className="absolute top-16 right-24 z-10 flex flex-col items-center">
          <svg width="150" height="180" viewBox="0 0 100 120" className="drop-shadow-lg">
             {/* Left Ribbon */}
             <polygon points="25,70 10,115 35,105 45,115" fill="#ECA620" />
             {/* Right Ribbon */}
             <polygon points="75,70 90,115 65,105 55,115" fill="#ECA620" />
             
             {/* Left Navy Ribbon Shadow */}
             <polygon points="28,70 15,110 35,100 45,110" fill="#132B40" opacity="0.9" />
             {/* Right Navy Ribbon Shadow */}
             <polygon points="72,70 85,110 65,100 55,110" fill="#132B40" opacity="0.9" />

             {/* Scalloped edge base */}
             <circle cx="50" cy="50" r="42" fill="#132B40" />
             {/* Inner rings */}
             <circle cx="50" cy="50" r="35" fill="#ECA620" />
             <circle cx="50" cy="50" r="31" fill="#FFFFFF" />
             <circle cx="50" cy="50" r="27" fill="none" stroke="#132B40" strokeWidth="1.5" strokeDasharray="3,3" />
          </svg>
        </div>

        {/* === CERTIFICATE CONTENT === */}
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-4xl mt-8">
          
          <h3 className="text-gray-600 uppercase tracking-[0.3em] text-sm mb-6 font-bold">
            Vyora Study Tracker
          </h3>
          
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#132B40] mb-6 tracking-wide uppercase">
            Certificate of Consistency
          </h1>
          
          <p className="text-gray-600 text-lg mb-4 font-medium">
            This Certificate is Proudly Presented to
          </p>
          
          <h2 className="text-6xl md:text-7xl font-bold text-[#ECA620] mb-6 tracking-tight font-sans">
            {user.name}
          </h2>
          
          <div className="w-full max-w-xl border-b-[4px] border-[#ECA620] mb-8" />
          
          <p className="text-gray-700 text-center text-xl max-w-3xl mb-8 leading-relaxed font-medium">
            In sincere appreciation of your relentless dedication and outstanding study streaks. You have successfully unlocked <span className="font-bold text-[#ECA620] text-2xl mx-1">{unlockedDefs.length}</span> achievement badges.
          </p>
          
          {/* Badges Grid */}
          <div className="flex flex-wrap justify-center gap-6 max-w-3xl mb-12 min-h-[120px] p-6 bg-gray-50/50 rounded-2xl border border-gray-200/50">
            {unlockedDefs.map(def => (
              <div key={def.id} className="flex flex-col items-center justify-start w-20">
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center text-3xl shadow-sm mb-2 hover:shadow-md transition-shadow">
                  {def.icon}
                </div>
                <span className="text-[9px] text-gray-500 font-bold uppercase text-center leading-tight tracking-wider">
                  {def.name}
                </span>
              </div>
            ))}
            {unlockedDefs.length === 0 && (
              <p className="text-gray-400 italic">No badges unlocked yet. Keep studying!</p>
            )}
          </div>
          
          <p className="text-[#132B40] text-2xl font-bold mb-16">
            Awarded on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          
        </div>

        {/* Signature Area */}
        <div className="absolute bottom-20 left-24 z-10 flex flex-col items-start">
          <div className="w-64 border-b-2 border-gray-400 mb-2" />
          <span className="text-[#ECA620] font-bold text-xl">System AI</span>
          <span className="text-gray-600 font-semibold">Program Director</span>
        </div>

        {/* Verification ID */}
        <div className="absolute bottom-20 right-24 z-10 flex flex-col items-end text-right">
            <span className="text-gray-400 text-xs font-mono mb-1">ID: {achId}</span>
            <span className="text-[#132B40] font-bold text-sm uppercase tracking-wider">Official Master Certificate</span>
        </div>

      </div>
    </div>
  );
});

export default Certificate;
