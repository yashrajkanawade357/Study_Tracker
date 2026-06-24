import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  SparklesIcon, 
  ClockIcon, 
  CalendarDaysIcon, 
  TrophyIcon,
  ArrowRightIcon,
  FireIcon,
  BoltIcon,
  StarIcon
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

/* ── Main Component ───────────────────────────────────────── */
const Landing = () => {

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
            {['Features', 'About', 'Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
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
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=yashrajkanawade895@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

