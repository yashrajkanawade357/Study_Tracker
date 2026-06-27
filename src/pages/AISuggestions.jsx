import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useCalendar } from '../context/CalendarContext';
import { useTasks } from '../context/TaskContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import StudyPlanPreview from '../components/StudyPlanPreview';
import ExamReadiness from '../components/ExamReadiness';
import WeeklyCheckin from '../components/WeeklyCheckin';
import { callAI, buildStudyContext, getAvailableProvider } from '../utils/claude';
import { generateStudyPlan } from '../utils/studyPlan';
import { PaperAirplaneIcon, SparklesIcon, ExclamationCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { storage } from '../utils/storage';

const PROVIDER_NAME = { openai: 'GPT-4o Mini', anthropic: 'Claude Sonnet', gemini: 'Gemini 1.5 Flash' };

const SuggestionCard = ({ icon, title, content, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-card p-5 border-l-4 ${color}`}
  >
    <div className="flex items-start gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h4 className="font-display font-bold text-white mb-2">{title}</h4>
        <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  </motion.div>
);

const LoadingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="w-2 h-2 rounded-full bg-purple-500"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
      />
    ))}
  </div>
);

const AISuggestions = () => {
  const { studyLogs, subjects, sleepLogs, exams, addToast } = useApp();
  const { events, addEvent } = useCalendar();
  const { addTask } = useTasks();
  const [suggestions, setSuggestions] = useState(null);
  const [plan, setPlan] = useState(null);
  const [planning, setPlanning] = useState(false);
  const [addingPlan, setAddingPlan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  const provider = getAvailableProvider();
  const hasApiKey = !!provider;

  const fetchSuggestions = async () => {
    setLoading(true);
    setError('');
    try {
      const context = buildStudyContext(studyLogs, subjects, sleepLogs, exams);
      const systemPrompt = `You are an expert study coach AI. Analyze the student's study data and provide actionable, personalized suggestions. Be specific, encouraging, and data-driven. Format your response as JSON with these exact keys:
{
  "redistribute": "...",
  "riskSubjects": "...", 
  "peakPerformance": "...",
  "weeklySummary": "..."
}
Keep each section concise (2-4 sentences).`;

      const userMessage = `Here's my study data for analysis:
${JSON.stringify(context, null, 2)}

Please analyze this and provide suggestions in the JSON format specified.`;

      const response = await callAI([{ role: 'user', content: userMessage }], systemPrompt);
      
      // Parse JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setSuggestions(parsed);
      } else {
        setSuggestions({
          redistribute: response,
          riskSubjects: '',
          peakPerformance: '',
          weeklySummary: '',
        });
      }
    } catch (err) {
      setError(err.message);
      addToast(`AI Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const buildPlan = async () => {
    setPlanning(true);
    setPlan(null);
    try {
      const generated = await generateStudyPlan({ subjects, exams, studyLogs, events });
      setPlan(generated);
    } catch (err) {
      addToast(`AI Error: ${err.message}`, 'error');
    } finally {
      setPlanning(false);
    }
  };

  const addPlanToCalendar = async (p) => {
    setAddingPlan(true);
    try {
      for (const e of p.events || []) {
        await addEvent({
          title: e.title, date: e.date, allDay: false,
          startTime: e.startTime || '', endTime: e.endTime || '',
          category: 'study', color: '#06b6d4', notes: '', reminderEmail: false, reminderAt: null,
        });
      }
      for (const t of p.tasks || []) {
        await addTask({
          title: t.title, notes: '', priority: t.priority || 'medium', category: 'study',
          dueDate: t.dueDate || '', dueTime: '', reminderEmail: false, reminderAt: null,
        });
      }
      const n = (p.events?.length || 0) + (p.tasks?.length || 0);
      addToast(`🗓️ Added ${n} items to Smart Calendar`, 'success', 5000);
    } finally {
      setAddingPlan(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const context = buildStudyContext(studyLogs, subjects, sleepLogs, exams);
      const systemPrompt = `You are a personal AI study coach. The student's data: ${JSON.stringify(context)}. Answer concisely and helpfully.`;
      
      const history = chatMessages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: userMsg });

      const response = await callAI(history, systemPrompt);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const suggestionCards = suggestions ? [
    { icon: '⚖️', title: 'Redistribute Study Time', content: suggestions.redistribute, color: 'border-purple-500' },
    { icon: '⚠️', title: 'At-Risk Subjects', content: suggestions.riskSubjects, color: 'border-red-500' },
    { icon: '⚡', title: 'Peak Performance Tips', content: suggestions.peakPerformance, color: 'border-cyan-500' },
    { icon: '📊', title: 'Weekly Improvement Summary', content: suggestions.weeklySummary, color: 'border-emerald-500' },
  ] : [];

  return (
    <Layout title="AI Coach">
      {!hasApiKey && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl border border-amber-500/40 bg-amber-900/20 flex items-start gap-3"
        >
          <ExclamationCircleIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400">API Key Required</p>
              <p className="text-sm text-amber-200 mt-2">
                Go to <strong>Settings → API Keys</strong> and paste your OpenAI, Anthropic, or Gemini API key to enable AI features.
              </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* AI Suggestions Panel */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-xl">AI Study Coach</h3>
                  <p className="text-xs text-gray-400">Powered by {provider === 'openai' ? 'GPT-4o Mini' : provider === 'anthropic' ? 'Claude Sonnet' : 'Gemini 1.5 Flash'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={buildPlan}
                  disabled={planning || !hasApiKey}
                  className="btn-cyan flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {planning ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Building...</>
                  ) : <><CalendarDaysIcon className="w-4 h-4" /> Build My Study Plan</>}
                </button>
                <button
                  onClick={fetchSuggestions}
                  disabled={loading || !hasApiKey}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : '✨ Analyze My Study Data'}
                </button>
              </div>
            </div>

            {plan && (
              <div className="mb-6">
                <StudyPlanPreview plan={plan} onAddAll={addPlanToCalendar} onCancel={() => setPlan(null)} adding={addingPlan} />
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-purple-700/30 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">{PROVIDER_NAME[provider] || 'Your AI coach'} is analyzing your study patterns...</p>
                  <p className="text-gray-400 text-sm mt-1">This may take a few seconds</p>
                </div>
              </div>
            )}

            {!loading && !suggestions && !error && (
              <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                <div className="text-5xl animate-float">🤖</div>
                <p className="text-gray-400 text-sm max-w-sm">
                  Click "Analyze My Study Data" to get personalized AI suggestions based on your study habits, goals, and sleep patterns.
                </p>
              </div>
            )}

            {suggestions && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {suggestionCards.filter(c => c.content).map((card, i) => (
                  <SuggestionCard key={i} {...card} />
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Exam Readiness + Weekly Check-in */}
      <ExamReadiness />
      <WeeklyCheckin />

      {/* Chat Section */}
      <GlassCard className="p-6">
        <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          💬 Ask AI Coach Anything
        </h3>

        {/* Chat History */}
        <div className="bg-navy-800/50 rounded-xl p-4 h-[500px] overflow-y-auto flex flex-col gap-3 mb-4">
          {chatMessages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
              <p className="text-gray-500 text-sm">Ask me anything about your study habits!</p>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[
                  'How should I prepare for Physics exam in 5 days?',
                  'Which subject needs the most attention?',
                  'Create a study schedule for this week',
                ].map(q => (
                  <button
                    key={q}
                    onClick={() => setChatInput(q)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-600 text-gray-400 hover:text-white transition-colors border border-gray-700/30"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-purple-600/30 border border-purple-500/30 text-white'
                      : 'bg-navy-700/50 border border-gray-700/30 text-gray-200'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <SparklesIcon className="w-3 h-3 text-cyan-400" />
                      <span className="text-xs text-cyan-400 font-semibold">AI Coach</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-navy-700/50 border border-gray-700/30 rounded-xl">
                <LoadingDots />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleChat} className="flex gap-3">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Ask your AI coach..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            disabled={chatLoading || !hasApiKey}
          />
          <button
            type="submit"
            disabled={chatLoading || !chatInput.trim() || !hasApiKey}
            className="btn-primary px-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>
      </GlassCard>
    </Layout>
  );
};

export default AISuggestions;
