import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../utils/supabaseClient';
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

// ── Left pane data ────────────────────────────────────────────────
const stats = [
  { value: '500K+', label: 'Study Hours' },
  { value: '95%',   label: 'Grade Boost' },
  { value: '4.8★',  label: 'App Rating'  },
];

// ── GitHub SVG icon ───────────────────────────────────────────────
const GithubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, checkEmailExists, addToast, loginWithGithub, sendMagicLink } = useApp();
  const navigate = useNavigate();
  const postAuthTarget = searchParams.get('app') === 'calendar' ? '/calendar' : '/dashboard';

  const handleMagicLink = async () => {
    setError('');
    if (!email) {
      setError('Please enter your email first to send a magic link.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await sendMagicLink(email.trim());
      addToast(`✨ Magic link sent to ${email}! Check your inbox.`, 'success', 8000);
    } catch (err) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !name) { setError('All fields are required'); return; }
    if (!isValidEmail(email)) { setError('Please enter a valid email address'); return; }
    if (name.trim().length < 2) { setError('Name must be at least 2 characters'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const exists = await checkEmailExists(email.trim());
      if (exists) { setError('This email is already registered. Please sign in instead.'); setLoading(false); return; }
      const otp = generateOTP();
      setGeneratedOtp(otp);
      setLoading(false);
      setShowOtpModal(true);
      addToast(`📧 OTP sent to ${email}: ${otp} (demo mode)`, 'info', 10000);
    } catch (err) { setLoading(false); setError(err.message || 'Validation failed'); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otpInput === generatedOtp) {
      setLoading(true);
      try {
        await register(name, email, password);
        addToast('🎉 Account verified! Welcome to Vyora.', 'success');
        setShowOtpModal(false);
        navigate(postAuthTarget);
      } catch (err) { setError(err.message || 'Registration failed'); }
      finally { setLoading(false); }
    } else { setError('Invalid OTP. Please try again.'); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required'); return; }
    if (!isValidEmail(email)) { setError('Please enter a valid email address'); return; }
    setLoading(true);
    try {
      await login(email.trim(), password);
      addToast('👋 Welcome back!', 'success');
      navigate(postAuthTarget);
    } catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  const switchMode = (m) => { setMode(m); setError(''); };

  return (
    <div className="min-h-screen flex bg-navy-950 overflow-hidden">

      {/* ── LEFT PANE ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] min-h-screen relative overflow-hidden p-10"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a0533 50%, #0d1b4b 100%)' }}>

        {/* Glowing orbs */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            <img src="/logo.png" alt="Vyora" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-display font-bold text-white">Vyora</span>
        </div>

        {/* Hero text */}
        <motion.div className="relative z-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div className="inline-flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 rounded-full px-4 py-1.5 text-xs text-purple-300 font-semibold mb-6 uppercase tracking-widest">
            ✦ Trusted by 10,000+ Students
          </div>
          <h1 className="text-4xl xl:text-5xl font-display font-bold text-white leading-tight mb-4">
            Study smarter,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">achieve more.</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-sm">
            Track study sessions, crush goals, analyze habits, and get AI-powered study assistance — all in one beautiful place.
          </p>

          {/* How to use */}
          <div className="flex flex-col gap-3 mb-10">
            {[
              { step: '01', icon: '📝', title: 'Log Your Sessions', desc: 'Add study sessions with subject, duration & notes using Quick Log.' },
              { step: '02', icon: '🎯', title: 'Set Your Goals', desc: 'Create daily & weekly targets, then track your streaks on the dashboard.' },
              { step: '03', icon: '📊', title: 'Analyze Progress', desc: 'View detailed charts and insights to see where you study best.' },
              { step: '04', icon: '🏆', title: 'Earn Achievements', desc: 'Unlock badges and certificates as you hit study milestones.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-lg">
                  {icon}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold mb-0.5">{title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Author Quote */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <svg className="w-7 h-7 text-purple-500/40 mb-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-gray-300 text-sm italic leading-relaxed mb-4">
              "Technology should empower us to reach our highest potential. I built Vyora to help students transform their ambitions into achievable habits and measurable success."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                Y
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Yashraj Kanawade</p>
                <p className="text-gray-500 text-xs">Creator of Vyora</p>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-gray-600 text-xs relative z-10">© {new Date().getFullYear()} Vyora. All rights reserved.</p>
      </div>

      {/* ── RIGHT PANE ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Mobile bg orbs */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-700/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-700/15 rounded-full blur-3xl" />
        </div>

        <motion.div className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl overflow-hidden">
              <img src="/logo.png" alt="Vyora" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-display font-bold text-white">Vyora</span>
          </div>

          {/* Header */}
          <AnimatePresence mode="wait">
            <motion.div key={mode + '-header'} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="mb-8">
              <h2 className="text-3xl font-display font-bold text-white mb-1">
                {mode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-gray-500 text-sm">
                {mode === 'login' ? 'Sign in to continue your journey' : 'Start your study journey with Vyora'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Social Buttons — only when Supabase auth is configured */}
          {isSupabaseConfigured() && (
            <>
              <div className="flex flex-col gap-3 mb-6">
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await loginWithGithub();
                    } catch (err) {
                      setError(err.message || 'GitHub Sign-In failed');
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  type="button"
                  className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200"
                >
                  <GithubIcon />
                  Continue with GitHub
                </button>
                <button
                  onClick={handleMagicLink}
                  disabled={loading}
                  type="button"
                  className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200"
                >
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  Send Magic Link
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Or with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            </>
          )}

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 15 : -15 }}
              transition={{ duration: 0.2 }}
              onSubmit={mode === 'login' ? handleLogin : handleSignup}
              className="flex flex-col gap-4"
            >
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="text" className="input-field pl-11" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input type="email" className="input-field pl-11" placeholder="you@school.edu" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Password</label>
                  {mode === 'login' && <button type="button" onClick={() => addToast('🚧 Password reset coming soon!', 'info')} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Forgot?</button>}
                </div>
                <div className="relative">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pl-11 pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                    {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-2.5">
                  {error}
                </motion.p>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary mt-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-base rounded-xl">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : mode === 'login' ? 'Sign in →' : 'Create Account →'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-1">
                {mode === 'login' ? (
                  <>Don't have an account?{' '}<button type="button" onClick={() => switchMode('signup')} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Sign up free</button></>
                ) : (
                  <>Already have an account?{' '}<button type="button" onClick={() => switchMode('login')} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Sign in</button></>
                )}
              </p>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── OTP Modal ── */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-card p-8 w-full max-w-sm"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📬</div>
                <h3 className="text-xl font-display font-bold text-white">Verify Your Email</h3>
                <p className="text-sm text-gray-400 mt-1">Enter the 6-digit OTP sent to <span className="text-purple-400">{email}</span></p>
                <div className="mt-3 p-3 bg-amber-900/30 border border-amber-500/30 rounded-lg">
                  <p className="text-xs text-amber-400">🔔 Demo mode: Your OTP is shown in the toast notification</p>
                </div>
              </div>
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <input type="text" className="input-field text-center text-2xl tracking-widest font-display font-bold"
                  placeholder="000000" maxLength={6} value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))} autoFocus />
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                <button type="submit" className="btn-primary">✅ Verify OTP</button>
                <button type="button" onClick={() => { setShowOtpModal(false); setOtpInput(''); setError(''); }}
                  className="text-sm text-gray-400 hover:text-white text-center transition-colors">
                  Cancel
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
