import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MicrophoneIcon, XMarkIcon, PaperAirplaneIcon, SpeakerWaveIcon, SpeakerXMarkIcon,
  SparklesIcon, CalendarDaysIcon, CheckCircleIcon, CheckIcon,
} from '@heroicons/react/24/outline';
import { useApp } from '../context/AppContext';
import { useCalendar } from '../context/CalendarContext';
import { useTasks } from '../context/TaskContext';
import { buildAssistantContext, runAssistant } from '../utils/assistant';
import { getAvailableProvider } from '../utils/claude';
import { categoryColor } from './CalendarLayout';

const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

const QUICK = [
  "What's on today?",
  "What's due this week?",
  "Suggest what to focus on",
];

const VoiceAssistant = () => {
  const { studyLogs, subjects, sleepLogs, exams, addToast } = useApp();
  const { events, addEvent } = useCalendar();
  const { tasks, addTask } = useTasks();

  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your Vyora assistant. Try “Add task finish chapter 5 by Friday” or “What should I focus on?”" },
  ]);
  const [pending, setPending] = useState(null); // { kind:'event'|'task', data, reply }
  const [loading, setLoading] = useState(false);
  const [speak, setSpeak] = useState(true);

  const recRef = useRef(null);
  const scrollRef = useRef(null);
  const hasKey = !!getAvailableProvider();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pending, loading]);

  const sayOut = useCallback((text) => {
    if (!speak || !text || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[*_#•]/g, ''));
      u.rate = 1.04; u.pitch = 1;
      window.speechSynthesis.speak(u);
    } catch (_) { /* ignore */ }
  }, [speak]);

  const submit = useCallback(async (text) => {
    const q = (text ?? '').trim();
    if (!q || loading) return;
    setInput('');
    setInterim('');
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setPending(null);
    setLoading(true);
    try {
      const ctx = buildAssistantContext({ events, tasks, studyLogs, subjects, sleepLogs, exams });
      const res = await runAssistant(q, ctx);
      const reply = res.reply || 'Done.';
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
      sayOut(reply);
      if (res.intent === 'create_event' && res.event?.title) {
        setPending({ kind: 'event', data: res.event });
      } else if (res.intent === 'create_task' && res.task?.title) {
        setPending({ kind: 'task', data: res.task });
      }
    } catch (err) {
      const msg = /api key/i.test(err.message) ? err.message : "Sorry, I couldn't process that. Try rephrasing.";
      setMessages((m) => [...m, { role: 'assistant', text: msg }]);
    } finally {
      setLoading(false);
    }
  }, [events, tasks, studyLogs, subjects, sleepLogs, exams, loading, sayOut]);

  const confirmPending = async () => {
    if (!pending) return;
    if (pending.kind === 'event') {
      const e = pending.data;
      await addEvent({
        title: e.title,
        date: e.date,
        allDay: !!e.allDay,
        startTime: e.allDay ? '' : (e.startTime || ''),
        endTime: e.allDay ? '' : (e.endTime || ''),
        category: e.category || 'general',
        color: categoryColor(e.category || 'general'),
        notes: '',
        reminderEmail: false,
        reminderAt: null,
      });
      addToast(`📅 Event added: ${e.title}`, 'success');
    } else {
      const t = pending.data;
      await addTask({
        title: t.title,
        notes: '',
        priority: t.priority || 'medium',
        category: t.category || 'general',
        dueDate: t.dueDate || '',
        dueTime: t.dueTime || '',
        reminderEmail: false,
        reminderAt: null,
      });
      addToast(`✅ Task added: ${t.title}`, 'success');
    }
    setMessages((m) => [...m, { role: 'assistant', text: 'Added it. ✅' }]);
    setPending(null);
  };

  const cancelPending = () => {
    setPending(null);
    setMessages((m) => [...m, { role: 'assistant', text: 'No problem — cancelled.' }]);
  };

  const toggleListen = () => {
    if (!SR) return;
    if (listening) { recRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (ev) => {
      let final = '', inter = '';
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const tr = ev.results[i][0].transcript;
        if (ev.results[i].isFinal) final += tr; else inter += tr;
      }
      setInterim(inter);
      if (final) { setInterim(''); submit(final); }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', boxShadow: '0 10px 30px rgba(124,58,237,0.5)' }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
        aria-label="Open assistant"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><XMarkIcon className="w-6 h-6" /></motion.span>
            : <motion.span key="s" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><SparklesIcon className="w-6 h-6" /></motion.span>}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-[90] w-[min(92vw,400px)] h-[min(70vh,560px)] flex flex-col rounded-3xl border border-cyan-700/25 overflow-hidden"
            style={{ background: 'rgba(13,16,33,0.98)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-navy-600">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-bold text-white leading-tight">Vyora Assistant</p>
                <p className="text-[11px] text-gray-500">{listening ? 'Listening…' : loading ? 'Thinking…' : 'Voice + AI'}</p>
              </div>
              <button onClick={() => setSpeak((s) => !s)} title={speak ? 'Mute replies' : 'Unmute replies'}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-navy-700 transition-colors">
                {speak ? <SpeakerWaveIcon className="w-5 h-5" /> : <SpeakerXMarkIcon className="w-5 h-5" />}
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
              {!hasKey && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-900/15 p-3 text-xs text-amber-300">
                  Add an AI key (OpenAI, Gemini, or Anthropic) in <Link to="/settings" className="underline font-semibold">Settings</Link> to enable the assistant.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-gradient-to-br from-purple-600 to-cyan-600 text-white rounded-br-sm' : 'bg-navy-800 text-gray-200 rounded-bl-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}

              {/* Pending confirm card */}
              <AnimatePresence>
                {pending && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="rounded-2xl border border-cyan-500/30 p-3.5" style={{ background: 'rgba(6,182,212,0.08)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-2">Confirm {pending.kind}</p>
                    {pending.kind === 'event' ? (
                      <div className="flex items-start gap-2.5">
                        <span className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: categoryColor(pending.data.category) }} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{pending.data.title}</p>
                          <p className="text-xs text-gray-400">{pending.data.date}{pending.data.allDay ? ' · All day' : pending.data.startTime ? ` · ${pending.data.startTime}` : ''} · {pending.data.category}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5">
                        <span className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: PRIORITY_COLOR[pending.data.priority] || PRIORITY_COLOR.medium }} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{pending.data.title}</p>
                          <p className="text-xs text-gray-400">{pending.data.dueDate ? `Due ${pending.data.dueDate}` : 'No due date'}{pending.data.dueTime ? ` · ${pending.data.dueTime}` : ''} · {pending.data.priority} · {pending.data.category}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button onClick={confirmPending} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)' }}>
                        <CheckIcon className="w-4 h-4" /> Confirm
                      </button>
                      <button onClick={cancelPending} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 bg-navy-700 hover:bg-navy-600 transition-colors">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-navy-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick chips */}
            {messages.length <= 2 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK.map((q) => (
                  <button key={q} onClick={() => submit(q)} disabled={loading}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-navy-600 text-gray-400 hover:text-white hover:border-cyan-700/40 transition-colors disabled:opacity-50">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-navy-600 flex items-center gap-2">
              {SR && (
                <button onClick={toggleListen}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${listening ? 'text-white' : 'text-gray-300 bg-navy-700 hover:bg-navy-600'}`}
                  style={listening ? { background: 'linear-gradient(135deg, #ef4444, #ec4899)' } : {}}
                  title={listening ? 'Stop' : 'Speak'}>
                  <MicrophoneIcon className="w-5 h-5" />
                  {listening && <motion.span className="absolute w-10 h-10 rounded-xl border-2 border-red-400" animate={{ scale: [1, 1.4], opacity: [0.7, 0] }} transition={{ duration: 1.2, repeat: Infinity }} />}
                </button>
              )}
              <input
                value={listening ? (interim || 'Listening…') : input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submit(input); }}
                placeholder="Ask or tell me anything…"
                disabled={loading}
                className="flex-1 bg-navy-800 border border-navy-600 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-700/50"
              />
              <button onClick={() => submit(input)} disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VoiceAssistant;
