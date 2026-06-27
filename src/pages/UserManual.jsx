import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import {
  ChartBarIcon, ClockIcon, TrophyIcon, BookOpenIcon, CheckCircleIcon,
  CalendarDaysIcon, SparklesIcon, MicrophoneIcon, BellIcon, Cog6ToothIcon,
  KeyIcon, ClipboardDocumentCheckIcon, ArrowsRightLeftIcon, RocketLaunchIcon,
  PencilSquareIcon, FlagIcon,
} from '@heroicons/react/24/outline';

/* ── Data ───────────────────────────────────────────────── */
const quickStart = [
  { n: 1, title: 'Add your subjects & goals', desc: 'Go to Settings → Subjects and add what you study, each with a weekly hour goal.' },
  { n: 2, title: 'Unlock the AI features', desc: 'Settings → API Keys → paste an OpenAI, Gemini, or Anthropic key. Gemini has a free tier. This powers the AI Coach, Timetable optimizer, and the voice assistant.' },
  { n: 3, title: 'Log your first session', desc: 'On the Dashboard use Quick Log (or run a Pomodoro) to record study time. Your streak, XP and charts come alive.' },
  { n: 4, title: 'Plan ahead in Smart Calendar', desc: 'Switch to Smart Calendar (top-left switcher), add events & tasks, or just ask the ✨ assistant to “build me a study plan”.' },
];

const trackerFeatures = [
  { icon: PencilSquareIcon, title: 'Quick Log', desc: 'Record a study session in seconds — pick a subject, hours and an optional note. Right on the Dashboard.' },
  { icon: ClockIcon, title: 'Pomodoro Timer', desc: 'Focused 25-minute work bursts with breaks. When a session finishes it auto-logs your study time for you.' },
  { icon: FlagIcon, title: 'Goals & Subjects', desc: 'Set a weekly hour goal per subject in Settings. Vyora tracks how close you are and flags what’s falling behind.' },
  { icon: ChartBarIcon, title: 'Analytics', desc: 'Study-hour trends, a 365-day heatmap, subject breakdowns, and a sleep tracker — see exactly where your time goes.' },
  { icon: TrophyIcon, title: 'Achievements', desc: 'Earn XP, level up, build streaks and unlock 18 badges (Early Bird, Night Owl, Marathoner…). Download a master certificate.' },
  { icon: SparklesIcon, title: 'AI Coach', desc: 'Tap “Analyze My Study Data” for personalised advice, or “Build My Study Plan” to auto-generate a week of study blocks and tasks into your calendar.' },
  { icon: BookOpenIcon, title: 'Timetable Analyzer', desc: 'Paste or upload your timetable. See projected vs actual hours, then let AI suggest a balanced, optimised schedule.' },
];

const calendarFeatures = [
  { icon: CalendarDaysIcon, title: 'Calendar', desc: 'Month, Week, Day and Agenda views. Click any day to add an event with a time, category and notes.' },
  { icon: ClipboardDocumentCheckIcon, title: 'Task Manager', desc: 'To-dos with priority, category and due dates. Filter by Today / Upcoming / All / Completed — tasks also show up on the calendar.' },
  { icon: BellIcon, title: 'Email Reminders', desc: 'Toggle “Email reminder” on any event or task and pick how early. Vyora emails you automatically before it’s due.' },
  { icon: MicrophoneIcon, title: 'AI Voice Assistant', desc: 'Tap the ✨ button. Speak or type: “add task finish chapter 5 by Friday”, “what’s on today?”, or “build me a study plan”. It replies out loud and reopens the mic for a hands-free chat.' },
];

