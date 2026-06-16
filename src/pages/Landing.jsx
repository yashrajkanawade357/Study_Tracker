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
            <StatBadge value="10k+" label="Students" icon={StarIcon} delay={0.6} />
            <StatBadge value="4.9★" label="Rating" icon={SparklesIcon} delay={0.7} />
            <StatBadge value="500h+" label="Tracked/day" icon={ClockIcon} delay={0.8} />
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
