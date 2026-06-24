import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ClockIcon, 
  CalendarDaysIcon, 
  TrophyIcon,
  ArrowRightIcon,
  FireIcon,
  BoltIcon,
  StarIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

/* ── Animated particle canvas ─────────────────────────────── */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${p.opacity})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

/* ── Feature Card ─────────────────────────────────────────── */
const features = [
  { icon: SparklesIcon, title: 'AI Study Coach', description: 'Personalized tips, tailored schedules, and smart advice powered by AI.', color: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.3)' },
  { icon: ClockIcon, title: 'Pomodoro Timer', description: 'Stay laser-focused with our built-in Pomodoro timer and break system.', color: 'from-cyan-400 to-blue-500', glow: 'rgba(34,211,238,0.3)' },
  { icon: CalendarDaysIcon, title: 'Smart Timetable', description: 'Visualize your entire study schedule and find the perfect balance.', color: 'from-pink-500 to-rose-600', glow: 'rgba(236,72,153,0.3)' },
  { icon: TrophyIcon, title: 'Achievements', description: 'Earn badges, build streaks, and level up your academic profile.', color: 'from-amber-400 to-orange-500', glow: 'rgba(251,191,36,0.3)' },
  { icon: ChartBarIcon, title: 'Deep Analytics', description: 'Track your progress with detailed charts, subject breakdowns, and productivity trends.', color: 'from-emerald-400 to-teal-500', glow: 'rgba(16,185,129,0.3)' },
  { icon: CalendarIcon, title: 'Calendar', description: 'Plan ahead with our Calendar view, seamlessly integrating your study sessions.', color: 'from-blue-500 to-indigo-600', glow: 'rgba(59,130,246,0.3)' },
  { icon: CheckCircleIcon, title: 'Task Management', description: 'Break down large subjects into manageable tasks and check them off as you go.', color: 'from-fuchsia-500 to-pink-600', glow: 'rgba(217,70,239,0.3)' },
  { icon: ChartPieIcon, title: 'Goal Tracking', description: 'Set daily, weekly, and subject-specific goals to maintain your momentum and focus.', color: 'from-orange-400 to-red-500', glow: 'rgba(249,115,22,0.3)' },
];

