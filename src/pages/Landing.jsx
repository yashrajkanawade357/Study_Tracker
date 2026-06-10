import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ClockIcon, 
  CalendarDaysIcon, 
  TrophyIcon,
  BookOpenIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card p-6 flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300"
  >
    <div className="w-16 h-16 rounded-2xl bg-purple-900/40 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
      <Icon className="w-8 h-8 text-cyan-400" />
    </div>
    <h3 className="text-xl font-display font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-navy-900 text-white font-body relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            <BookOpenIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-display font-bold tracking-tight text-white">
            StudyTracker
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-gray-300 hover:text-white font-medium transition-colors text-sm">
            Log In
          </Link>
          <Link to="/auth" className="btn-primary py-2 px-5 text-sm">
            Sign Up Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-32 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/30 border border-purple-500/30 text-purple-300 text-sm font-medium mb-8"
          >
            <SparklesIcon className="w-4 h-4 text-cyan-400" />
            <span>AI-Powered Study Companion</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6"
          >
            Master Your Studies with <br className="hidden md:block" />
            <span className="gradient-text glow-text-purple">Intelligent Tracking</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed"
          >
            Your personalized, AI-powered companion designed to track habits, optimize your timetable, and help you crush your exams.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link to="/auth" className="btn-primary flex items-center gap-2 text-lg py-3 px-8 w-full sm:w-auto justify-center">
              Start for Free <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <FeatureCard 
            delay={0.4}
            icon={SparklesIcon}
            title="AI Suggestions"
            description="Get personalized study tips, tailored schedules, and actionable advice to boost your productivity."
          />
          <FeatureCard 
            delay={0.5}
            icon={ClockIcon}
            title="Pomodoro Timer"
            description="Stay focused and avoid burnout with our integrated, customizable time management system."
          />
          <FeatureCard 
            delay={0.6}
            icon={CalendarDaysIcon}
            title="Timetable Analyzer"
            description="Find the perfect balance for your classes and study blocks with our visual timeline."
          />
          <FeatureCard 
            delay={0.7}
            icon={TrophyIcon}
            title="Gamified Rewards"
            description="Earn badges, level up your profile, and build long-lasting streaks to stay motivated."
          />
        </div>

        {/* Author Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-24 glass-card p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-center md:text-left relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-cyan-900/20" />
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-purple-500/30 flex-shrink-0 shadow-[0_0_30px_rgba(124,58,237,0.3)] relative z-10">
            {/* The user should save the provided image as 'author.jpg' in the public folder */}
            <img src="/author.jpg" alt="Yashraj Kanawade" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Meet the Author</h3>
            <h2 className="text-3xl font-display font-bold text-white mb-2">Yashraj Kanawade</h2>
            <p className="text-xl text-cyan-400 font-medium mb-6">Creator of StudyTracker</p>
            <div className="relative mb-8">
              <svg className="absolute -top-4 -left-4 w-8 h-8 text-purple-500/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-gray-300 italic text-lg leading-relaxed relative z-10 pl-6 border-l-2 border-purple-500/30">
                "Technology should empower us to reach our highest potential. I built StudyTracker to help students transform their ambitions into achievable habits and measurable success."
              </p>
            </div>
            <a 
              href="https://www.linkedin.com/in/yashraj-kanawade-289039223/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-[#0077b5]/10 text-[#0077b5] border border-[#0077b5]/30 hover:bg-[#0077b5] hover:text-white transition-all font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              Connect on LinkedIn
            </a>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card-cyan p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-cyan-900/50" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Ready to elevate your grades?
            </h2>
            <p className="text-cyan-100/70 mb-8 max-w-xl mx-auto text-lg">
              Join thousands of students who have transformed their academic journey with StudyTracker.
            </p>
            <Link to="/auth" className="btn-cyan flex items-center gap-2 text-lg py-3 px-10 w-max mx-auto shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              Create Your Account
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-auto relative z-10 bg-black/20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>© {new Date().getFullYear()} StudyTracker. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
