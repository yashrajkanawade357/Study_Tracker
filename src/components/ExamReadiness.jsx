import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useCalendar } from '../context/CalendarContext';
import { useTasks } from '../context/TaskContext';
import GlassCard from './GlassCard';
import StudyPlanPreview from './StudyPlanPreview';
import { computeExamReadiness } from '../utils/examReadiness';
import { generateStudyPlan } from '../utils/studyPlan';
import { getAvailableProvider } from '../utils/claude';
import { AcademicCapIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Ring = ({ percent, color, size = 76 }) => {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90 flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={c} initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: c * (1 - percent / 100) }}
        viewport={{ once: true }} transition={{ duration: 1, ease: 'easeOut' }}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="rotate-90"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }} fill="white" fontSize="16" fontWeight="700">{percent}%</text>
    </svg>
  );
};

const ExamReadiness = () => {
  const { exams, studyLogs, subjects, addToast } = useApp();
  const { addEvent } = useCalendar();
  const { addTask } = useTasks();
  const hasKey = !!getAvailableProvider();

  const [planFor, setPlanFor] = useState(null); // exam id being planned
  const [plan, setPlan] = useState(null);
  const [adding, setAdding] = useState(false);

  const upcoming = useMemo(() => {
    return exams
      .map((e) => ({ ...e, r: computeExamReadiness(e, studyLogs, subjects) }))
      .filter((e) => e.r.daysLeft >= 0)
      .sort((a, b) => a.r.daysLeft - b.r.daysLeft);
  }, [exams, studyLogs, subjects]);

  const buildPrep = async (exam) => {
    setPlanFor(exam.id);
    setPlan(null);
    try {
      const generated = await generateStudyPlan(
        { subjects, exams, studyLogs, events: [] },
        `${exam.subject} for the exam "${exam.name}" on ${exam.date}`
      );
      setPlan(generated);
    } catch (err) {
      addToast(`AI Error: ${err.message}`, 'error');
      setPlanFor(null);
    }
  };

  const addPlan = async (p) => {
    setAdding(true);
    try {
      for (const e of p.events || []) {
        await addEvent({ title: e.title, date: e.date, allDay: false, startTime: e.startTime || '', endTime: e.endTime || '', category: 'study', color: '#06b6d4', notes: '', reminderEmail: false, reminderAt: null });
      }
      for (const t of p.tasks || []) {
        await addTask({ title: t.title, notes: '', priority: t.priority || 'medium', category: 'study', dueDate: t.dueDate || '', dueTime: '', reminderEmail: false, reminderAt: null });
      }
      const n = (p.events?.length || 0) + (p.tasks?.length || 0);
      addToast(`🗓️ Added ${n} items to Smart Calendar`, 'success', 5000);
    } finally {
      setAdding(false);
      setPlan(null);
      setPlanFor(null);
    }
  };

  if (upcoming.length === 0) return null;

  return (
    <GlassCard className="p-6 mb-6 border-l-4 border-l-amber-500">
      <h3 className="font-display font-bold text-white text-lg mb-1 flex items-center gap-2">
        <AcademicCapIcon className="w-6 h-6 text-amber-400" /> Exam Readiness
      </h3>
      <p className="text-xs text-gray-500 mb-5">An estimate from your logged hours, recent pace, and time left. Add exams in Settings.</p>

      <div className="flex flex-col gap-3">
        {upcoming.map((exam) => (
          <div key={exam.id} className="rounded-2xl bg-navy-800/40 border border-gray-700/40 p-4">
            <div className="flex items-center gap-4">
              <Ring percent={exam.r.percent} color={exam.r.color} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-white truncate">{exam.name}</p>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: `${exam.r.color}22`, color: exam.r.color }}>{exam.r.label}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{exam.subject} · {exam.r.daysLeft === 0 ? 'Today' : `${exam.r.daysLeft}d left`}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-gray-400">
                  <span>📚 {exam.r.studiedHours}h studied</span>
                  <span>🎯 {exam.r.target}h target</span>
                  <span>⚡ {exam.r.last7}h last 7 days</span>
                </div>
                <p className="text-xs text-gray-300 mt-2">{exam.r.tip}</p>
              </div>
              <button
                onClick={() => buildPrep(exam)}
                disabled={!hasKey || (planFor === exam.id && !plan)}
                className="btn-cyan text-xs flex items-center gap-1.5 self-start flex-shrink-0 disabled:opacity-50"
                title={hasKey ? 'Generate a prep plan' : 'Add an AI key in Settings'}
              >
                {planFor === exam.id && !plan
                  ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Planning…</>
                  : <><SparklesIcon className="w-3.5 h-3.5" /> Prep plan</>}
              </button>
            </div>

            {planFor === exam.id && plan && (
              <div className="mt-3">
                <StudyPlanPreview plan={plan} onAddAll={addPlan} onCancel={() => { setPlan(null); setPlanFor(null); }} adding={adding} compact />
              </div>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default ExamReadiness;