const FeatureCard = ({ icon: Icon, title, description, color, glow, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.6, ease: 'easeOut' }}
    whileHover={{ y: -6, scale: 1.02 }}
    className="relative group rounded-2xl p-px overflow-hidden"
    style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))` }}
  >
    {/* Animated border glow on hover */}
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{ background: `linear-gradient(135deg, ${glow}, transparent)`, filter: 'blur(1px)' }} />

    <div className="relative rounded-2xl p-7 h-full"
      style={{ background: 'rgba(10,10,30,0.8)', backdropFilter: 'blur(20px)' }}>
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}
        style={{ boxShadow: `0 8px 24px ${glow}` }}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-display font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

/* ── Stat Badge ───────────────────────────────────────────── */
const StatBadge = ({ value, label, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5, type: 'spring' }}
    className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10"
    style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}
  >
    <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
      <Icon className="w-4 h-4 text-violet-400" />
    </div>
    <div>
      <div className="text-lg font-bold text-white leading-none">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  </motion.div>
);

/* ── Floating Study Card ──────────────────────────────────── */
const StudyCard = () => (
  <motion.div
    initial={{ opacity: 0, y: 30, rotateY: -10 }}
    animate={{ opacity: 1, y: 0, rotateY: 0 }}
    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
    style={{ perspective: 1000 }}
    className="relative"
  >
    {/* Glow behind card */}
    <div className="absolute -inset-4 rounded-3xl opacity-40"
      style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.4) 0%, transparent 70%)', filter: 'blur(20px)' }} />

    <div className="relative rounded-3xl p-6 border border-white/10 overflow-hidden"
      style={{ background: 'rgba(13,13,35,0.9)', backdropFilter: 'blur(30px)', boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
      
      {/* Top strip gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">This Week</p>
          <p className="text-3xl font-display font-bold text-white mt-1">32h <span className="text-violet-400">45m</span></p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 20px rgba(124,58,237,0.4)' }}>
          <TrophyIcon className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="space-y-3 mb-5">
        {[
          { label: 'Mathematics', pct: 72, color: '#8b5cf6' },
          { label: 'Physics', pct: 48, color: '#22d3ee' },
          { label: 'Computer Sci.', pct: 85, color: '#f472b6' },
        ].map(s => (
          <div key={s.label}>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{s.label}</span><span style={{ color: s.color }}>{s.pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.pct}%` }}
                transition={{ duration: 1.2, delay: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${s.color}aa, ${s.color})` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-400">Session Active</span>
        </div>
        <span className="text-xs text-violet-400 font-semibold">+12% this week</span>
      </div>
    </div>

    {/* Floating notification */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2, duration: 0.5 }}
      className="absolute -right-4 -top-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 shadow-2xl"
      style={{ background: 'rgba(13,13,35,0.95)', backdropFilter: 'blur(20px)' }}
    >
      <FireIcon className="w-4 h-4 text-orange-400" />
      <span className="text-xs font-bold text-white">7-day streak! 🔥</span>
    </motion.div>

    {/* Floating badge */}
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2.3, duration: 0.5 }}
      className="absolute -left-4 -bottom-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-green-500/20 shadow-2xl"
      style={{ background: 'rgba(13,13,35,0.95)', backdropFilter: 'blur(20px)' }}
    >
      <BoltIcon className="w-4 h-4 text-green-400" />
      <span className="text-xs font-bold text-green-400">Goal reached!</span>
    </motion.div>
  </motion.div>
);

/* ── FAQ Accordion Item ───────────────────────────────────── */
const FaqItem = ({ question, answer, delay }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl border border-white/[0.06] overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-white font-semibold text-base pr-4">{question}</span>
        <span className="flex-shrink-0 w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-violet-400 transition-transform duration-300"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', background: 'rgba(124,58,237,0.1)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1V11M1 6H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-white/[0.04] pt-4">
          {answer}
        </div>
      )}
    </motion.div>
  );
};

/* ── Modal Component ──────────────────────────────────────── */
const LegalModal = ({ isOpen, onClose, title, content }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl border border-white/10 overflow-hidden"
          style={{ background: 'rgba(15,15,30,0.95)', backdropFilter: 'blur(40px)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
        >
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="text-2xl font-display font-bold text-white">{title}</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="p-6 md:p-8 overflow-y-auto text-gray-300 text-sm md:text-base leading-relaxed space-y-6">
            {content}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const termsContent = (
  <>
    <h3 className="text-white font-semibold text-lg">1. Introduction and Acceptance of Terms</h3>
    <p>Welcome to Vyora. By accessing or using our website, application, or any of our services (collectively, the "Service"), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, then you may not access the Service.</p>
    
    <h3 className="text-white font-semibold text-lg">2. User Accounts and Security</h3>
    <p>To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process. You are entirely responsible for maintaining the confidentiality of your account password and for all activities that occur under your account.</p>

    <h3 className="text-white font-semibold text-lg">3. Service Description and AI Usage</h3>
    <p>Vyora provides tools to track study sessions, optimize schedules, and utilize an AI Study Coach for personalized insights. The AI-generated advice is for informational purposes only and should not replace professional academic counseling. We do not guarantee any specific academic outcomes from using the Service.</p>

    <h3 className="text-white font-semibold text-lg">4. User Content and Conduct</h3>
    <p>You retain all rights to any data, text, or information you submit to the Service ("User Content"). By submitting User Content, you grant us a license to use, store, and process it solely for the purpose of providing and improving the Service. You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the Service.</p>

    <h3 className="text-white font-semibold text-lg">5. Modification and Termination</h3>
    <p>We reserve the right to modify or discontinue the Service at any time, with or without notice to you. We may also terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
  </>
);

const privacyContent = (
  <>
    <h3 className="text-white font-semibold text-lg">1. Information We Collect</h3>
    <p>We collect information you provide directly to us when you create an account, log study sessions, update your profile, or communicate with us. This may include your name, email address, educational goals, study schedules, and performance analytics.</p>
    
    <h3 className="text-white font-semibold text-lg">2. How We Use Your Information</h3>
    <p>The information we collect is used to: provide, maintain, and improve our Service; personalize your experience with the AI Study Coach; send you technical notices and support messages; and monitor and analyze trends, usage, and activities in connection with our Service.</p>

    <h3 className="text-white font-semibold text-lg">3. Data Sharing and Disclosure</h3>
    <p>We do not sell your personal information. We may share anonymized, aggregated data that cannot reasonably be used to identify you. We may also disclose your information if required to do so by law or in the good faith belief that such action is necessary to comply with a legal obligation.</p>

    <h3 className="text-white font-semibold text-lg">4. Data Security and Storage</h3>
    <p>Your data is stored securely using Supabase infrastructure. We implement appropriate technical and organizational security measures to protect your information from unauthorized access, loss, or misuse. However, no internet-based service can be 100% secure.</p>

    <h3 className="text-white font-semibold text-lg">5. Your Privacy Rights</h3>
    <p>You have the right to access, update, or delete your personal information at any time. You can manage your account settings within the app or contact us to request full deletion of your data from our systems.</p>
  </>
);

/* ── How It Works Section ─────────────────────────────────── */
const howItWorksSteps = [
  { id: 'problem', short: 'THE PROBLEM', title: 'Scattered study habits', desc: 'Notes are everywhere, hours are untracked, and exams are looming. You need a system.' },
  { id: 'step1', short: 'STEP 1', title: 'Set your goals', desc: 'Define your subjects and set realistic weekly targets. Vyora helps you break down the mountain.' },
  { id: 'step2', short: 'STEP 2', title: 'Plan your week', desc: 'Use the smart timetable to allocate time blocks. Visualize your week before it starts.' },
  { id: 'step3', short: 'STEP 3', title: 'Track honestly', desc: 'One-tap Pomodoro timer. Automatic hour logging. Build a real picture of where your time goes.' },
  { id: 'step4', short: 'STEP 4', title: 'Review analytics', desc: 'Look at your weekly breakdowns. The AI coach highlights exactly where you need more focus.' },
  { id: 'outcome', short: 'THE OUTCOME', title: 'Academic clarity', desc: 'Hit your goals, maintain streaks, and enter exam season with complete confidence.' }
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  return (
    <section className="relative z-10 py-32 border-t border-white/[0.05]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4"
          >
            HOW IT WORKS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-4 leading-tight"
          >
            From overwhelmed to organized <br/>
            <span className="text-blue-500">in four steps</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-gray-400 text-lg max-w-xl mx-auto"
          >
            See how Vyora transforms scattered study habits into a focused, trackable routine.
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative mb-16 px-4 md:px-12">
          {/* Connecting line */}
          <div className="absolute top-[60%] left-12 right-12 h-[2px] bg-white/10 -translate-y-1/2 z-0 hidden md:block" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 md:gap-0">
            {howItWorksSteps.map((step, idx) => {
              const isActive = idx === activeStep;
              const isPast = idx < activeStep;
              return (
                <div 
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className="flex md:flex-col items-center gap-4 md:gap-4 cursor-pointer group w-full md:w-auto"
                >
                  <span className={`text-[10px] font-bold tracking-wider transition-colors duration-300 md:-translate-y-2 uppercase ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                    {step.short}
                  </span>
                  
                  {/* Dot */}
                  <div className={`relative flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    isActive ? 'border-blue-500 bg-blue-500 scale-125' : 
                    isPast ? 'border-blue-500/50 bg-blue-500/20' : 
                    'border-white/20 bg-[#0a0a1e] group-hover:border-white/40'
                  }`}>
                    {isActive && (
                      <motion.div 
                        layoutId="activeDotGlow"
                        className="absolute inset-0 rounded-full bg-blue-500 blur-md opacity-60"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <div className="relative rounded-3xl border border-white/10 overflow-hidden min-h-[380px] flex items-center"
          style={{ background: 'rgba(15,15,30,0.6)', backdropFilter: 'blur(20px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full"
            >
              <div>
                <div className="inline-block px-3 py-1 rounded-lg bg-white/5 text-blue-400 text-[10px] font-bold tracking-wider mb-6 uppercase">
                  {howItWorksSteps[activeStep].short}
                </div>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 leading-tight">
                  {howItWorksSteps[activeStep].title}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed">
                  {howItWorksSteps[activeStep].desc}
                </p>
              </div>

              {/* Decorative visual based on step */}
              <div className="relative h-64 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(10,10,30,0.6))' }}>
                 {/* Subtle grid overlay for all steps */}
                 <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                 {activeStep === 0 && (
                   <div className="relative w-full h-full flex items-center justify-center">
                     {/* Floating chaotic scattered shapes */}
                     {[
                       { w: 16, h: 16, color: '#ef4444', x: -60, y: -40, rotate: 12, delay: 0 },
                       { w: 24, h: 12, color: '#f97316', x: 50, y: -30, rotate: -18, delay: 0.1 },
                       { w: 14, h: 20, color: '#eab308', x: -30, y: 50, rotate: 45, delay: 0.2 },
                       { w: 12, h: 16, color: '#ec4899', x: 70, y: 40, rotate: -12, delay: 0.3 },
                       { w: 18, h: 10, color: '#a855f7', x: -70, y: 10, rotate: 30, delay: 0.15 },
                       { w: 10, h: 14, color: '#06b6d4', x: 20, y: -55, rotate: -25, delay: 0.25 },
                     ].map((shape, i) => (
                       <motion.div
                         key={i}
                         initial={{ opacity: 0, scale: 0, rotate: 0 }}
                         animate={{
                           opacity: [0, 0.5, 0.3],
                           scale: [0, 1.1, 1],
                           rotate: [0, shape.rotate * 2, shape.rotate],
                           x: [0, shape.x * 0.5, shape.x],
                           y: [0, shape.y * 0.5, shape.y],
                         }}
                         transition={{ duration: 1.2, delay: shape.delay, ease: 'easeOut' }}
                         className="absolute rounded-xl"
                         style={{
                           width: shape.w * 2.5,
                           height: shape.h * 2.5,
                           background: `${shape.color}22`,
                           border: `1px solid ${shape.color}44`,
                           boxShadow: `0 0 20px ${shape.color}15`,
                         }}
                       />
                     ))}
                     {/* Pulsing question mark in center */}
                     <motion.div
                       animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                       transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                       className="relative z-10 text-5xl font-display font-bold text-red-400/40"
                     >
                       ?
                     </motion.div>
                   </div>
                 )}

                 {activeStep === 1 && (
                   <div className="w-4/5 space-y-5 relative z-10">
                     {[
                       { label: 'Mathematics', pct: 75, color: '#3b82f6', icon: '📐' },
                       { label: 'Physics', pct: 50, color: '#a855f7', icon: '⚛️' },
                       { label: 'Literature', pct: 30, color: '#10b981', icon: '📖' },
                     ].map((goal, i) => (
                       <div key={goal.label} className="relative">
                         <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                             <span className="text-sm">{goal.icon}</span>
                             <span className="text-xs font-medium text-gray-300">{goal.label}</span>
                           </div>
                           <motion.span
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             transition={{ delay: 0.5 + i * 0.2 }}
                             className="text-xs font-bold"
                             style={{ color: goal.color }}
                           >
                             {goal.pct}%
                           </motion.span>
                         </div>
                         <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                           <motion.div
                             initial={{ width: 0 }}
                             animate={{ width: `${goal.pct}%` }}
                             transition={{ duration: 1.2, delay: 0.3 + i * 0.2, ease: [0.23, 1, 0.32, 1] }}
                             className="h-full rounded-full relative"
                             style={{
                               background: `linear-gradient(90deg, ${goal.color}88, ${goal.color})`,
                               boxShadow: `0 0 16px ${goal.color}40`,
                             }}
                           >
                             <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' }} />
                           </motion.div>
                         </div>
                       </div>
                     ))}
                     {/* Floating target icon */}
                     <motion.div
                       initial={{ opacity: 0, scale: 0 }}
                       animate={{ opacity: 1, scale: 1 }}
                       transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                       className="absolute -top-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center"
                       style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 4px 20px rgba(59,130,246,0.4)' }}
                     >
                       <span className="text-lg">🎯</span>
                     </motion.div>
                   </div>
                 )}

                 {activeStep === 2 && (
                   <div className="w-full h-full p-5 relative z-10">
                     {/* Week header */}
                     <div className="grid grid-cols-7 gap-1.5 mb-2">
                       {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                         <div key={i} className="text-center text-[9px] font-bold text-gray-500 uppercase tracking-wider">{d}</div>
                       ))}
                     </div>
                     {/* Time blocks grid */}
                     <div className="grid grid-cols-7 gap-1.5 flex-1">
                       {Array.from({ length: 28 }).map((_, i) => {
                         const isStudy = [0, 2, 3, 7, 9, 14, 15, 16, 21, 22, 24, 27].includes(i);
                         const isBreak = [5, 12, 19, 26].includes(i);
                         const color = isStudy ? '#3b82f6' : isBreak ? '#10b981' : null;
                         return (
                           <motion.div
                             key={i}
                             initial={{ opacity: 0, scale: 0.3 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ duration: 0.4, delay: i * 0.03, ease: 'backOut' }}
                             className="aspect-square rounded-lg"
                             style={{
                               background: color ? `${color}30` : 'rgba(255,255,255,0.03)',
                               border: `1px solid ${color ? `${color}50` : 'rgba(255,255,255,0.06)'}`,
                               boxShadow: color ? `0 0 12px ${color}20` : 'none',
                             }}
                           />
                         );
                       })}
                     </div>
                     {/* Legend */}
                     <div className="flex items-center gap-4 mt-3 justify-center">
                       <div className="flex items-center gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#3b82f680' }} />
                         <span className="text-[9px] text-gray-500">Study</span>
                       </div>
                       <div className="flex items-center gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#10b98180' }} />
                         <span className="text-[9px] text-gray-500">Break</span>
                       </div>
                     </div>
                   </div>
                 )}

                 {activeStep === 3 && (
                   <div className="relative flex items-center justify-center">
                     {/* Outer glow ring */}
                     <motion.div
                       animate={{ rotate: 360 }}
                       transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                       className="absolute w-52 h-52 rounded-full"
                       style={{ border: '2px dashed rgba(16,185,129,0.15)' }}
                     />
                     {/* Timer ring */}
                     <div className="relative w-44 h-44">
                       <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                         {/* Background ring */}
                         <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                         {/* Progress ring */}
                         <motion.circle
                           cx="80" cy="80" r="70" fill="none"
                           stroke="url(#pomodoroGradient)"
                           strokeWidth="8"
                           strokeLinecap="round"
                           strokeDasharray={2 * Math.PI * 70}
                           initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                           animate={{ strokeDashoffset: 2 * Math.PI * 70 * 0.25 }}
                           transition={{ duration: 2, ease: 'easeOut' }}
                         />
                         <defs>
                           <linearGradient id="pomodoroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="#10b981" />
                             <stop offset="100%" stopColor="#06b6d4" />
                           </linearGradient>
                         </defs>
                       </svg>
                       {/* Center content */}
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <motion.span
                           animate={{ opacity: [1, 0.6, 1] }}
                           transition={{ duration: 1.5, repeat: Infinity }}
                           className="text-3xl font-display font-bold text-emerald-400"
                         >
                           18:24
                         </motion.span>
                         <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Focus Time</span>
                         <motion.div
                           animate={{ scale: [1, 1.2, 1] }}
                           transition={{ duration: 2, repeat: Infinity }}
                           className="mt-2 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center"
                         >
                           <div className="w-2 h-2 rounded-full bg-emerald-400" />
                         </motion.div>
                       </div>
                     </div>
                     {/* Session count */}
                     <motion.div
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 1 }}
                       className="absolute -right-2 top-4 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-[10px] font-bold text-emerald-400"
                       style={{ background: 'rgba(16,185,129,0.1)' }}
                     >
                       Session 3/4
                     </motion.div>
                   </div>
                 )}

                 {activeStep === 4 && (
                   <div className="w-4/5 relative z-10">
                     {/* Chart with animated bars */}
                     <div className="flex items-end gap-2.5 h-36 mb-4 justify-center">
                       {[
                         { h: 30, color: '#3b82f6', label: 'Mon' },
                         { h: 55, color: '#3b82f6', label: 'Tue' },
                         { h: 45, color: '#3b82f6', label: 'Wed' },
                         { h: 70, color: '#8b5cf6', label: 'Thu' },
                         { h: 60, color: '#8b5cf6', label: 'Fri' },
                         { h: 85, color: '#a855f7', label: 'Sat' },
                         { h: 95, color: '#a855f7', label: 'Sun' },
                       ].map((bar, i) => (
                         <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                           <motion.div
                             initial={{ height: 0, opacity: 0 }}
                             animate={{ height: `${bar.h}%`, opacity: 1 }}
                             transition={{ duration: 0.8, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                             className="w-full rounded-t-md relative overflow-hidden"
                             style={{
                               background: `linear-gradient(to top, ${bar.color}cc, ${bar.color}40)`,
                               boxShadow: `0 0 16px ${bar.color}30`,
                               minHeight: 4,
                             }}
                           >
                             <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent, rgba(255,255,255,0.05))' }} />
                           </motion.div>
                           <span className="text-[8px] text-gray-500 font-medium">{bar.label}</span>
                         </div>
                       ))}
                     </div>
                     {/* Trend line text */}
                     <motion.div
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 1.2 }}
                       className="flex items-center justify-center gap-2"
                     >
                       <div className="h-px flex-1 bg-gradient-to-r from-transparent to-violet-500/30" />
                       <span className="text-[10px] font-bold text-violet-400">↑ 23% vs last week</span>
                       <div className="h-px flex-1 bg-gradient-to-l from-transparent to-violet-500/30" />
                     </motion.div>
                   </div>
                 )}

                 {activeStep === 5 && (
                   <div className="relative flex items-center justify-center">
                     {/* Orbiting particles */}
                     {[0, 1, 2, 3, 4, 5].map(i => (
                       <motion.div
                         key={i}
                         animate={{ rotate: 360 }}
                         transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'linear' }}
                         className="absolute"
                         style={{ width: 120 + i * 20, height: 120 + i * 20 }}
                       >
                         <motion.div
                           className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full"
                           style={{
                             width: 4 + i,
                             height: 4 + i,
                             background: ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'][i],
                             boxShadow: `0 0 10px ${['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'][i]}60`,
                           }}
                         />
                       </motion.div>
                     ))}
                     {/* Central badge */}
                     <motion.div
                       initial={{ scale: 0, rotate: -180 }}
                       animate={{ scale: 1, rotate: 0 }}
                       transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
                       className="relative z-10"
                     >
                       <motion.div
                         animate={{ boxShadow: ['0 0 30px rgba(236,72,153,0.3)', '0 0 60px rgba(236,72,153,0.5)', '0 0 30px rgba(236,72,153,0.3)'] }}
                         transition={{ duration: 2, repeat: Infinity }}
                         className="w-28 h-28 rounded-3xl flex items-center justify-center"
                         style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
                       >
                         <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                           <motion.path
                             d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                             initial={{ pathLength: 0 }}
                             animate={{ pathLength: 1 }}
                             transition={{ duration: 1.5, delay: 0.5 }}
                           />
                           <motion.polyline
                             points="22 4 12 14.01 9 11.01"
                             initial={{ pathLength: 0 }}
                             animate={{ pathLength: 1 }}
                             transition={{ duration: 0.8, delay: 1.5 }}
                           />
                         </svg>
                       </motion.div>
                       {/* Success text */}
                       <motion.div
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: 2 }}
                         className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-pink-400"
                       >
                         Goals Achieved ✨
                       </motion.div>
                     </motion.div>
                   </div>
                 )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

