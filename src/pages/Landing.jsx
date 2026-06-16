import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  MagnifyingGlassIcon,
  SparklesIcon, 
  ClockIcon, 
  CalendarDaysIcon, 
  TrophyIcon
} from '@heroicons/react/24/outline';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl hover:bg-white/[0.04] transition-colors"
  >
    <div className="w-12 h-12 rounded-full border border-gray-700 flex items-center justify-center mb-6">
      <Icon className="w-5 h-5 text-gray-300" />
    </div>
    <h3 className="text-xl font-display font-medium text-white mb-3 tracking-wide">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
  </motion.div>
);

const ContourLines = () => {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full max-w-[800px] h-[600px] pointer-events-none opacity-80 mix-blend-screen flex items-center justify-center lg:translate-x-[10%]">
      {/* Generate concentric animated rings */}
      {[...Array(12)].map((_, i) => {
        const r = Math.floor(124 - i * 5);
        const g = Math.floor(58 + i * 10);
        const b = Math.floor(237 + i * 1);
        
        return (
          <div
            key={i}
            className="contour-layer"
            style={{
              width: `${(i + 1) * 60}px`,
              height: `${(i + 1) * 55}px`,
              animationDelay: `${i * -1.2}s`,
              animationDuration: `${15 + i * 0.5}s`,
              border: `1.5px solid rgba(${r}, ${g}, ${b}, ${0.15 + (12-i)*0.03})`,
              boxShadow: `0 0 10px rgba(${r}, ${g}, ${b}, 0.1)`
            }}
          />
        );
      })}
      <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen" />
      <div className="absolute bottom-[20%] left-[20%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen" />
    </div>
  );
};

const Landing = () => {
  const { addToast } = useApp();

  const handleEmailClick = () => {
    navigator.clipboard.writeText('yashrajkanawade895@gmail.com');
    addToast('Email address copied to clipboard!', 'success');
  };

  return (
    <div className="min-h-screen bg-black text-white font-body relative overflow-hidden flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-8 flex items-center justify-between relative z-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 16L20 6V26L6 16Z" fill="white"/>
              <circle cx="22" cy="16" r="6" stroke="white" strokeWidth="3"/>
            </svg>
          </div>
          <span className="text-lg font-display font-bold tracking-widest text-white uppercase ml-2 leading-none flex flex-col">
            <span>Vyora</span>
            <span className="text-[10px] text-gray-400">STUDY</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-xs font-semibold tracking-widest uppercase text-gray-300">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/auth" className="btn-pill-primary text-xs uppercase tracking-widest py-2.5 px-8 hidden sm:block">
            Sign In
          </Link>
          <button className="text-white hover:text-gray-300 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col justify-center min-h-[90vh]">
        <ContourLines />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 mt-8 lg:mt-0 pb-24">
          {/* Left Side: Typography & Input */}
          <div className="w-full lg:w-1/2 flex flex-col relative z-20 pt-10">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-6xl sm:text-7xl lg:text-[110px] font-display font-bold leading-[1.1] tracking-tight mb-10"
            >
              Welcome.
            </motion.h1>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-md mb-8 group"
            >
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none transition-transform group-hover:scale-110">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-300" />
              </div>
              <input 
                type="text" 
                placeholder="Search your goals..." 
                className="w-full bg-transparent border border-gray-600 rounded-full py-3.5 pl-6 pr-12 text-white focus:outline-none focus:border-white transition-colors"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex items-center gap-4"
            >
              <Link to="/auth" className="btn-pill-primary text-xs uppercase tracking-widest py-3 px-8">
                Free Trial
              </Link>
              <a href="#features" className="btn-pill-secondary text-xs lowercase tracking-wider py-3 px-8">
                see more
              </a>
            </motion.div>
          </div>

          {/* Right Side: Text Block over contours */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="w-full lg:w-[45%] flex flex-col relative z-20 lg:pl-16 mt-16 lg:mt-0"
          >
            <div className="flex items-center gap-3 mb-4">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-purple-400 opacity-80">
                <path d="M10 20L22 10V30L10 20Z" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="28" cy="20" r="6" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            
            <h2 className="text-[40px] font-display font-light text-white leading-tight mb-6">
              Landing page.
            </h2>
            
            <p className="text-[13px] text-gray-400 leading-relaxed max-w-sm">
              Your personalized, AI-powered companion designed to track habits, optimize your timetable, and help you crush your exams. Log your sessions, earn achievements, and build long-lasting streaks with ease.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="w-full bg-black py-32 relative z-10 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-medium text-white mb-4">Features.</h2>
            <p className="text-gray-500 max-w-lg">Everything you need to master your study habits and achieve your goals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard delay={0.1} icon={SparklesIcon} title="AI Suggestions" description="Get personalized study tips, tailored schedules, and actionable advice to boost productivity." />
            <FeatureCard delay={0.2} icon={ClockIcon} title="Pomodoro Timer" description="Stay focused and avoid burnout with our integrated, customizable time management system." />
            <FeatureCard delay={0.3} icon={CalendarDaysIcon} title="Timetable Analyzer" description="Find the perfect balance for your classes and study blocks with our visual timeline." />
            <FeatureCard delay={0.4} icon={TrophyIcon} title="Gamified Rewards" description="Earn badges, level up your profile, and build long-lasting streaks to stay motivated." />
          </div>
        </div>
      </section>

      {/* About/Author Section */}
      <section id="about" className="w-full bg-black py-32 relative z-10 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-16"
          >
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 border border-gray-800">
              <img src="/author.jpg" alt="Yashraj Kanawade" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Meet the Author</h3>
              <h2 className="text-3xl md:text-5xl font-display font-medium text-white mb-2">Yashraj Kanawade.</h2>
              <p className="text-sm text-cyan-500/70 uppercase tracking-widest mb-8">Creator of Vyora</p>
              
              <p className="text-gray-400 italic text-lg leading-relaxed max-w-2xl mb-8 border-l-2 border-white/[0.1] pl-6">
                "Technology should empower us to reach our highest potential. I built Vyora to help students transform their ambitions into achievable habits and measurable success."
              </p>

              <div className="flex items-center gap-6">
                <a 
                  href="https://www.linkedin.com/in/yashraj-kanawade-289039223/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
                >
                  LinkedIn
                </a>
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=yashrajkanawade895@gmail.com&su=Vyora%20Query"
                  onClick={handleEmailClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
                >
                  Email Me
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="w-full border-t border-white/[0.05] py-12 relative z-10 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} Vyora. All rights reserved.</p>
          <div className="flex items-center gap-8 mt-6 md:mt-0">
            <span className="hover:text-gray-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-gray-300 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
