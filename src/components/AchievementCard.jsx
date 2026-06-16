import React from 'react';
import { motion } from 'framer-motion';

const AchievementCard = () => {
  return (
    <div className="flex items-center justify-center w-full p-4 font-sans bg-gray-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-5xl aspect-[1.414/1] bg-white overflow-hidden shadow-2xl flex flex-col items-center justify-center"
      >
        {/* === GEOMETRIC BACKGROUND SHAPES === */}

        {/* Top Left Corner */}
        <svg className="absolute top-0 left-0 w-[400px] h-[400px] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
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
        <svg className="absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
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
          <svg width="120" height="150" viewBox="0 0 100 120" className="drop-shadow-lg">
             {/* Left Ribbon */}
             <polygon points="25,70 10,115 35,105 45,115" fill="#ECA620" />
             {/* Right Ribbon */}
             <polygon points="75,70 90,115 65,105 55,115" fill="#ECA620" />
             
             {/* Left Navy Ribbon Shadow */}
             <polygon points="28,70 15,110 35,100 45,110" fill="#132B40" opacity="0.9" />
             {/* Right Navy Ribbon Shadow */}
             <polygon points="72,70 85,110 65,100 55,110" fill="#132B40" opacity="0.9" />

             {/* Scalloped edge base (simulated with a star/polygon overlap) */}
             <circle cx="50" cy="50" r="42" fill="#132B40" />
             {/* Inner rings */}
             <circle cx="50" cy="50" r="35" fill="#ECA620" />
             <circle cx="50" cy="50" r="31" fill="#FFFFFF" />
             <circle cx="50" cy="50" r="27" fill="none" stroke="#132B40" strokeWidth="1.5" strokeDasharray="3,3" />
          </svg>
        </div>


        {/* === CERTIFICATE CONTENT === */}
        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-3xl">
          
          {/* Logo Placeholder */}
          <div className="w-16 h-16 bg-[#ECA620] rounded-xl flex items-center justify-center text-white font-bold text-[10px] text-center leading-tight mb-4 shadow-sm border border-[#d4961d]">
            VYORA<br/>LOGO
          </div>
          
          {/* Subtitle / Organization */}
          <h3 className="text-gray-600 uppercase tracking-widest text-sm mb-6 font-medium">
            Vyora Study Tracker
          </h3>
          
          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#132B40] mb-6 tracking-wide uppercase">
            Achievement Certificate
          </h1>
          
          {/* Presented to */}
          <p className="text-gray-600 text-lg mb-4 font-medium">
            This Certificate is Proudly Presented to
          </p>
          
          {/* Name */}
          <h2 className="text-5xl md:text-6xl font-bold text-[#ECA620] mb-6 tracking-tight font-sans">
            Yashraj Kanawade
          </h2>
          
          {/* Golden Divider */}
          <div className="w-full max-w-lg border-b-[3px] border-[#ECA620] mb-8" />
          
          {/* Description */}
          <p className="text-gray-700 text-center text-lg max-w-2xl mb-12 leading-relaxed">
            In sincere appreciation of your valuable support and outstanding contribution to the success of your learning goals and maintaining a 7-day streak.
          </p>
          
          {/* Date */}
          <p className="text-[#132B40] text-xl font-medium mb-16">
            Awarded on Jun 16, 2026
          </p>
          
        </div>

        {/* Signature Area */}
        <div className="absolute bottom-16 left-24 z-10 flex flex-col items-start">
          <div className="w-56 border-b-2 border-gray-400 mb-2" />
          <span className="text-[#ECA620] font-bold text-lg">System AI</span>
          <span className="text-gray-600 font-medium">Program Director</span>
        </div>

      </motion.div>
    </div>
  );
};

export default AchievementCard;
