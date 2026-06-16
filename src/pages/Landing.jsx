import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ClockIcon, 
  CalendarDaysIcon, 
  TrophyIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="glass-light p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300"
  >
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-6">
      <Icon className="w-6 h-6 text-indigo-600" />
    </div>
    <h3 className="text-xl font-display font-semibold text-gray-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </motion.div>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-body relative overflow-hidden flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Animated Pastel Orbs Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[100px] orb-1 mix-blend-multiply" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-purple-200/40 blur-[120px] orb-2 mix-blend-multiply" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-pink-200/40 blur-[100px] orb-3 mix-blend-multiply" />
      </div>

      {/* Header */}
      <header className="w-full px-6 py-6 flex items-center justify-between relative z-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-black rounded-xl shadow-lg">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 16L20 6V26L6 16Z" fill="white"/>
              <circle cx="22" cy="16" r="6" stroke="white" strokeWidth="3"/>
            </svg>
          </div>
          <span className="text-2xl font-display font-bold tracking-tight text-gray-900 leading-none">
            Vyora.
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-500">
          <a href="#about" className="hover:text-black transition-colors">About</a>
          <a href="#features" className="hover:text-black transition-colors">Features</a>
          <a href="#contact" className="hover:text-black transition-colors">Contact</a>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-sm font-medium text-gray-600 hover:text-black transition-colors hidden sm:block">
            Log in
          </Link>
          <Link to="/auth" className="btn-light-primary text-sm px-6 py-2.5 text-white bg-black hover:bg-gray-800 rounded-full">
            Sign up free
          </Link>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="w-full max-w-7xl mx-auto px-6 relative z-10 flex flex-col justify-center pt-24 pb-32">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
          
          {/* Left Side: Typography */}
          <div className="w-full lg:w-[55%] flex flex-col relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-black/5 text-gray-800 text-sm font-medium mb-8 w-max backdrop-blur-md shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Meet your new study assistant
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-6xl sm:text-7xl lg:text-[85px] font-display font-bold leading-[1.05] tracking-tight mb-8 text-gray-900"
            >
              Elevate your <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                academic life.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl mb-10"
            >
              Vyora is the beautiful, intelligent way to track your study hours, manage your timetable, and build habits that actually last.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link to="/auth" className="btn-light-primary text-white w-full sm:w-auto flex items-center justify-center gap-2 text-base">
                Get started for free <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <a href="#features" className="btn-light-secondary text-gray-900 w-full sm:w-auto text-base text-center">
                Explore features
              </a>
            </motion.div>
          </div>

          {/* Right Side: Floating UI Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="w-full lg:w-[45%] relative z-20"
          >
            <div className="float-animation relative">
              {/* Decorative behind card */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-20 transform scale-95 translate-y-4" />
              
              <div className="glass-light p-8 rounded-3xl border border-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <TrophyIcon className="w-32 h-32" />
                </div>
                
                <h3 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-2">This Week</h3>
                <div className="text-4xl font-display font-bold text-gray-900 mb-8">
                  32h 45m <span className="text-lg text-gray-500 font-normal">studied</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-2 text-gray-700">
                      <span>Mathematics</span>
                      <span>12h</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[70%] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-2 text-gray-700">
                      <span>Physics</span>
                      <span>8h</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-[45%] rounded-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm font-medium mb-2 text-gray-700">
                      <span>Computer Science</span>
                      <span>12.75h</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 w-[80%] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating notification badge */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute -right-6 -bottom-6 glass-light p-4 rounded-2xl flex items-center gap-3 border border-white shadow-xl bg-white"
              >
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Goal Reached!</div>
                  <div className="text-xs text-gray-500">Weekly target hit</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="w-full py-32 relative z-10 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6 tracking-tight">Everything you need to succeed.</h2>
            <p className="text-lg text-gray-600">Vyora combines beautiful design with powerful tools to help you build the perfect study routine.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard delay={0.1} icon={SparklesIcon} title="AI Suggestions" description="Get personalized study tips, tailored schedules, and actionable advice to boost productivity." />
            <FeatureCard delay={0.2} icon={ClockIcon} title="Pomodoro Timer" description="Stay focused and avoid burnout with our integrated, customizable time management system." />
            <FeatureCard delay={0.3} icon={CalendarDaysIcon} title="Timetable Analyzer" description="Find the perfect balance for your classes and study blocks with our visual timeline." />
            <FeatureCard delay={0.4} icon={TrophyIcon} title="Gamified Rewards" description="Earn badges, level up your profile, and build long-lasting streaks to stay motivated." />
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section id="about" className="w-full py-32 relative z-10 bg-[#F8FAFC] border-t border-gray-100 overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-indigo-50/50 blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-16"
          >
            <div className="w-48 h-48 md:w-72 md:h-72 rounded-full overflow-hidden border-8 border-white shadow-2xl flex-shrink-0">
              <img src="/author.jpg" alt="Yashraj Kanawade" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">Meet the Creator</h3>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4 tracking-tight">Yashraj Kanawade</h2>
              
              <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mb-8">
                "I believe technology should empower us to reach our highest potential without feeling like a chore. I built Vyora to help students transform their ambitions into achievable habits and measurable success, wrapped in a design you'll actually love using every day."
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a 
                  href="https://www.linkedin.com/in/yashraj-kanawade-289039223/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-light-secondary text-sm"
                >
                  Connect on LinkedIn
                </a>
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=yashrajkanawade895@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors px-4"
                >
                  Email Me &rarr;
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 relative z-10 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6 tracking-tight">Ready to start tracking?</h2>
          <p className="text-xl text-gray-600 mb-10">Join thousands of students building better habits with Vyora today.</p>
          <Link to="/auth" className="btn-light-primary text-white text-lg px-10 py-4 shadow-2xl shadow-indigo-200 inline-block">
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="w-full border-t border-gray-200 py-12 relative z-10 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm font-medium text-gray-500">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 16L20 6V26L6 16Z" fill="white"/>
                <circle cx="22" cy="16" r="6" stroke="white" strokeWidth="3"/>
              </svg>
            </div>
            <span>&copy; {new Date().getFullYear()} Vyora. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-8">
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-gray-900 cursor-pointer transition-colors">Terms</span>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=yashrajkanawade895@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
