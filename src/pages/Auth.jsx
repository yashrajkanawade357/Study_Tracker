import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const Auth = () => {
  const [mode, setMode] = useState('login'); // login | signup | otp
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, checkEmailExists, addToast } = useApp();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !name) {
      setError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        setError('This email is already registered. Please sign in instead.');
        setLoading(false);
        return;
      }
      const otp = generateOTP();
      setGeneratedOtp(otp);
      setLoading(false);
      setShowOtpModal(true);
      addToast(`📧 OTP sent to ${email}: ${otp} (demo mode)`, 'info', 10000);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Validation failed');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otpInput === generatedOtp) {
      setLoading(true);
      try {
        await register(name, email, password);
        addToast('✅ Account verified! Welcome to StudyTracker.', 'success');
        setShowOtpModal(false);
        navigate('/dashboard');
      } catch (err) {
        setError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      addToast('👋 Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-700/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-700/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl" />
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 text-3xl mb-4 shadow-glow-purple"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            📚
          </motion.div>
          <h1 className="text-3xl font-display font-bold gradient-text">StudyTracker</h1>
          <p className="text-gray-400 mt-1 text-sm">Your AI-powered study companion</p>
        </div>

        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-navy-800 p-1 rounded-xl">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold font-display transition-all duration-200 capitalize ${
                  mode === m
                    ? 'bg-purple-600 text-white shadow-glow-sm-purple'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
              transition={{ duration: 0.2 }}
              onSubmit={mode === 'login' ? handleLogin : handleSignup}
              className="flex flex-col gap-4"
            >
              {mode === 'signup' && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPass ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
              </button>

              {mode === 'login' && (
                <p className="text-center text-xs text-gray-500">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setMode('signup')} className="text-purple-400 hover:text-purple-300">
                    Sign up free
                  </button>
                </p>
              )}
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* OTP Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card p-8 w-full max-w-sm"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📬</div>
                <h3 className="text-xl font-display font-bold text-white">Verify Your Email</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Enter the 6-digit OTP sent to <span className="text-purple-400">{email}</span>
                </p>
                <div className="mt-3 p-3 bg-amber-900/30 border border-amber-500/30 rounded-lg">
                  <p className="text-xs text-amber-400">🔔 Demo mode: Your OTP is shown in the toast notification</p>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                <input
                  type="text"
                  className="input-field text-center text-2xl tracking-widest font-display font-bold"
                  placeholder="000000"
                  maxLength={6}
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
                {error && (
                  <p className="text-red-400 text-sm text-center">{error}</p>
                )}
                <button type="submit" className="btn-primary">
                  ✅ Verify OTP
                </button>
                <button
                  type="button"
                  onClick={() => { setShowOtpModal(false); setOtpInput(''); setError(''); }}
                  className="text-sm text-gray-400 hover:text-white text-center"
                >
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
