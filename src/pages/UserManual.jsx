import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { ChartBarIcon, ClockIcon, TrophyIcon, BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const UserManual = () => {
  const navigate = useNavigate();
  const { completeManual, userProfile } = useApp();

  const handleReady = () => {
    completeManual();
    navigate('/dashboard', { replace: true });
  };

  const isAlreadyReady = userProfile?.hasSeenManual;

  return (
    <Layout title="User Manual">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight"
          >
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Vyora</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Before you dive into your studies, take a moment to understand the science behind consistency and how to use this platform to its fullest potential.
          </motion.p>
        </div>

        {/* Section 1: The Science */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-8 border-l-4 border-l-purple-500 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-9xl opacity-5">🧠</div>
            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-purple-400" />
              The Mathematics of Consistency
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Vyora isn't just a logging tool; it's designed around the principle of <strong>incremental compounding</strong>. Have you ever seen the formula for small daily improvements?
                </p>
                <div className="bg-navy-900/50 p-4 rounded-xl border border-purple-500/20 text-center font-mono space-y-2">
                  <div className="text-red-400">1.00<sup className="text-xs">365</sup> = 1.00</div>
                  <div className="text-emerald-400 text-xl font-bold">1.01<sup className="text-xs">365</sup> = 37.78</div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Improving by just 1% every day makes you nearly 38 times better by the end of the year. Our streaks, XP, and level systems are scientifically calibrated to keep you engaged and returning to build that 1% daily habit.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-white">The Forgetting Curve</h3>
                <p className="text-gray-300 leading-relaxed">
                  Hermann Ebbinghaus hypothesized the decline of memory retention in time. By using the Timetable Analyzer and tracking your study frequencies, Vyora helps you implement <strong>spaced repetition</strong>. You'll know exactly when you've neglected a subject too long, interrupting the forgetting curve and cementing your knowledge.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Section 2: How to use efficiently */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-8 border-l-4 border-l-cyan-500">
            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircleIcon className="w-8 h-8 text-cyan-400" />
              How to Use Vyora Efficiently
            </h2>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: <ClockIcon className="w-6 h-6" />, title: "Use the Pomodoro", desc: "Don't just manually log hours. Use the built-in Pomodoro timer for intense, focused bursts. It automatically logs your study time when complete." },
                { icon: <ChartBarIcon className="w-6 h-6" />, title: "Check Analytics", desc: "Your dashboard isn't just for show. Review your weekly distribution to ensure you aren't over-studying one subject while ignoring others." },
                { icon: <TrophyIcon className="w-6 h-6" />, title: "Hunt for Badges", desc: "There are hidden achievement badges for consistency, weekend warriors, and night owls. Let them guide your study habits natively." },
                { icon: <BookOpenIcon className="w-6 h-6" />, title: "Analyze the Timetable", desc: "Drop your syllabus or weekly schedule into the AI Analyzer to instantly find gaps in your routine and optimize your study slots." }
              ].map((item, i) => (
                <div key={i} className="bg-navy-800/40 p-5 rounded-2xl border border-gray-700/50 hover:border-cyan-500/30 transition-colors">
                  <div className="text-cyan-400 mb-3">{item.icon}</div>
                  <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6 }}
          className="flex justify-center pt-8"
        >
          <button 
            onClick={handleReady}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full overflow-hidden shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:shadow-[0_0_60px_rgba(147,51,234,0.6)] transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-out skew-x-12" />
            <span>{isAlreadyReady ? 'Back to Dashboard' : "I Understand, Mark as Ready"}</span>
            <CheckCircleIcon className="w-6 h-6" />
          </button>
        </motion.div>

      </div>
    </Layout>
  );
};

export default UserManual;
