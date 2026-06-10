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