/* ── Small components ───────────────────────────────────── */
const FeatureGrid = ({ items, accent }) => (
  <div className="grid sm:grid-cols-2 gap-4">
    {items.map((f, i) => (
      <div key={i} className="bg-navy-800/40 p-5 rounded-2xl border border-gray-700/50 hover:border-cyan-500/30 transition-colors">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
          <f.icon className="w-5 h-5" />
        </div>
        <h3 className="text-white font-semibold mb-1.5">{f.title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
      </div>
    ))}
  </div>
);

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
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight"
          >
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Vyora</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Vyora is two apps in one account — a <strong className="text-white">Study Tracker</strong> and a <strong className="text-white">Smart Calendar</strong> with an AI assistant. Here’s everything you can do and how to get started.
          </motion.p>
        </div>

        {/* Quick Start */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassCard className="p-8 border-l-4 border-l-emerald-500">
            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
              <RocketLaunchIcon className="w-8 h-8 text-emerald-400" />
              Quick Start — 4 steps
            </h2>
            <div className="space-y-4">
              {quickStart.map((s) => (
                <div key={s.n} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400 font-bold text-sm">{s.n}</div>
                  <div>
                    <h3 className="text-white font-semibold">{s.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Two apps */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-8 border-l-4 border-l-violet-500">
            <h2 className="text-2xl font-display font-bold text-white mb-3 flex items-center gap-3">
              <ArrowsRightLeftIcon className="w-8 h-8 text-violet-400" />
              One account, two apps
            </h2>
            <p className="text-gray-400 leading-relaxed mb-5">
              Use the <strong className="text-white">app switcher</strong> at the top-left (next to the Vyora logo) to jump between the two — your login and data stay the same.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-navy-800/40 p-5 rounded-2xl border border-purple-500/20">
                <p className="text-purple-300 font-bold mb-1">📚 Study Tracker</p>
                <p className="text-sm text-gray-400">Log study time, set goals, build streaks, view analytics, earn badges, and get AI coaching.</p>
              </div>
              <div className="bg-navy-800/40 p-5 rounded-2xl border border-cyan-500/20">
                <p className="text-cyan-300 font-bold mb-1">📅 Smart Calendar</p>
                <p className="text-sm text-gray-400">Plan events & tasks, get email reminders, and use the voice assistant to manage it all.</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Study Tracker features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassCard className="p-8 border-l-4 border-l-purple-500">
            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
              📚 Study Tracker — what you can do
            </h2>
            <FeatureGrid items={trackerFeatures} accent="bg-purple-500/15 text-purple-300" />
          </GlassCard>
        </motion.div>

        {/* Smart Calendar features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlassCard className="p-8 border-l-4 border-l-cyan-500">
            <h2 className="text-2xl font-display font-bold text-white mb-6 flex items-center gap-3">
              📅 Smart Calendar — what you can do
            </h2>
            <FeatureGrid items={calendarFeatures} accent="bg-cyan-500/15 text-cyan-300" />
          </GlassCard>
        </motion.div>

        {/* AI key note */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <GlassCard className="p-6 border-l-4 border-l-amber-500 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
              <KeyIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Unlock the AI features</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                The AI Coach, Timetable optimizer, study-plan builder and voice assistant need an AI key. Go to <strong className="text-white">Settings → API Keys</strong> and add an <strong>OpenAI</strong>, <strong>Gemini</strong>, or <strong>Anthropic</strong> key — <span className="text-amber-300">Gemini offers a free tier</span>. Your key is stored only in your browser. Everything else works without a key.
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Why it works */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard className="p-8 border-l-4 border-l-pink-500 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-9xl opacity-5">🧠</div>
            <h2 className="text-2xl font-display font-bold text-white mb-5 flex items-center gap-3">
              <ChartBarIcon className="w-7 h-7 text-pink-400" />
              Why it works
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="font-semibold text-white">The 1% compound effect</h3>
                <div className="bg-navy-900/50 p-4 rounded-xl border border-purple-500/20 text-center font-mono space-y-1">
                  <div className="text-red-400">1.00<sup className="text-xs">365</sup> = 1.00</div>
                  <div className="text-emerald-400 text-lg font-bold">1.01<sup className="text-xs">365</sup> = 37.78</div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Improving 1% a day makes you ~38× better in a year. Streaks, XP and levels are built to keep you showing up for that daily 1%.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Beat the forgetting curve</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Memory fades over time (Ebbinghaus). By tracking how often you revisit each subject — and letting the AI plan spaced revision sessions — Vyora helps you interrupt the forgetting curve and lock knowledge in.
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="flex justify-center pt-4"
        >
          <button
            onClick={handleReady}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full overflow-hidden shadow-[0_0_40px_rgba(147,51,234,0.4)] hover:shadow-[0_0_60px_rgba(147,51,234,0.6)] transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-500 ease-out skew-x-12" />
            <span>{isAlreadyReady ? 'Back to Dashboard' : "Got it — Let's Go!"}</span>
            <CheckCircleIcon className="w-6 h-6" />
          </button>
        </motion.div>

      </div>
    </Layout>
  );
};

export default UserManual;
