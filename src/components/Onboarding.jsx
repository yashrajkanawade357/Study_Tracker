import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { storage } from '../utils/storage';
import {
  CheckIcon, PlusIcon, TrashIcon, ArrowRightIcon, ArrowLeftIcon,
  UserIcon, BookOpenIcon, KeyIcon, ShareIcon,
} from '@heroicons/react/24/outline';

const PRESET_COLORS = [
  '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#22d3ee', '#34d399', '#fbbf24', '#f87171',
];

const EMOJI_AVATARS = ['🎓', '📚', '🚀', '🧠', '⭐', '🔥', '💡', '🦉', '🎯', '✨'];

const SUGGESTED_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Computer Science', 'History',
];

const STEPS = [
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'subjects', label: 'Subjects', icon: BookOpenIcon },
  { id: 'social', label: 'Social', icon: ShareIcon },
  { id: 'api', label: 'AI Key', icon: KeyIcon },
];

const API_STORAGE_KEYS = {
  gemini: 'geminiApiKey',
  anthropic: 'anthropicApiKey',
};

const Onboarding = () => {
  const {
    isAuthenticated, userProfile, updateProfile,
    subjects, addSubject, removeSubject, completeSetup, addToast,
  } = useApp();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ name: '', avatar: '🎓', bio: '', linkedin: '', instagram: '' });
  const [newSubject, setNewSubject] = useState({ name: '', color: '#7c3aed', weeklyGoal: 5 });
  const [apiKeys, setApiKeys] = useState({
    gemini: storage.get('geminiApiKey') || '',
    anthropic: storage.get('anthropicApiKey') || '',
  });
  const initRef = useRef(false);

  // Populate the profile form from the loaded user profile once.
  useEffect(() => {
    if (userProfile && !initRef.current) {
      initRef.current = true;
      setProfile({
        name: userProfile.name || '',
        avatar: userProfile.avatar || '🎓',
        bio: userProfile.bio || '',
        linkedin: userProfile.linkedin || '',
        instagram: userProfile.instagram || '',
      });
    }
  }, [userProfile]);

  // Only show for freshly-registered users who have seen the manual but not set up.
  const show = isAuthenticated && userProfile && userProfile.hasSeenManual && userProfile.hasCompletedSetup === false;
  if (!show) return null;

  const isAvatarImage = profile.avatar.startsWith('http') || profile.avatar.startsWith('data:');

  const handleAddSubject = (preset) => {
    const subj = preset || newSubject;
    const name = (subj.name || '').trim();
    if (!name) { addToast('Subject name required', 'warning'); return; }
    if (subjects.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      addToast('Subject already added', 'warning'); return;
    }
    addSubject({
      name,
      color: subj.color || PRESET_COLORS[subjects.length % PRESET_COLORS.length],
      weeklyGoal: subj.weeklyGoal || 5,
    });
    setNewSubject({ name: '', color: '#7c3aed', weeklyGoal: 5 });
  };

  const finish = async () => {
    setSaving(true);
    try {
      // Save profile edits and mark setup complete in a SINGLE update so the
      // completion flag and the profile fields can't clobber each other.
      Object.entries(apiKeys).forEach(([provider, val]) => {
        const trimmed = (val || '').trim();
        if (trimmed) storage.set(API_STORAGE_KEYS[provider], trimmed);
      });
      await updateProfile({
        ...userProfile,
        ...profile,
        name: profile.name.trim() || userProfile.name,
        hasCompletedSetup: true,
      });
      addToast("🎉 You're all set! Welcome to Vyora.", 'success', 5000);
    } catch (err) {
      addToast('Something went wrong saving your setup.', 'error');
      setSaving(false);
    }
  };

  const skip = () => {
    completeSetup();
    addToast('You can finish setup anytime in Settings.', 'info');
  };

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-white/10 overflow-hidden"
        style={{ background: 'rgba(15,15,30,0.97)', backdropFilter: 'blur(40px)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}
      >
        {/* Header / progress */}
        <div className="p-6 md:p-8 border-b border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-1">Account Setup · Step {step + 1} of {STEPS.length}</p>
              <h2 className="text-2xl font-display font-bold text-white">Let's set up your Vyora</h2>
            </div>
            <button onClick={skip} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Skip for now</button>
          </div>
          {/* Stepper */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step, current = i === step;
              return (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all flex-shrink-0 ${
                      current ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                      : done ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-white/[0.03] border-white/10 text-gray-600'
                    }`}>
                      {done ? <CheckIcon className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${current ? 'text-white' : done ? 'text-gray-400' : 'text-gray-600'}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-px ${done ? 'bg-emerald-500/40' : 'bg-white/10'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            {/* ── Step 1: Profile ── */}
            {step === 0 && (
              <motion.div key="profile" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="space-y-5">
                <p className="text-gray-400 text-sm">Tell us a little about yourself. This shows on your profile and certificate.</p>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Display Name</label>
                  <input className="input-field" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Avatar</label>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                      {isAvatarImage ? <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (profile.avatar || '🎓')}
                    </div>
                    <input className="input-field flex-1" value={profile.avatar} onChange={e => setProfile(p => ({ ...p, avatar: e.target.value }))} placeholder="Emoji or image URL" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_AVATARS.map(em => (
                      <button key={em} onClick={() => setProfile(p => ({ ...p, avatar: em }))}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${profile.avatar === em ? 'bg-purple-600/30 ring-2 ring-purple-500/50' : 'bg-white/[0.04] hover:bg-white/10'}`}>
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Bio (optional)</label>
                  <textarea className="input-field min-h-[80px] resize-y" value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="What are you studying for?" />
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Subjects ── */}
            {step === 1 && (
              <motion.div key="subjects" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="space-y-5">
                <p className="text-gray-400 text-sm">Add the subjects you're tracking and a weekly hour goal for each. You can change these anytime.</p>

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SUBJECTS.filter(name => !subjects.some(s => s.name.toLowerCase() === name.toLowerCase())).map(name => (
                    <button key={name} onClick={() => handleAddSubject({ name })}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 border border-white/10 hover:border-purple-500/40 hover:text-white transition-all flex items-center gap-1.5"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <PlusIcon className="w-3 h-3" /> {name}
                    </button>
                  ))}
                </div>

                {/* Custom add */}
                <div className="bg-navy-800/50 rounded-xl p-4 border border-white/[0.06]">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <input className="input-field col-span-2" placeholder="Subject name" value={newSubject.name}
                      onChange={e => setNewSubject(s => ({ ...s, name: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddSubject(); }} />
                    <input type="number" className="input-field" placeholder="hrs/wk" min="0" max="50" value={newSubject.weeklyGoal}
                      onChange={e => setNewSubject(s => ({ ...s, weeklyGoal: parseFloat(e.target.value) || 0 }))} />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.slice(0, 8).map(c => (
                        <button key={c} onClick={() => setNewSubject(s => ({ ...s, color: c }))}
                          className={`w-6 h-6 rounded-md transition-all ${newSubject.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-navy-800' : 'hover:scale-110'}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <button onClick={() => handleAddSubject()} className="btn-primary flex items-center gap-1.5 whitespace-nowrap text-sm">
                      <PlusIcon className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="flex flex-col gap-2">
                  {subjects.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-navy-800/30">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                        <p className="text-xs text-gray-500">Goal: {s.weeklyGoal}h/week</p>
                      </div>
                      <button onClick={() => removeSubject(s.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {subjects.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No subjects yet — add one above.</p>}
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Social ── */}
            {step === 2 && (
              <motion.div key="social" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="space-y-5">
                <p className="text-gray-400 text-sm">Add your social handles (optional). They appear on your shareable profile.</p>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">LinkedIn URL</label>
                  <input type="url" className="input-field" value={profile.linkedin} onChange={e => setProfile(p => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Instagram Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                    <input className="input-field pl-8" value={profile.instagram} onChange={e => setProfile(p => ({ ...p, instagram: e.target.value }))} placeholder="username" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: API Key ── */}
            {step === 3 && (
              <motion.div key="api" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} className="space-y-5">
                <p className="text-gray-400 text-sm">
                  Optional: add an AI key to unlock the AI Study Coach and Timetable Analyzer. Keys are stored locally in your browser only — never on our servers. You can add these later in Settings.
                </p>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide flex items-center gap-2">💎 Google Gemini Key</label>
                  <input type="password" className="input-field font-mono text-sm" placeholder="AIza..." value={apiKeys.gemini}
                    onChange={e => setApiKeys(k => ({ ...k, gemini: e.target.value }))} />
                  <p className="text-xs text-gray-600 mt-1">Get one free at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">aistudio.google.com</a></p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide flex items-center gap-2">🤖 Anthropic (Claude) Key</label>
                  <input type="password" className="input-field font-mono text-sm" placeholder="sk-ant-api03-..." value={apiKeys.anthropic}
                    onChange={e => setApiKeys(k => ({ ...k, anthropic: e.target.value }))} />
                  <p className="text-xs text-gray-600 mt-1">Get one at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">console.anthropic.com</a></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 border-t border-white/5 flex items-center justify-between gap-3">
          <button onClick={back} disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-0 disabled:cursor-default">
            <ArrowLeftIcon className="w-4 h-4" /> Back
          </button>
          {isLast ? (
            <button onClick={finish} disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><CheckIcon className="w-4 h-4" /> Finish & Enter Vyora</>}
            </button>
          ) : (
            <button onClick={next} className="btn-primary flex items-center gap-2">
              Continue <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
