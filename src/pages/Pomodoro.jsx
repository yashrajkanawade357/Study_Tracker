import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { PlayIcon, PauseIcon, StopIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { formatDisplay, formatDate } from '../utils/dateUtils';

const FOCUS_DURATION = 25 * 60; // 25 min in seconds
const BREAK_DURATION = 5 * 60;  // 5 min

const CircularTimer = ({ progress, isBreak, timeLeft, size = 240 }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const strokeColor = isBreak ? '#06b6d4' : '#7c3aed';
  const glowColor = isBreak ? 'rgba(6,182,212,0.4)' : 'rgba(124,58,237,0.4)';
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={10}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dashoffset 1s linear',
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="text-center z-10">
        <div className={`text-5xl font-display font-bold ${isBreak ? 'text-cyan-400' : 'text-purple-400'}`}
          style={{ textShadow: `0 0 20px ${glowColor}` }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-400 mt-1 font-semibold">
          {isBreak ? '☕ Break Time' : '🎯 Focus Time'}
        </div>
      </div>
    </div>
  );
};

const Pomodoro = () => {
  const { subjects, addPomodoroSession, pomodoroSessions, addToast } = useApp();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const totalDuration = isBreak ? BREAK_DURATION : FOCUS_DURATION;
  const progress = 1 - timeLeft / totalDuration;

  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    } catch {}
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            playBeep();
            if (!isBreak) {
              // Complete focus session
              if (selectedSubject) {
                addPomodoroSession({ subject: selectedSubject, duration: FOCUS_DURATION });
              }
              setSessionCount(c => c + 1);
              addToast(`🍅 Pomodoro complete! Starting break...`, 'success');
              setIsBreak(true);
              setIsRunning(true);
              return BREAK_DURATION;
            } else {
              addToast('☕ Break over! Ready for next focus session?', 'info');
              setIsBreak(false);
              setIsRunning(false);
              return FOCUS_DURATION;
            }
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isBreak, selectedSubject, addPomodoroSession, addToast, playBeep]);

  const handleStart = () => {
    if (!selectedSubject && !isBreak) {
      addToast('Please select a subject first', 'warning');
      return;
    }
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(FOCUS_DURATION);
  };

  // Today's sessions
  const today = formatDate(new Date());
  const todaySessions = pomodoroSessions.filter(s => {
    const d = formatDate(new Date(s.completedAt));
    return d === today;
  });

  return (
    <Layout title="Pomodoro Timer">
      <div className="max-w-2xl mx-auto">
        {/* Timer Card */}
        <GlassCard className="p-8 text-center mb-6">
          <h3 className="font-display font-bold text-white mb-2 text-xl">
            {isBreak ? '☕ Break Time' : '🍅 Focus Session'}
          </h3>
          <p className="text-gray-400 text-sm mb-2">
            Session #{sessionCount + 1} · {isBreak ? 'Rest & recharge' : 'Deep work mode'}
          </p>

          {/* Subject Selector */}
          {!isRunning && !isBreak && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <select
                className="input-field max-w-xs mx-auto"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              >
                <option value="">Select Subject...</option>
                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </motion.div>
          )}

          {selectedSubject && !isBreak && (
            <p className="text-purple-400 text-sm font-semibold mb-4">
              📚 Studying: {selectedSubject}
            </p>
          )}

          {/* Circular Timer */}
          <div className="flex justify-center my-6">
            <CircularTimer progress={progress} isBreak={isBreak} timeLeft={timeLeft} />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center transition-all shadow-glow-purple hover:shadow-glow-purple"
              >
                <PlayIcon className="w-7 h-7 text-white ml-0.5" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="w-14 h-14 rounded-full bg-amber-600 hover:bg-amber-500 flex items-center justify-center transition-all"
              >
                <PauseIcon className="w-7 h-7 text-white" />
              </button>
            )}
            <button
              onClick={handleReset}
              className="w-12 h-12 rounded-full bg-navy-700 hover:bg-navy-600 flex items-center justify-center transition-all border border-gray-700/40"
            >
              <ArrowPathIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Session dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: Math.max(sessionCount, 4) }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i < sessionCount
                    ? 'bg-purple-500 shadow-glow-sm-purple'
                    : 'bg-navy-700 border border-gray-700'
                }`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-2">{sessionCount} completed</span>
          </div>

          {/* Info */}
          <div className="mt-6 p-3 bg-navy-800/50 rounded-xl text-xs text-gray-500">
            Each completed pomodoro auto-logs <strong className="text-purple-400">0.42 hours</strong> to your selected subject
          </div>
        </GlassCard>

        {/* Today's Session History */}
        <GlassCard className="p-6">
          <h3 className="font-display font-bold text-white mb-4">
            📋 Today's Sessions ({todaySessions.length})
          </h3>
          {todaySessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🍅</p>
              <p className="text-gray-500 text-sm">No sessions completed today yet</p>
              <p className="text-gray-600 text-xs mt-1">Start your first pomodoro above!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todaySessions.map((s, i) => {
                const subj = subjects.find(sub => sub.name === s.subject);
                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-navy-800/30 hover:bg-navy-700/30 transition-colors"
                  >
                    <div className="text-lg">🍅</div>
                    <div
                      className="w-2 h-8 rounded-full"
                      style={{ backgroundColor: subj?.color || '#7c3aed' }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{s.subject}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · 25 min focus
                      </p>
                    </div>
                    <span className="text-xs font-bold text-cyan-400 font-display">+0.42h</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </Layout>
  );
};

export default Pomodoro;
