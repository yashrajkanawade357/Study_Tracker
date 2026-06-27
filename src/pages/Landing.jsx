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
  ChartPieIcon,
  MicrophoneIcon,
  BellIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon
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

    // Respect reduced-motion: paint a single static frame and bail out of the loop.
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${p.opacity})`;
        ctx.fill();
      });
      return () => { window.removeEventListener('resize', resize); };
    }

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
  { icon: SparklesIcon, title: 'AI Study Coach', description: 'Personalized advice from your data, plus AI-built study plans dropped straight into your calendar.', color: 'from-violet-500 to-purple-600', glow: 'rgba(139,92,246,0.3)' },
  { icon: MicrophoneIcon, title: 'AI Voice Assistant', description: 'Speak or type to add tasks, schedule events, or ask “what’s on today?” — hands-free, with spoken replies.', color: 'from-cyan-400 to-blue-500', glow: 'rgba(34,211,238,0.3)' },
  { icon: CalendarDaysIcon, title: 'Smart Calendar', description: 'A second app in one account — Month, Week, Day & Agenda views with tasks layered right in.', color: 'from-blue-500 to-indigo-600', glow: 'rgba(59,130,246,0.3)' },
  { icon: CheckCircleIcon, title: 'Task Manager', description: 'To-dos with priority, category and due dates, filtered by Today / Upcoming / Completed.', color: 'from-fuchsia-500 to-pink-600', glow: 'rgba(217,70,239,0.3)' },
  { icon: BellIcon, title: 'Email Reminders', description: 'Toggle a reminder on any event or task and get an email before it’s due — automatically.', color: 'from-amber-400 to-orange-500', glow: 'rgba(251,191,36,0.3)' },
  { icon: AcademicCapIcon, title: 'Exam Readiness', description: 'A readiness score per exam from your logged hours and pace — then build a prep plan in one tap.', color: 'from-rose-500 to-red-600', glow: 'rgba(244,63,94,0.3)' },
  { icon: ClockIcon, title: 'Pomodoro Timer', description: 'Laser-focused work bursts that automatically log your study hours when a session ends.', color: 'from-cyan-400 to-teal-500', glow: 'rgba(34,211,238,0.3)' },
  { icon: ChartBarIcon, title: 'Deep Analytics', description: 'Charts, a 365-day heatmap, subject breakdowns, sleep tracking, and weekly check-ins.', color: 'from-emerald-400 to-teal-500', glow: 'rgba(16,185,129,0.3)' },
  { icon: TrophyIcon, title: 'Achievements', description: 'Earn XP, build streaks, unlock badges, and download a master certificate.', color: 'from-amber-400 to-orange-500', glow: 'rgba(251,191,36,0.3)' },
  { icon: ChartPieIcon, title: 'Goal Tracking', description: 'Set weekly, subject-specific goals and watch Vyora keep you honest about your progress.', color: 'from-orange-400 to-red-500', glow: 'rgba(249,115,22,0.3)' },
  { icon: CalendarIcon, title: 'Timetable Analyzer', description: 'Upload your timetable to compare projected vs actual hours and get an AI-optimized schedule.', color: 'from-pink-500 to-rose-600', glow: 'rgba(236,72,153,0.3)' },
  { icon: DocumentTextIcon, title: 'Doc & Email Summariser', description: 'Upload a PDF or Word doc — or paste an email — and AI returns a detailed summary you can read or hear aloud.', color: 'from-purple-500 to-fuchsia-600', glow: 'rgba(168,85,247,0.3)' },
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

const blogContent = (
  <>
    {/* Byline */}
    <div className="flex items-center gap-3 pb-6 border-b border-white/10">
      <div className="w-11 h-11 rounded-full overflow-hidden border border-violet-500/40 flex-shrink-0">
        <img src="/author.jpg" alt="Yashraj Kanawade" className="w-full h-full object-cover" />
      </div>
      <div>
        <p className="text-white font-semibold text-sm leading-tight">Yashraj Kanawade</p>
        <p className="text-gray-500 text-xs">Founder of Vyora · 8 min read</p>
      </div>
    </div>

    {/* Lead */}
    <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-medium">
      We all start each day with the same 24 hours — yet for students drowning in syllabi and professionals buried in inboxes, those hours rarely go where we intend. Vyora exists to fix that gap between intention and action. Here is the problem we set out to solve, and exactly how we are solving it.
    </p>

    {/* The student struggle */}
    <h3 className="text-white font-display font-bold text-2xl pt-2">The Student Struggle</h3>
    <p>
      Ask any student where their time went last week and you will usually get a shrug. Notes live in five different apps, study hours are never logged, and the real subjects that need attention stay invisible until the night before an exam. The result is a familiar cycle: anxiety, last-minute cramming, burnout, and the quiet guilt of knowing you could have done better with a little structure.
    </p>
    <p>The pain points we kept hearing again and again:</p>
    <ul className="list-disc pl-6 space-y-2 marker:text-violet-400">
      <li><span className="text-white font-medium">No single source of truth.</span> Goals, schedules, and progress are scattered across notebooks, sticky notes, and half-abandoned apps.</li>
      <li><span className="text-white font-medium">Untracked effort.</span> Without honest tracking, it is impossible to know whether you studied 2 hours or 6 — or which subject is silently falling behind.</li>
      <li><span className="text-white font-medium">No motivation loop.</span> Studying alone is a grind. There is nothing celebrating the streaks, the small wins, or the momentum you are building.</li>
      <li><span className="text-white font-medium">Reactive, not proactive.</span> Exams arrive as surprises instead of milestones you have been steadily preparing for.</li>
    </ul>

    {/* The professional dilemma */}
    <h3 className="text-white font-display font-bold text-2xl pt-2">The Professional's Dilemma</h3>
    <p>
      Corporate life is the same problem wearing a suit. The student's syllabus becomes a project backlog; the looming exam becomes a deadline. Working professionals lose entire days to back-to-back meetings, a flood of emails, and constant context-switching — ending the day exhausted, yet unsure what actually moved forward.
    </p>
    <ul className="list-disc pl-6 space-y-2 marker:text-cyan-400">
      <li><span className="text-white font-medium">Inbox overload.</span> Critical decisions are buried inside dozens of long email threads nobody has time to read in full.</li>
      <li><span className="text-white font-medium">Fragmented tasks.</span> To-dos live in chat messages, mental notes, and three different tools — so things slip.</li>
      <li><span className="text-white font-medium">No protected focus time.</span> Deep work gets crowded out by reminders that never fire and a calendar nobody planned intentionally.</li>
      <li><span className="text-white font-medium">Context-switching tax.</span> Every jump between apps and tabs quietly drains the energy that real work depends on.</li>
    </ul>

    {/* How Vyora solves it */}
    <h3 className="text-white font-display font-bold text-2xl pt-2">How Vyora Solves It</h3>
    <p>
      Vyora started as a study tracker, but the philosophy is universal: <span className="text-white font-medium">make your effort visible, make your plan effortless, and make progress feel rewarding.</span> Today, Vyora already gives you a focused home base:
    </p>
    <ul className="list-disc pl-6 space-y-2 marker:text-violet-400">
      <li><span className="text-white font-medium">Goal &amp; habit tracking</span> that turns ambitious targets into daily, achievable actions.</li>
      <li><span className="text-white font-medium">A built-in Pomodoro timer</span> that protects your focus and logs your hours automatically.</li>
      <li><span className="text-white font-medium">Deep analytics</span> showing exactly where your time goes, subject by subject.</li>
      <li><span className="text-white font-medium">An AI Study Coach</span> that reads your patterns and tells you what to focus on next.</li>
      <li><span className="text-white font-medium">Streaks &amp; achievements</span> that make consistency genuinely satisfying.</li>
    </ul>

    {/* What we just shipped */}
    <h3 className="text-white font-display font-bold text-2xl pt-2">What We Just Shipped 🚀</h3>
    <p>
      This is the exciting part — we have grown Vyora from a study tracker into a complete focus-and-productivity companion, and the <span className="text-white font-medium">entire roadmap is now live</span>:
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
      {[
        { icon: '📅', title: 'Smart Calendar', live: true, desc: 'A second app in the same account — plan events with Month, Week, Day and Agenda views, and switch between Study Tracker and Calendar in a tap.' },
        { icon: '✅', title: 'Task Manager', live: true, desc: 'Every to-do with priority, category and due dates, filtered by Today / Upcoming / Completed — and surfaced right on your calendar.' },
        { icon: '🎙️', title: 'AI Voice Assistant', live: true, desc: 'Speak or type: add tasks, schedule events, ask “what’s on today?”, or “build me a study plan.” It replies out loud and goes hands-free.' },
        { icon: '⏰', title: 'Email Reminders', live: true, desc: 'Toggle a reminder on any event or task and Vyora emails you before it is due — automatically, for everyone, free.' },
        { icon: '🧠', title: 'AI Study Plans & Readiness', live: true, desc: 'Get an exam-readiness score, then have the AI build a week of study blocks and revision tasks straight into your calendar.' },
        { icon: '📄', title: 'Document & Email Summariser', live: true, desc: 'Upload a PDF, Word doc, or paste an email, and AI gives you a detailed summary with key points and takeaways — and reads it aloud.' },
      ].map(f => (
        <div key={f.title} className="rounded-2xl p-5 border border-white/[0.08]"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">{f.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border"
              style={f.live
                ? { color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.12)' }
                : { color: '#c4b5fd', borderColor: 'rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.12)' }}>
              {f.live ? '✓ Now live' : 'Coming soon'}
            </span>
          </div>
          <h4 className="text-white font-semibold text-base mb-1.5">{f.title}</h4>
          <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>

    {/* Closing */}
    <h3 className="text-white font-display font-bold text-2xl pt-2">The Bigger Picture</h3>
    <p>
      Whether you are revising for finals or shipping a product, the underlying need is identical: <span className="text-white font-medium">spend your hours on what matters, and feel good about the progress you make.</span> A calendar plans your time, a voice assistant removes friction, tasks and reminders keep you honest, an AI coach turns intention into a real schedule, and a summariser turns long documents and emails into a 30-second briefing.
    </p>
    <p>
      That is the Vyora we have built — one focused, beautiful place that works for the student and the professional alike. It is all here today, and we are just getting started. We would love for you to grow with us.
    </p>
  </>
);

/* ── How It Works Section ─────────────────────────────────── */
const howItWorksSteps = [
  { id: 'problem', short: 'THE PROBLEM', title: 'Scattered study habits', desc: 'Notes are everywhere, hours go untracked, and exams creep up. You need one system, not ten apps.' },
  { id: 'step1', short: 'STEP 1', title: 'Set your goals', desc: 'Add your subjects and realistic weekly targets. Vyora breaks the mountain into a daily 1%.' },
  { id: 'step2', short: 'STEP 2', title: 'Let AI plan your week', desc: 'Add events and tasks yourself — or just say “build me a study plan” and the AI schedules study blocks and revision straight into your calendar.' },
  { id: 'step3', short: 'STEP 3', title: 'Track without friction', desc: 'A one-tap Pomodoro auto-logs your hours, or log by voice. Email reminders make sure nothing slips.' },
  { id: 'step4', short: 'STEP 4', title: 'Review & stay ready', desc: 'Weekly check-ins, deep analytics, and an exam-readiness score show exactly what to focus on next.' },
  { id: 'outcome', short: 'THE OUTCOME', title: 'Academic clarity', desc: 'Hit your goals, keep your streak, and walk into exam season with complete confidence.' }
];

const HowItWorks = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [autoPlay, setAutoPlay] = React.useState(true);

  // Auto-advance through the journey so visitors see every step; any click stops it.
  React.useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => setActiveStep((s) => (s + 1) % howItWorksSteps.length), 4500);
    return () => clearInterval(id);
  }, [autoPlay]);

  const selectStep = (idx) => { setAutoPlay(false); setActiveStep(idx); };

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
            <span className="text-blue-500">step by step</span>
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
                  onClick={() => selectStep(idx)}
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
                           opacity: [0, 0.85, 0.7],
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
                           background: `${shape.color}55`,
                           border: `1.5px solid ${shape.color}88`,
                           boxShadow: `0 0 24px ${shape.color}35`,
                         }}
                       />
                     ))}
                     {/* Pulsing question mark in center */}
                     <motion.div
                       animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
                       transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                       className="relative z-10 text-8xl font-display font-bold text-red-400/70"
                       style={{ textShadow: '0 0 30px rgba(248,113,113,0.4)' }}
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

                 {activeStep === 2 && (() => {
                   const subjectMeta = {
                     math:    { label: 'Math',    color: '#3b82f6' },
                     physics: { label: 'Physics', color: '#8b5cf6' },
                     chem:    { label: 'Chem',    color: '#06b6d4' },
                     break:   { label: 'Break',   color: '#10b981' },
                   };
                   // top/height are % within the day lane (0 = morning, 100 = evening)
                   const week = [
                     { day: 'Mon', blocks: [{ s: 'math', top: 4, h: 26 }, { s: 'break', top: 34, h: 9 }, { s: 'physics', top: 47, h: 30 }] },
                     { day: 'Tue', blocks: [{ s: 'chem', top: 10, h: 24 }, { s: 'math', top: 52, h: 32 }] },
                     { day: 'Wed', blocks: [{ s: 'physics', top: 4, h: 22 }, { s: 'break', top: 30, h: 9 }, { s: 'math', top: 43, h: 24 }], today: true },
                     { day: 'Thu', blocks: [{ s: 'math', top: 8, h: 28 }, { s: 'physics', top: 58, h: 26 }] },
                     { day: 'Fri', blocks: [{ s: 'chem', top: 6, h: 22 }, { s: 'break', top: 32, h: 9 }, { s: 'physics', top: 45, h: 34 }] },
                   ];
                   return (
                   <div className="w-full h-full px-4 py-4 relative z-10 flex flex-col">
                     {/* Header */}
                     <div className="flex items-center justify-between mb-2.5 px-0.5">
                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">This Week's Plan</span>
                       <span className="flex items-center gap-1 text-[8px] font-semibold text-blue-400">
                         <CalendarDaysIcon className="w-3 h-3" /> 5 days
                       </span>
                     </div>

                     {/* Timetable body: time axis + day lanes */}
                     <div className="flex-1 flex gap-1.5 min-h-0">
                       {/* Time axis */}
                       <div className="relative w-5 shrink-0">
                         {['9a', '12p', '3p', '6p'].map((t, i) => (
                           <span key={t} className="absolute right-0 text-[6px] text-gray-600 font-medium -translate-y-1/2"
                             style={{ top: `${8 + i * 28}%` }}>{t}</span>
                         ))}
                       </div>

                       {/* Day lanes */}
                       <div className="flex-1 grid grid-cols-5 gap-1.5">
                         {week.map((col, ci) => (
                           <div key={col.day} className="flex flex-col items-center gap-1.5 min-h-0">
                             <span className={`text-[8px] font-bold uppercase tracking-wide ${col.today ? 'text-blue-400' : 'text-gray-500'}`}>
                               {col.day}
                             </span>
                             {/* Lane */}
                             <div className="relative w-full flex-1 rounded-lg overflow-hidden"
                               style={{
                                 background: col.today ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.025)',
                                 border: `1px solid ${col.today ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)'}`,
                               }}>
                               {col.blocks.map((b, bi) => {
                                 const m = subjectMeta[b.s];
                                 return (
                                   <motion.div
                                     key={bi}
                                     initial={{ opacity: 0, scaleY: 0 }}
                                     animate={{ opacity: 1, scaleY: 1 }}
                                     transition={{ duration: 0.5, delay: 0.15 + ci * 0.08 + bi * 0.06, ease: [0.23, 1, 0.32, 1] }}
                                     className="absolute left-0.5 right-0.5 rounded-md flex items-center justify-center origin-top overflow-hidden"
                                     style={{
                                       top: `${b.top}%`,
                                       height: `${b.h}%`,
                                       background: `linear-gradient(135deg, ${m.color}3a, ${m.color}22)`,
                                       border: `1px solid ${m.color}66`,
                                       boxShadow: `inset 0 1px 0 ${m.color}33`,
                                     }}
                                   >
                                     <span className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: m.color }} />
                                     <span className="text-[6px] font-bold leading-none truncate px-0.5" style={{ color: m.color }}>
                                       {m.label}
                                     </span>
                                   </motion.div>
                                 );
                               })}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>

                     {/* Legend */}
                     <div className="flex items-center justify-center gap-3 mt-2.5 pt-2 border-t border-white/[0.05]">
                       {['math', 'physics', 'chem', 'break'].map(k => (
                         <div key={k} className="flex items-center gap-1">
                           <div className="w-2 h-2 rounded-[3px]" style={{ background: subjectMeta[k].color }} />
                           <span className="text-[8px] text-gray-500 font-medium">{subjectMeta[k].label}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                   );
                 })()}

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
                   <div className="w-full relative z-10 px-1">
                     {/* Header */}
                     <motion.div
                       initial={{ opacity: 0, y: -8 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.5 }}
                       className="flex items-center justify-between mb-2 px-1"
                     >
                       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Weekly Study Hours</span>
                       <motion.span
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         transition={{ delay: 1.4 }}
                         className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                         style={{ background: 'rgba(168,85,247,0.15)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.25)' }}
                       >
                         ↑ 23% this week
                       </motion.span>
                     </motion.div>
                     {/* Chart area */}
                     <div className="relative" style={{ height: 110 }}>
                       {/* Horizontal grid lines */}
                       {[0, 33, 66, 100].map((pct, gi) => (
                         <motion.div
                           key={gi}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ duration: 0.5, delay: gi * 0.07 }}
                           className="absolute left-5 right-0 flex items-center"
                           style={{ bottom: `${pct}%` }}
                         >
                           <span className="text-[7px] text-gray-600 w-4 text-right shrink-0 -ml-5 mr-1">
                             {gi === 0 ? '0' : gi === 1 ? '4h' : gi === 2 ? '8h' : '12h'}
                           </span>
                           <div className="flex-1 h-px" style={{ background: pct === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)' }} />
                         </motion.div>
                       ))}
                       {/* Bars */}
                       <div className="absolute inset-0 flex items-end gap-1 pl-5 pb-px">
                         {[
                           { h: 32, hrs: '3.8h', color: '#3b82f6', label: 'Mon' },
                           { h: 55, hrs: '6.6h', color: '#6366f1', label: 'Tue' },
                           { h: 48, hrs: '5.8h', color: '#6366f1', label: 'Wed' },
                           { h: 70, hrs: '8.4h', color: '#8b5cf6', label: 'Thu' },
                           { h: 62, hrs: '7.4h', color: '#8b5cf6', label: 'Fri' },
                           { h: 86, hrs: '10.3h', color: '#a855f7', label: 'Sat' },
                           { h: 95, hrs: '11.4h', color: '#a855f7', label: 'Sun' },
                         ].map((bar, i) => (
                           <div key={i} className="flex flex-col items-center justify-end flex-1 h-full gap-0.5">
                             {/* Value label */}
                             <motion.span
                               initial={{ opacity: 0, y: 4 }}
                               animate={{ opacity: 1, y: 0 }}
                               transition={{ delay: 0.8 + i * 0.1 }}
                               className="text-[6px] font-bold leading-none"
                               style={{ color: bar.color }}
                             >
                               {bar.hrs}
                             </motion.span>
                             {/* Bar */}
                             <motion.div
                               initial={{ height: 0, opacity: 0 }}
                               animate={{ height: `${bar.h}%`, opacity: 1 }}
                               transition={{ duration: 0.9, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                               className="w-full rounded-t-lg relative overflow-hidden"
                               style={{
                                 background: `linear-gradient(to top, ${bar.color}, ${bar.color}55)`,
                                 boxShadow: `0 0 10px ${bar.color}40, inset 0 1px 0 rgba(255,255,255,0.18)`,
                                 minHeight: 4,
                               }}
                             >
                               {/* Shimmer sweep */}
                               <motion.div
                                 animate={{ x: ['-100%', '200%'] }}
                                 transition={{ duration: 2.5, delay: 1.2 + i * 0.12, repeat: Infinity, repeatDelay: 4 }}
                                 className="absolute inset-0"
                                 style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)', width: '50%' }}
                               />
                             </motion.div>
                             {/* Day label */}
                             <span className="text-[6px] text-gray-500 font-semibold leading-none">{bar.label}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                     {/* Stats row */}
                     <motion.div
                       initial={{ opacity: 0, y: 8 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 1.6 }}
                       className="flex items-center justify-around mt-2 pt-2 pl-5"
                       style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                     >
                       {[
                         { val: '53.7h', label: 'Total', color: '#a855f7' },
                         { val: '7.7h', label: 'Avg/day', color: '#8b5cf6' },
                         { val: '11.4h', label: 'Best', color: '#3b82f6' },
                       ].map((stat, i) => (
                         <motion.div
                           key={i}
                           initial={{ opacity: 0, scale: 0.8 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: 1.8 + i * 0.1, type: 'spring', stiffness: 200 }}
                           className="flex flex-col items-center gap-0.5"
                         >
                           <span className="text-[11px] font-bold" style={{ color: stat.color }}>{stat.val}</span>
                           <span className="text-[7px] text-gray-600 uppercase tracking-wider">{stat.label}</span>
                         </motion.div>
                       ))}
                     </motion.div>
                   </div>
                 )}

                 {activeStep === 5 && (
                   <div className="relative w-full h-full flex flex-col items-center justify-center gap-5">
                     {/* Orbits + badge */}
                     <div className="relative flex items-center justify-center" style={{ width: 176, height: 176 }}>
                       {/* Orbiting rings (centered on the badge) */}
                       {[0, 1, 2, 3, 4, 5].map(i => {
                         const size = 76 + i * 20;
                         const color = ['#ec4899', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'][i];
                         return (
                           <motion.div
                             key={i}
                             animate={{ rotate: 360 }}
                             transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'linear' }}
                             className="absolute rounded-full"
                             style={{ width: size, height: size, top: '50%', left: '50%', marginLeft: -size / 2, marginTop: -size / 2 }}
                           >
                             <span className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full block"
                               style={{ width: 4 + i, height: 4 + i, background: color, boxShadow: `0 0 10px ${color}60` }} />
                           </motion.div>
                         );
                       })}
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
                           className="w-24 h-24 rounded-3xl flex items-center justify-center"
                           style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
                         >
                           <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                             <motion.path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5 }} />
                             <motion.polyline points="22 4 12 14.01 9 11.01" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 1.5 }} />
                           </svg>
                         </motion.div>
                       </motion.div>
                     </div>
                     {/* Success text — clearly below, no overlap */}
                     <motion.div
                       initial={{ opacity: 0, y: 8 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 1.8 }}
                       className="text-sm font-bold text-pink-400 whitespace-nowrap"
                     >
                       Goals Achieved ✨
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