/* ── Main Component ───────────────────────────────────────── */
const Landing = () => {
  const [showTerms, setShowTerms] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);

  return (
    <div className="min-h-screen text-white font-body relative overflow-x-hidden"
      style={{ background: 'radial-gradient(ellipse at 20% 0%, #1a0533 0%, #080818 40%, #060612 100%)' }}>

      {/* ── Background Layers ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Particle canvas */}
        <ParticleCanvas />
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)', filter: 'blur(80px)', animation: 'float1 20s ease-in-out infinite alternate' }} />
        <div className="absolute top-[30%] right-[-15%] w-[60%] h-[60%] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #0e7490, transparent 70%)', filter: 'blur(80px)', animation: 'float2 25s ease-in-out infinite alternate' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #be185d, transparent 70%)', filter: 'blur(80px)', animation: 'float3 30s ease-in-out infinite alternate' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-6 py-3 border border-white/[0.07]"
          style={{ background: 'rgba(6,6,18,0.8)', backdropFilter: 'blur(24px)', boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 16px rgba(124,58,237,0.5)' }}>
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M6 16L20 6V26L6 16Z" fill="white"/>
                <circle cx="22" cy="16" r="6" stroke="white" strokeWidth="3"/>
              </svg>
            </div>
            <span className="text-xl font-display font-bold tracking-tight">Vyora</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            {['Features', 'About', 'FAQ', 'Terms', 'Privacy', 'Contact'].map(item => (
              <a key={item} href={item === 'Terms' || item === 'Privacy' ? '#' : `#${item.toLowerCase()}`}
                onClick={(e) => {
                  if (item === 'Terms') { e.preventDefault(); setShowTerms(true); }
                  if (item === 'Privacy') { e.preventDefault(); setShowPrivacy(true); }
                }}
                className="hover:text-white transition-colors duration-200 relative group">
                {item}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-violet-400 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block px-2">
              Log in
            </Link>
            <Link to="/auth"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left */}
        <div className="w-full lg:w-[55%] flex flex-col">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/30 text-violet-300 text-sm font-medium mb-8 w-max"
            style={{ background: 'rgba(124,58,237,0.1)', backdropFilter: 'blur(10px)' }}
          >
            <StarIcon className="w-4 h-4 text-violet-400" />
            Meet your new study companion
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-display font-bold leading-[1.05] tracking-tight mb-6"
          >
            Study
            <span className="block" style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Smarter.
            </span>
            <span className="text-white">Achieve More.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-400 leading-relaxed max-w-lg mb-10"
          >
            Vyora is the AI-powered study platform that tracks your habits, optimises your schedule, and gamifies your journey to academic excellence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-14"
          >
            <Link to="/auth"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 32px rgba(124,58,237,0.5)' }}>
              Start for Free <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <a href="#features"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-medium text-gray-300 border border-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}>
              Explore Features
            </a>
          </motion.div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3">
            <StatBadge value="100%" label="Free" icon={SparklesIcon} delay={0.6} />
            <StatBadge value="AI" label="Powered" icon={BoltIcon} delay={0.7} />
            <StatBadge value="24/7" label="Focus" icon={ClockIcon} delay={0.8} />
          </div>
        </div>

        {/* Right — floating card */}
        <div className="w-full lg:w-[45%]">
          <StudyCard />
        </div>
      </section>

      {/* ── How It Works ── */}
      <HowItWorks />

      {/* ── Features Section ── */}
      <section id="features" className="relative z-10 py-32 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full border border-violet-500/20"
              style={{ background: 'rgba(124,58,237,0.1)' }}
            >
              Powerful Features
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
            >
              Everything you need to{' '}
              <span style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                succeed
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-gray-400 text-lg max-w-xl mx-auto"
            >
              Vyora combines beautiful design with powerful tools to help you build the perfect study routine.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Author Section ── */}
      <section id="about" className="relative z-10 py-32 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-10 md:p-16 border border-white/[0.06] overflow-hidden flex flex-col md:flex-row items-center gap-12"
            style={{ background: 'rgba(10,10,28,0.8)', backdropFilter: 'blur(30px)' }}
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', filter: 'blur(60px)' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            <div className="w-44 h-44 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-violet-500/30 flex-shrink-0 shadow-2xl relative"
              style={{ boxShadow: '0 0 60px rgba(124,58,237,0.4)' }}>
              <img src="/author.jpg" alt="Yashraj Kanawade" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 relative z-10 text-center md:text-left">
              <span className="inline-block text-xs font-bold text-violet-400 uppercase tracking-widest mb-3 px-3 py-1 rounded-full border border-violet-500/20"
                style={{ background: 'rgba(124,58,237,0.1)' }}>
                Meet the Creator
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">Yashraj Kanawade</h2>
              <p className="text-violet-400 font-medium mb-6">Founder &amp; Creator of Vyora</p>
              <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mb-8">
                "I believe technology should feel empowering, not overwhelming. Vyora was built to help students transform ambitious goals into daily habits — wrapped in an interface you'll love opening every morning."
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <a href="https://www.linkedin.com/in/yashraj-kanawade-289039223/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white border border-white/10 hover:border-violet-500/40 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  LinkedIn ↗
                </a>
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=yashrajkanawade895@gmail.com" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-violet-400 border border-violet-500/20 hover:border-violet-500/50 transition-all duration-200"
                  style={{ background: 'rgba(124,58,237,0.08)' }}>
                  Email Me →
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="relative z-10 py-32 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full border border-violet-500/20"
              style={{ background: 'rgba(124,58,237,0.1)' }}
            >
              Got Questions?
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
            >
              Frequently Asked{' '}
              <span style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Questions
              </span>
            </motion.h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'What is Vyora?',
                a: 'Vyora is a free, AI-powered study tracking platform built for students. It helps you log study sessions, set goals, manage your timetable, and stay motivated through gamified achievements and streaks.',
              },
              {
                q: 'Is Vyora completely free?',
                a: 'Yes! Vyora is 100% free for all students. There are no hidden fees, no credit card required, and no premium paywalls. Just sign up and start tracking.',
              },
              {
                q: 'How does the AI Study Coach work?',
                a: 'The AI coach analyses your study patterns, subject distribution, and goals to give you personalised recommendations — like which subjects need more focus, optimal study times, and motivational nudges.',
              },
              {
                q: 'What is the Pomodoro timer?',
                a: 'The Pomodoro technique is a proven productivity method: study for 25 minutes, take a 5-minute break, and repeat. Vyora\'s built-in timer guides you through this cycle automatically, helping you stay focused without burning out.',
              },
              {
                q: 'Can I track multiple subjects?',
                a: 'Absolutely. You can add unlimited subjects, set individual goals for each, and Vyora will track your time per subject, show you breakdowns, and help you maintain a healthy balance across all of them.',
              },
              {
                q: 'How do streaks and achievements work?',
                a: 'Every day you log a study session, your streak grows. You also unlock badges for hitting milestones like "First 10 hours", "7-day streak", "Night Owl", and many more. It\'s designed to make studying feel rewarding.',
              },
              {
                q: 'Is my data safe?',
                a: 'Yes. Vyora uses Supabase, a secure and open-source backend, to store your data. Your information is encrypted and never sold to third parties.',
              },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* ── About Vyora Section ── */}
      <section className="relative z-10 py-32 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-block text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full border border-cyan-500/20"
                style={{ background: 'rgba(34,211,238,0.08)' }}>
                Why Vyora?
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                Built by a student,{' '}
                <span style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  for students.
                </span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Vyora was born out of frustration with generic productivity apps that don't understand the unique pressures students face — exam seasons, multiple subjects, burnout, and the constant need for motivation.
              </p>
              <p className="text-gray-400 text-lg leading-relaxed mb-10">
                Every feature in Vyora was designed with one question in mind: <span className="text-white font-medium">"Does this actually help a student study better?"</span> No bloat, no distractions — just a focused, beautiful tool that works.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { num: '100%', label: 'Free Forever' },
                  { num: 'AI', label: 'Study Coach' },
                  { num: 'Ad-Free', label: 'Experience' },
                  { num: '24/7', label: 'Focus Mode' },
                ].map(stat => (
                  <div key={stat.label} className="p-4 rounded-2xl border border-white/[0.06]"
                    style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-2xl font-display font-bold text-white mb-1"
                      style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      {stat.num}
                    </div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: feature list */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-4"
            >
              {[
                { icon: '📊', title: 'Detailed Analytics', desc: 'See exactly how you spend your study time with beautiful charts and subject breakdowns.' },
                { icon: '🎯', title: 'Goal Setting', desc: 'Set daily, weekly, and subject-specific study goals. Vyora tracks your progress automatically.' },
                { icon: '🔥', title: 'Study Streaks', desc: 'Build momentum with daily streaks. Missing a day breaks your streak — the perfect motivation.' },
                { icon: '🤖', title: 'AI-Powered Insights', desc: 'Get smart suggestions based on your performance to continuously improve your study strategy.' },
                { icon: '📅', title: 'Timetable Management', desc: 'Plan your week visually and let Vyora help you find the optimal balance between subjects.' },
                { icon: '🏆', title: 'Badges & Rewards', desc: 'Unlock achievements as you study. From "Early Bird" to "Study Legend" — there\'s always a goal to chase.' },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-4 p-4 rounded-2xl border border-white/[0.05] hover:border-violet-500/20 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative z-10 py-28 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative rounded-3xl p-16 border border-violet-500/20 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(139,92,246,0.05))', backdropFilter: 'blur(20px)' }}>
            <div className="absolute inset-0 opacity-30"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.5), transparent 60%)' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-display font-bold text-white mb-5"
              >
                Ready to level up your{' '}
                <span style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  grades?
                </span>
              </motion.h2>
              <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                Join students who are already studying smarter with Vyora. Free forever.
              </p>
              <Link to="/auth"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold text-white transition-all duration-200 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 40px rgba(124,58,237,0.6)' }}>
                Create Free Account <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" className="relative z-10 border-t border-white/[0.05] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                <path d="M6 16L20 6V26L6 16Z" fill="white"/>
                <circle cx="22" cy="16" r="6" stroke="white" strokeWidth="3"/>
              </svg>
            </div>
            <span className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Vyora. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">Privacy</button>
            <button onClick={() => setShowTerms(true)} className="hover:text-white transition-colors">Terms</button>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=yashrajkanawade895@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LegalModal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service" content={termsContent} />
      <LegalModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy" content={privacyContent} />
    </div>
  );
};

export default Landing;

