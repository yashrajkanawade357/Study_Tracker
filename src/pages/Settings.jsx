import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { storage } from '../utils/storage';
import { getExamSubjects } from '../utils/examReadiness';
import {
  PlusIcon, TrashIcon, PencilIcon, Cog6ToothIcon,
  ArrowDownTrayIcon, ExclamationCircleIcon, CheckIcon
} from '@heroicons/react/24/outline';

const PRESET_COLORS = [
  '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#22d3ee', '#34d399', '#fbbf24', '#f87171',
  '#a78bfa', '#67e8f9', '#6ee7b7', '#fcd34d', '#fca5a5',
];

const Settings = () => {
  const {
    subjects, addSubject, updateSubject, removeSubject,
    exams, addExam, removeExam, updateExam,
    exportData, clearAllData, addToast, reload,
    userProfile, updateProfile
  } = useApp();

  const [newSubject, setNewSubject] = useState({ name: '', color: '#7c3aed', weeklyGoal: 5 });
  const [editingSubject, setEditingSubject] = useState(null);
  const [newExam, setNewExam] = useState({ name: '', date: '', subjects: [] });
  const [editingExam, setEditingExam] = useState(null);
  const [apiKeys, setApiKeys] = useState({
    anthropic: storage.get('anthropicApiKey') || '',
    openai: storage.get('openaiApiKey') || '',
    gemini: storage.get('geminiApiKey') || '',
  });
  const [savedKeys, setSavedKeys] = useState({
    anthropic: !!storage.get('anthropicApiKey'),
    openai: !!storage.get('openaiApiKey'),
    gemini: !!storage.get('geminiApiKey'),
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const [profileForm, setProfileForm] = useState({
    name: userProfile?.name || '',
    avatar: userProfile?.avatar || '🎓',
    bio: userProfile?.bio || '',
    linkedin: userProfile?.linkedin || '',
    instagram: userProfile?.instagram || '',
  });

  React.useEffect(() => {
    if (userProfile) {
      setProfileForm({
        name: userProfile.name || '',
        avatar: userProfile.avatar || '🎓',
        bio: userProfile.bio || '',
        linkedin: userProfile.linkedin || '',
        instagram: userProfile.instagram || '',
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ ...userProfile, ...profileForm });
      addToast('✅ Profile updated', 'success');
    } catch (err) {
      addToast('Error updating profile', 'error');
    }
  };

  const handleAddSubject = () => {
    if (!newSubject.name.trim()) { addToast('Subject name required', 'warning'); return; }
    if (subjects.some(s => s.name.toLowerCase() === newSubject.name.toLowerCase())) {
      addToast('Subject already exists', 'warning'); return;
    }
    addSubject(newSubject);
    setNewSubject({ name: '', color: '#7c3aed', weeklyGoal: 5 });
    addToast(`✅ Added ${newSubject.name}`, 'success');
  };

  const handleSaveSubject = (id, updates) => {
    updateSubject(id, updates);
    setEditingSubject(null);
    addToast('✅ Subject updated', 'success');
  };

  const handleRemoveSubject = (id, name) => {
    removeSubject(id);
    addToast(`Removed ${name}`, 'info');
  };

  const handleAddExam = () => {
    if (!newExam.name || !newExam.date || newExam.subjects.length === 0) {
      addToast('Add a name, date, and at least one subject', 'warning'); return;
    }
    addExam(newExam);
    setNewExam({ name: '', date: '', subjects: [] });
    addToast(`✅ Exam "${newExam.name}" added`, 'success');
  };

  const toggleExamSubject = (name) => setNewExam(v => ({
    ...v,
    subjects: v.subjects.includes(name) ? v.subjects.filter(n => n !== name) : [...v.subjects, name],
  }));

  const handleSaveApiKey = (provider) => {
    const storageKeys = {
      anthropic: 'anthropicApiKey',
      openai: 'openaiApiKey',
      gemini: 'geminiApiKey',
    };
    
    if (!apiKeys[provider]?.trim()) {
      handleRemoveApiKey(provider);
    } else {
      storage.set(storageKeys[provider], apiKeys[provider].trim());
      setSavedKeys(s => ({ ...s, [provider]: true }));
      addToast(`✅ ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key saved!`, 'success');
    }
  };

  const handleRemoveApiKey = (provider) => {
    const storageKeys = {
      anthropic: 'anthropicApiKey',
      openai: 'openaiApiKey',
      gemini: 'geminiApiKey',
    };
    storage.remove(storageKeys[provider]);
    setSavedKeys(s => ({ ...s, [provider]: false }));
    setApiKeys(k => ({ ...k, [provider]: '' }));
    addToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key removed.`, 'info');
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    addToast('All data cleared', 'info');
  };

  const sections = [
    { id: 'profile', label: '👤 Profile', icon: '👤' },
    { id: 'subjects', label: '📚 Subjects', icon: '📚' },
    { id: 'exams', label: '📅 Exams', icon: '📅' },
    { id: 'api', label: '🔑 API Keys', icon: '🔑' },
    { id: 'data', label: '💾 Data', icon: '💾' },
  ];

  return (
    <Layout title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1">
          <GlassCard className="p-4">
            <nav className="flex flex-col gap-1">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeSection === s.id
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-navy-700/30'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </GlassCard>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeSection === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <GlassCard className="p-6">
                  <h3 className="font-display font-bold text-white mb-6 text-lg">👤 Profile Settings</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Name</label>
                      <input
                        type="text"
                        className="input-field"
                        value={profileForm.name}
                        onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your display name"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Profile Photo (Emoji or Image URL)</label>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                          {(profileForm.avatar.startsWith('http') || profileForm.avatar.startsWith('data:')) ? 
                            <img src={profileForm.avatar} alt="Avatar" className="w-full h-full object-cover" /> : 
                            profileForm.avatar || '🎓'}
                        </div>
                        <input
                          type="text"
                          className="input-field flex-1"
                          value={profileForm.avatar}
                          onChange={e => setProfileForm(f => ({ ...f, avatar: e.target.value }))}
                          placeholder="Paste an image URL or type an emoji"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Bio</label>
                      <textarea
                        className="input-field min-h-[80px] resize-y"
                        value={profileForm.bio}
                        onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                        placeholder="Tell others a bit about your study goals..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">LinkedIn Profile URL (Optional)</label>
                      <input
                        type="url"
                        className="input-field"
                        value={profileForm.linkedin}
                        onChange={e => setProfileForm(f => ({ ...f, linkedin: e.target.value }))}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-400 mb-1.5 block uppercase tracking-wide">Instagram Username (Optional)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                        <input
                          type="text"
                          className="input-field pl-8"
                          value={profileForm.instagram}
                          onChange={e => setProfileForm(f => ({ ...f, instagram: e.target.value }))}
                          placeholder="username"
                        />
                      </div>
                    </div>

                    <button onClick={handleSaveProfile} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                      <CheckIcon className="w-4 h-4" />
                      Save Profile
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeSection === 'subjects' && (
              <motion.div
                key="subjects"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <GlassCard className="p-6">
                  <h3 className="font-display font-bold text-white mb-6 text-lg">📚 Manage Subjects</h3>

                  {/* Add Subject */}
                  <div className="bg-navy-800/50 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold text-gray-300 mb-3">Add New Subject</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Subject name"
                        value={newSubject.name}
                        onChange={e => setNewSubject(s => ({ ...s, name: e.target.value }))}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          className="input-field"
                          placeholder="Weekly goal (hrs)"
                          value={newSubject.weeklyGoal}
                          onChange={e => setNewSubject(s => ({ ...s, weeklyGoal: parseFloat(e.target.value) || 0 }))}
                          min="0" max="50"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-2">Color</p>
                      <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setNewSubject(s => ({ ...s, color: c }))}
                            className={`w-7 h-7 rounded-lg transition-all ${newSubject.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-navy-800' : 'hover:scale-110'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <input
                          type="color"
                          value={newSubject.color}
                          onChange={e => setNewSubject(s => ({ ...s, color: e.target.value }))}
                          className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                          title="Custom color"
                        />
                      </div>
                    </div>
                    <button onClick={handleAddSubject} className="btn-primary flex items-center gap-2">
                      <PlusIcon className="w-4 h-4" />
                      Add Subject
                    </button>
                  </div>

                  {/* Subject List */}
                  <div className="flex flex-col gap-2">
                    {subjects.map(s => (
                      <div key={s.id} className="p-4 rounded-xl bg-navy-800/30 hover:bg-navy-700/30 transition-colors">
                        {editingSubject === s.id ? (
                          <EditSubjectRow subject={s} onSave={updates => handleSaveSubject(s.id, updates)} onCancel={() => setEditingSubject(null)} />
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-white">{s.name}</p>
                              <p className="text-xs text-gray-500">Goal: {s.weeklyGoal}h/week</p>
                            </div>
                            <button onClick={() => setEditingSubject(s.id)} className="text-gray-400 hover:text-purple-400 transition-colors p-1">
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleRemoveSubject(s.id, s.name)} className="text-gray-400 hover:text-red-400 transition-colors p-1">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {subjects.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-6">No subjects yet. Add one above!</p>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeSection === 'exams' && (
              <motion.div
                key="exams"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <GlassCard className="p-6">
                  <h3 className="font-display font-bold text-white mb-6 text-lg">📅 Manage Exams</h3>

                  <div className="bg-navy-800/50 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold text-gray-300 mb-3">Add Exam</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Exam name (e.g. Physics Final)"
                        value={newExam.name}
                        onChange={e => setNewExam(v => ({ ...v, name: e.target.value }))}
                      />
                      <input
                        type="date"
                        className="input-field"
                        value={newExam.date}
                        onChange={e => setNewExam(v => ({ ...v, date: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400 mb-2">Subjects covered — pick one or more</p>
                        <div className="flex flex-wrap gap-2">
                          {subjects.map(s => {
                            const sel = newExam.subjects.includes(s.name);
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => toggleExamSubject(s.name)}
                                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${sel ? 'text-white border-transparent' : 'text-gray-300 border-white/10 hover:border-white/30'}`}
                                style={sel ? { background: s.color } : {}}
                              >
                                {sel ? '✓ ' : ''}{s.name}
                              </button>
                            );
                          })}
                          {subjects.length === 0 && (
                            <p className="text-gray-500 text-xs">Add subjects first in the Subjects tab.</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button onClick={handleAddExam} className="btn-primary flex items-center gap-2">
                      <PlusIcon className="w-4 h-4" />
                      Add Exam
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {exams.map(exam => {
                      const days = Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={exam.id} className="p-4 rounded-xl bg-navy-800/30">
                          {editingExam === exam.id ? (
                            <EditExamRow
                              exam={exam}
                              subjects={subjects}
                              onSave={(updates) => { updateExam(exam.id, updates); setEditingExam(null); addToast('✅ Exam updated', 'success'); }}
                              onCancel={() => setEditingExam(null)}
                            />
                          ) : (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold text-white">{exam.name}</p>
                                <p className="text-xs text-gray-500">{new Date(exam.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {getExamSubjects(exam).map(name => {
                                    const subj = subjects.find(s => s.name === name);
                                    const c = subj?.color || '#7c3aed';
                                    return (
                                      <span key={name} className="text-[11px] px-2 py-0.5 rounded-full"
                                        style={{ background: `${c}26`, color: c }}>
                                        {name}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${days < 0 ? 'bg-gray-800 text-gray-500' : days <= 3 ? 'bg-red-900/40 text-red-400' : days <= 7 ? 'bg-amber-900/40 text-amber-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                                  {days < 0 ? 'Past' : `${days}d`}
                                </span>
                                <button onClick={() => setEditingExam(exam.id)} className="text-gray-400 hover:text-purple-400 transition-colors p-1" title="Edit exam">
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button onClick={() => removeExam(exam.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1" title="Delete exam">
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {exams.length === 0 && <p className="text-gray-500 text-sm text-center py-6">No exams added yet.</p>}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeSection === 'api' && (
              <motion.div
                key="api"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <GlassCard className="p-6">
                  <h3 className="font-display font-bold text-white mb-1 text-lg">🔑 API Keys</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    Your keys are stored locally in your browser and never sent to our servers.
                  </p>

                  <div className="flex flex-col gap-6">
                    {[
                      {
                        key: 'anthropic',
                        label: 'Anthropic (Claude)',
                        icon: '🤖',
                        placeholder: 'sk-ant-api03-...',
                        usedFor: 'AI Suggestions & Timetable Analyzer',
                        docsUrl: 'https://console.anthropic.com',
                        docsLabel: 'console.anthropic.com',
                        color: 'text-purple-400',
                        border: 'border-purple-500/30',
                        bg: 'bg-purple-900/10',
                      },
                      {
                        key: 'openai',
                        label: 'OpenAI (GPT)',
                        icon: '✨',
                        placeholder: 'sk-...',
                        usedFor: 'GPT-powered features',
                        docsUrl: 'https://platform.openai.com/api-keys',
                        docsLabel: 'platform.openai.com',
                        color: 'text-emerald-400',
                        border: 'border-emerald-500/30',
                        bg: 'bg-emerald-900/10',
                      },
                      {
                        key: 'gemini',
                        label: 'Google Gemini',
                        icon: '💎',
                        placeholder: 'AIza...',
                        usedFor: 'Gemini-powered features',
                        docsUrl: 'https://aistudio.google.com/app/apikey',
                        docsLabel: 'aistudio.google.com',
                        color: 'text-cyan-400',
                        border: 'border-cyan-500/30',
                        bg: 'bg-cyan-900/10',
                      },
                    ].map(provider => (
                      <div key={provider.key} className={`p-4 rounded-xl border ${provider.border} ${provider.bg}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{provider.icon}</span>
                          <h4 className={`font-semibold text-sm ${provider.color}`}>{provider.label}</h4>
                          {savedKeys[provider.key] && (
                            <span className="ml-auto text-xs bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">✅ Saved</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Used for: <span className="text-gray-400">{provider.usedFor}</span></p>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="password"
                            className="input-field font-mono text-sm flex-1"
                            placeholder={provider.placeholder}
                            value={apiKeys[provider.key]}
                            onChange={e => setApiKeys(k => ({ ...k, [provider.key]: e.target.value }))}
                          />
                          <button
                            onClick={() => handleSaveApiKey(provider.key)}
                            className="btn-primary px-4 flex items-center gap-1.5 whitespace-nowrap"
                          >
                            <CheckIcon className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            onClick={() => handleRemoveApiKey(provider.key)}
                            className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-red-500/20"
                            title="Remove API Key"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600">
                          Get your key at{' '}
                          <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer" className={`${provider.color} hover:underline`}>
                            {provider.docsLabel}
                          </a>
                        </p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {activeSection === 'data' && (
              <motion.div
                key="data"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <GlassCard className="p-6">
                  <h3 className="font-display font-bold text-white mb-6 text-lg">💾 Data Management</h3>

                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl bg-navy-800/30 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">Export All Data</p>
                        <p className="text-xs text-gray-500 mt-0.5">Download all your study data as JSON</p>
                      </div>
                      <button onClick={exportData} className="btn-cyan flex items-center gap-2">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Export JSON
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-red-900/10 border border-red-500/20 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-red-400">Clear All Data</p>
                        <p className="text-xs text-gray-500 mt-0.5">⚠️ This action cannot be undone</p>
                      </div>
                      <button
                        onClick={() => setShowClearConfirm(true)}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-all flex items-center gap-2"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Clear Data
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Clear Confirm Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card p-8 w-full max-w-sm text-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <ExclamationCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold text-white mb-2">Clear All Data?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This will permanently delete all study logs, subjects, exams, achievements, and profile data.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowClearConfirm(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleClearData} className="flex-1 py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all">Delete All</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

const EditSubjectRow = ({ subject, onSave, onCancel }) => {
  const [name, setName] = useState(subject.name);
  const [color, setColor] = useState(subject.color);
  const [goal, setGoal] = useState(subject.weeklyGoal);

  const PRESET_COLORS = [
    '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#22d3ee', '#34d399', '#fbbf24', '#f87171',
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input type="text" className="input-field flex-1 text-sm" value={name} onChange={e => setName(e.target.value)} />
        <input type="number" className="input-field w-24 text-sm" value={goal} onChange={e => setGoal(parseFloat(e.target.value))} min="0" max="50" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} className={`w-6 h-6 rounded-md ${color === c ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ name, color, weeklyGoal: goal })} className="btn-primary flex-1 text-sm py-2">Save</button>
        <button onClick={onCancel} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
      </div>
    </div>
  );
};

const EditExamRow = ({ exam, subjects, onSave, onCancel }) => {
  const [name, setName] = useState(exam.name);
  const [date, setDate] = useState(exam.date);
  const [picked, setPicked] = useState(getExamSubjects(exam));

  const toggle = (n) => setPicked(p => p.includes(n) ? p.filter(x => x !== n) : [...p, n]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <input type="text" className="input-field text-sm" value={name} onChange={e => setName(e.target.value)} placeholder="Exam name" />
        <input type="date" className="input-field text-sm" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-2">Subjects covered — pick one or more</p>
        <div className="flex flex-wrap gap-2">
          {subjects.map(s => {
            const sel = picked.includes(s.name);
            return (
              <button key={s.id} type="button" onClick={() => toggle(s.name)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${sel ? 'text-white border-transparent' : 'text-gray-300 border-white/10 hover:border-white/30'}`}
                style={sel ? { background: s.color } : {}}>
                {sel ? '✓ ' : ''}{s.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => { if (name && date && picked.length) onSave({ name, date, subjects: picked }); }}
          className="btn-primary flex-1 text-sm py-2">Save</button>
        <button onClick={onCancel} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
      </div>
    </div>
  );
};

export default Settings;