/* ── See It In Action Section ─────────────────────────────── */
const appScreens = [
  { key: 'dashboard', label: 'Dashboard', src: '/screenshots/dashboard.png', path: 'app.vyora.io/dashboard', desc: 'Your command center — weekly hours, streaks, goals, and a quick-log all in one glance.' },
  { key: 'analytics', label: 'Analytics', src: '/screenshots/analytics.png', path: 'app.vyora.io/analytics', desc: 'Study-hour trends, a 365-day heatmap, sleep tracking, and per-subject goal progress.' },
  { key: 'achievements', label: 'Achievements', src: '/screenshots/achievements.png', path: 'app.vyora.io/achievements', desc: 'Level up with XP, unlock badges, and download your master certificate.' },
  { key: 'timetable', label: 'Timetable', src: '/screenshots/timetable.png', path: 'app.vyora.io/timetable', desc: 'Upload your timetable and let AI compare projected vs. actual hours, then optimize it.' },
  { key: 'ai-coach', label: 'AI Coach', src: '/screenshots/ai-coach.png', path: 'app.vyora.io/ai', desc: 'Ask anything and get personalized, data-driven study advice powered by AI.' },
];

const AppScreenshot = ({ src, alt }) => {
  const [err, setErr] = React.useState(false);
  if (err) {
    return (
      <div className="w-full flex flex-col items-center justify-center text-center gap-2 px-6"
        style={{ aspectRatio: '1898 / 959', background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(10,10,30,0.6))' }}>
        <SparklesIcon className="w-8 h-8 text-violet-400/60" />
        <p className="text-gray-500 text-sm font-medium">Screenshot coming soon</p>
        <p className="text-gray-600 text-xs">Add <code className="text-violet-400">{src}</code></p>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} className="w-full h-auto block" />;
};

const SeeItInAction = () => {
  const [active, setActive] = React.useState(0);
  const screen = appScreens[active];

  return (
    <section id="screenshots" className="relative z-10 py-32 border-t border-white/[0.05] scroll-mt-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="inline-block text-sm font-semibold text-cyan-400 uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full border border-cyan-500/20"
            style={{ background: 'rgba(34,211,238,0.08)' }}
          >
            See it in action
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
          >
            A glimpse{' '}
            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              inside Vyora
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-gray-400 text-lg max-w-xl mx-auto"
          >
            Real screens from the app. Beautiful, fast, and built to keep you coming back.
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {appScreens.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setActive(i)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                i === active
                  ? 'text-white border-violet-500/40'
                  : 'text-gray-400 border-white/[0.07] hover:text-white hover:border-white/15'
              }`}
              style={i === active
                ? { background: 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(168,85,247,0.2))', boxShadow: '0 6px 20px rgba(124,58,237,0.25)' }
                : { background: 'rgba(255,255,255,0.03)' }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Browser-frame mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-white/10 overflow-hidden"
          style={{ background: 'rgba(13,13,35,0.9)', boxShadow: '0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          {/* Glow behind */}
          <div className="absolute -inset-10 rounded-3xl opacity-30 pointer-events-none -z-10"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.5), transparent 60%)', filter: 'blur(40px)' }} />

          {/* Top bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.07]" style={{ background: 'rgba(6,6,18,0.8)' }}>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80" />
              <span className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs text-gray-400 border border-white/[0.06] max-w-xs w-full justify-center"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                {screen.path}
              </div>
            </div>
            <div className="w-12" />
          </div>

          {/* Screenshot */}
          <AnimatePresence mode="wait">
            <motion.div
              key={screen.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AppScreenshot src={screen.src} alt={`Vyora ${screen.label} screen`} />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Caption */}
        <AnimatePresence mode="wait">
          <motion.p
            key={screen.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center text-gray-400 mt-6 max-w-2xl mx-auto"
          >
            {screen.desc}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
};

/* ── Main Component ───────────────────────────────────────── */
const Landing = () => {
  const [showTerms, setShowTerms] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showBlog, setShowBlog] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navItems = ['Features', 'About', 'FAQ', 'Blog', 'Terms', 'Privacy', 'Contact'];
  const isModalItem = (item) => item === 'Terms' || item === 'Privacy' || item === 'Blog';
  const navHref = (item) => (isModalItem(item) ? '#' : `#${item.toLowerCase()}`);
  const handleNavClick = (e, item) => {
    if (item === 'Terms') { e.preventDefault(); setShowTerms(true); }
    if (item === 'Privacy') { e.preventDefault(); setShowPrivacy(true); }
    if (item === 'Blog') { e.preventDefault(); setShowBlog(true); }
    setMobileOpen(false);
  };

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
        <div className="max-w-7xl mx-auto rounded-2xl px-6 py-3 border border-white/[0.07]"
          style={{ background: 'rgba(6,6,18,0.8)', backdropFilter: 'blur(24px)', boxShadow: '0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between">
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
              {navItems.map(item => (
                <a key={item} href={navHref(item)} onClick={(e) => handleNavClick(e, item)}
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
              <Link to="/auth?mode=signup"
                className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-200 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                Get Started
              </Link>
              {/* Hamburger (mobile only) */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {mobileOpen
                    ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                    : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.nav
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="md:hidden overflow-hidden"
              >
                <div className="flex flex-col gap-1 pt-4 mt-4 border-t border-white/[0.07]">
                  {navItems.map(item => (
                    <a key={item} href={navHref(item)} onClick={(e) => handleNavClick(e, item)}
                      className="px-3 py-2.5 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/[0.04] transition-colors">
                      {item}
                    </a>
                  ))}
                  <Link to="/auth" onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-base font-medium text-gray-300 hover:text-white hover:bg-white/[0.04] transition-colors sm:hidden">
                    Log in
                  </Link>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
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
            <Link to="/auth?mode=signup"
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

      {/* ── Choose Your Experience ── */}
      <section className="relative z-10 py-24 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <motion.span
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="inline-block text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full border border-violet-500/20"
              style={{ background: 'rgba(124,58,237,0.1)' }}
            >
              One account, two apps
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
            >
              Choose your{' '}
              <span style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                experience
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-gray-400 text-lg max-w-xl mx-auto"
            >
              Sign up once, then jump between the two — or switch anytime from inside the app.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                to: '/auth?mode=signup',
                badge: 'Study Tracker',
                title: 'Track & gamify your studying',
                desc: 'Log sessions, set goals, build streaks, earn achievements, and get AI-powered study coaching.',
                points: ['Pomodoro + auto-logging', 'Deep analytics & streaks', 'AI Study Coach'],
                color: '#7c3aed', glow: 'rgba(124,58,237,0.35)',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                ),
                cta: 'Open Study Tracker',
              },
              {
                to: '/auth?mode=signup&app=calendar',
                badge: 'Smart Calendar',
                title: 'Plan events with smart reminders',
                desc: 'Add events and tasks, see your week at a glance, and get email reminders so nothing slips.',
                points: ['Month · Week · Day views', 'Events, tasks & reminders', 'AI voice assistant (soon)'],
                color: '#06b6d4', glow: 'rgba(6,182,212,0.35)',
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                ),
                cta: 'Open Smart Calendar',
              },
            ].map((c, i) => (
              <motion.div
                key={c.badge}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="relative rounded-3xl p-px overflow-hidden group"
                style={{ background: `linear-gradient(135deg, ${c.glow}, rgba(255,255,255,0.04))` }}
              >
                <div className="relative rounded-3xl p-8 md:p-10 h-full flex flex-col"
                  style={{ background: 'rgba(10,10,28,0.9)', backdropFilter: 'blur(20px)' }}>
                  <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                    style={{ background: `radial-gradient(circle, ${c.color}, transparent 70%)`, filter: 'blur(50px)' }} />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}aa)`, boxShadow: `0 8px 24px ${c.glow}` }}>
                    {c.icon}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: c.color }}>{c.badge}</span>
                  <h3 className="text-2xl font-display font-bold text-white mb-3 leading-tight">{c.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-6">{c.desc}</p>
                  <ul className="space-y-2.5 mb-8">
                    {c.points.map(p => (
                      <li key={p} className="flex items-center gap-2.5 text-sm text-gray-300">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${c.color}22` }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link to={c.to}
                    className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-bold text-white transition-all duration-200 hover:scale-[1.03] w-full"
                    style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}cc)`, boxShadow: `0 8px 24px ${c.glow}` }}>
                    {c.cta} <ArrowRightIcon className="w-5 h-5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog Teaser ── */}
      <section className="relative z-10 py-28 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-14">
            <motion.span
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 uppercase tracking-widest mb-4 px-4 py-1.5 rounded-full border border-violet-500/20"
              style={{ background: 'rgba(124,58,237,0.1)' }}
            >
              <SparklesIcon className="w-4 h-4" /> From the Blog
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
            >
              The story behind{' '}
              <span style={{ background: 'linear-gradient(135deg, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Vyora
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-gray-400 text-lg max-w-xl mx-auto"
            >
              Why we're building it, the problems it kills, and where it's headed next.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-white/[0.07] overflow-hidden grid grid-cols-1 lg:grid-cols-5"
            style={{ background: 'rgba(10,10,28,0.7)', backdropFilter: 'blur(30px)' }}
          >
            {/* Background glow */}
            <div className="absolute -top-24 -left-24 w-96 h-96 opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', filter: 'blur(80px)' }} />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            {/* Left: featured article — spans 3/5 */}
            <div className="relative z-10 p-9 md:p-14 flex flex-col lg:col-span-3">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold text-violet-300 uppercase tracking-widest mb-6 px-3 py-1 rounded-full border border-violet-500/25 w-max"
                style={{ background: 'rgba(124,58,237,0.12)' }}>
                ★ Featured Article
              </span>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-5 leading-[1.1]">
                Built for Busy Minds
              </h3>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-violet-500/40 flex-shrink-0">
                  <img src="/author.jpg" alt="Yashraj Kanawade" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-gray-400">Yashraj Kanawade <span className="text-gray-600">·</span> 8 min read</p>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-5">
                Students drown in syllabi; professionals drown in inboxes. The pain is the same — hours lost to scattered tasks, untracked effort, and constant context-switching.
              </p>
              <p className="text-gray-400 leading-relaxed mb-10">
                Here's the problem we set out to solve, and the roadmap that takes Vyora from a simple study tracker to your complete focus-and-productivity companion — for students and professionals alike.
              </p>
              <button
                onClick={() => setShowBlog(true)}
                className="mt-auto inline-flex items-center gap-2 text-base font-bold text-white px-7 py-3.5 rounded-xl transition-all duration-200 hover:scale-105 w-max"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}
              >
                Read the full story <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Right: roadmap — spans 2/5 */}
            <div className="relative z-10 p-9 md:p-14 border-t lg:border-t-0 lg:border-l border-white/[0.06] flex flex-col lg:col-span-2"
              style={{ background: 'rgba(255,255,255,0.015)' }}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Now in the app</p>
              <div className="flex flex-col gap-3 flex-1 justify-between">
                {[
                  { icon: '📅', label: 'Smart Calendar', desc: 'Month, week, day & agenda — a second app in one account.', live: true },
                  { icon: '✅', label: 'Task Manager', desc: 'Priorities & due dates, surfaced on your calendar.', live: true },
                  { icon: '🎙️', label: 'AI Voice Assistant', desc: 'Add tasks, plan, and ask — hands-free, out loud.', live: true },
                  { icon: '⏰', label: 'Email Reminders', desc: 'Automatic emails before anything is due.', live: true },
                  { icon: '📄', label: 'Doc & Email Summary', desc: 'Long docs or emails → a detailed, spoken briefing.', live: true },
                ].map((f, i) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-3 px-4 py-3.5 rounded-xl border border-white/[0.07] hover:border-violet-500/25 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <span className="text-xl leading-none mt-0.5">{f.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-100">{f.label}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0"
                          style={f.live
                            ? { color: '#6ee7b7', borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.12)' }
                            : { color: '#c4b5fd', borderColor: 'rgba(124,58,237,0.25)', background: 'rgba(124,58,237,0.12)' }}>
                          {f.live ? '✓ Live' : 'Soon'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{f.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
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

      {/* ── See It In Action ── */}
      <SeeItInAction />

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
                a: 'Vyora is two apps in one free account: a Study Tracker (log sessions, set goals, build streaks, view analytics, earn badges, and get AI coaching) and a Smart Calendar (plan events and tasks, get email reminders, and use an AI voice assistant). Switch between them anytime from the top-left switcher.',
              },
              {
                q: 'Is Vyora completely free?',
                a: 'Yes! Vyora is 100% free — no hidden fees, no credit card, no premium paywall. The only optional extra is the AI features, which use your own AI key (and Gemini has a free tier).',
              },
              {
                q: 'What is the difference between Study Tracker and Smart Calendar?',
                a: 'Study Tracker is about your studying — logging hours, goals, analytics, achievements and AI coaching. Smart Calendar is about planning — events, tasks, reminders, and a voice assistant. They share one login, and the AI can build study plans from one and drop them into the other.',
              },
              {
                q: 'How does the AI Study Coach work?',
                a: 'It analyses your study patterns, subject goals and upcoming exams to give personalised advice. It also shows an exam-readiness score for each exam, runs weekly check-ins to track your progress, and can build a full study plan — scheduling study blocks and revision tasks straight into your calendar.',
              },
              {
                q: 'Can I really use Vyora by voice?',
                a: 'Yes. Tap the assistant button in Smart Calendar and just talk — "add task finish chapter 5 by Friday", "what\'s on today?", or "build me a study plan". It confirms before saving, replies out loud, and goes hands-free. (Voice works best in Chrome/Edge; you can also type.)',
              },
              {
                q: 'How do email reminders work?',
                a: 'Toggle "Email reminder" on any event or task and choose how early. Vyora then emails you automatically before it is due — no setup required on your end. It works for every user, completely free.',
              },
              {
                q: 'Do I need an API key for the AI features?',
                a: 'Only for the AI parts (Study Coach, study plans, the voice assistant\'s understanding, and the timetable optimizer). Add an OpenAI, Gemini, or Anthropic key in Settings — Gemini offers a free tier. Everything else works with no key at all.',
              },
              {
                q: 'What is the Pomodoro timer?',
                a: 'A proven focus method: study for 25 minutes, take a 5-minute break, repeat. Vyora\'s built-in timer guides the cycle and automatically logs your study time when a session finishes.',
              },
              {
                q: 'How do streaks and achievements work?',
                a: 'Every day you log a study session, your streak grows. You also earn XP, level up, and unlock 18 badges like "7-day streak", "Night Owl" and "Marathoner" — and can download a master certificate.',
              },
              {
                q: 'Is my data safe?',
                a: 'Yes. Vyora uses Supabase, a secure open-source backend, to store your data, and it is never sold to third parties. Any AI key you add is stored only in your own browser.',
              },
            ].map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* ── About Vyora Section ── */}
      <section id="about" className="relative z-10 py-32 border-t border-white/[0.05] scroll-mt-24">
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
                  { num: '8+', label: 'Study Tools' },
                  { num: '100%', label: 'Free Forever' },
                  { num: '0', label: 'Ads, Ever' },
                  { num: 'AI', label: 'Study Coach' },
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

            {/* Right: testimonials */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-4"
            >
              <span className="inline-block text-xs font-bold text-violet-400 uppercase tracking-widest mb-2 px-3 py-1 rounded-full border border-violet-500/20"
                style={{ background: 'rgba(124,58,237,0.1)' }}>
                Loved by early users
              </span>
              {[
                { quote: "I finally know where my study hours actually go. The streaks keep me coming back every single day.", name: 'Aarav', role: 'Engineering Student', avatar: '🧑‍🎓', color: '#8b5cf6' },
                { quote: "The Pomodoro timer and AI coach combo is unreal. I stopped cramming and started studying with a plan.", name: 'Sneha', role: 'Med Aspirant', avatar: '👩‍⚕️', color: '#22d3ee' },
                { quote: "Clean, fast, and genuinely motivating. It's the only productivity app I haven't deleted after a week.", name: 'Rohan', role: 'Working Professional', avatar: '💼', color: '#f472b6' },
              ].map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-2xl border border-white/[0.06] hover:border-violet-500/20 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-3">
                    {[0, 1, 2, 3, 4].map(s => (
                      <StarIcon key={s} className="w-3.5 h-3.5 text-amber-400" style={{ fill: '#fbbf24' }} />
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${t.color}22`, border: `1px solid ${t.color}44` }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
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
              <Link to="/auth?mode=signup"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-lg font-bold text-white transition-all duration-200 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', boxShadow: '0 8px 40px rgba(124,58,237,0.6)' }}>
                Create Free Account <ArrowRightIcon className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Author Section ── */}
      <section id="creator" className="relative z-10 py-32 border-t border-white/[0.05]">
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
            <button onClick={() => setShowBlog(true)} className="hover:text-white transition-colors">Blog</button>
            <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">Privacy</button>
            <button onClick={() => setShowTerms(true)} className="hover:text-white transition-colors">Terms</button>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=yashrajkanawade895@gmail.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LegalModal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service" content={termsContent} />
      <LegalModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy" content={privacyContent} />
      <LegalModal isOpen={showBlog} onClose={() => setShowBlog(false)} title="Built for Busy Minds" content={blogContent} />
    </div>
  );
};

export default Landing;

