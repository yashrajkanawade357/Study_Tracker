import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { PlayIcon, PauseIcon, ArrowPathIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, SpeakerWaveIcon, SpeakerXMarkIcon, CheckCircleIcon as CheckSolid, PlusCircleIcon } from '@heroicons/react/24/solid';
import { CheckCircleIcon as CheckOutline } from '@heroicons/react/24/outline';
import { formatDisplay, formatDate } from '../utils/dateUtils';



const TreeAnimation = ({ progress }) => {
  const petals = [
    { id: 1, cx: 120, cy: 70, delayProgress: 0.15 },
    { id: 2, cx: 90, cy: 90, delayProgress: 0.35 },
    { id: 3, cx: 150, cy: 90, delayProgress: 0.55 },
    { id: 4, cx: 100, cy: 110, delayProgress: 0.75 },
    { id: 5, cx: 140, cy: 110, delayProgress: 0.95 },
  ];

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 240 240" className="opacity-90">
        <path d="M115 180 Q120 130 120 100 Q120 130 125 180 Z" fill="#8B4513" />
        {petals.map(p => {
          const hasFallen = progress >= p.delayProgress;
          return (
            <motion.circle
              key={p.id}
              cx={p.cx}
              cy={p.cy}
              r={14}
              fill="#10b981"
              initial={false}
              animate={{
                y: hasFallen ? 120 : 0,
                opacity: hasFallen ? 0 : 1,
                scale: hasFallen ? 0.5 : 1,
                rotate: hasFallen ? 45 : 0
              }}
              transition={{ duration: 2, ease: "easeIn" }}
            />
          );
        })}
      </svg>
      <span className="text-xs text-emerald-400 font-semibold mt-2 opacity-70">Growth Progress</span>
    </div>
  );
};

const CircularTimer = ({ progress, isBreak, isLongBreak, timeLeft, size = 240 }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const strokeColor = isBreak ? (isLongBreak ? '#f59e0b' : '#06b6d4') : '#7c3aed';
  const glowColor = isBreak ? (isLongBreak ? 'rgba(245,158,11,0.4)' : 'rgba(6,182,212,0.4)') : 'rgba(124,58,237,0.4)';
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={10}
        />
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
            transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      
      <div className="text-center z-10">
        <motion.div 
          key={`${minutes}-${seconds}`}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`text-5xl font-display font-bold ${isBreak ? (isLongBreak ? 'text-amber-400' : 'text-cyan-400') : 'text-purple-400'}`}
          style={{ textShadow: `0 0 20px ${glowColor}` }}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </motion.div>
        <div className="text-sm text-gray-400 mt-1 font-semibold">
          {isBreak ? (isLongBreak ? '🌅 Long Break' : '☕ Break Time') : '🎯 Focus Time'}
        </div>
      </div>
    </div>
  );
};

const Pomodoro = () => {
  const { subjects, addPomodoroSession, pomodoroSessions, addToast } = useApp();
  const [selectedSubject, setSelectedSubject] = useState('');
  const [focusDurationSetting, setFocusDurationSetting] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [isLongBreak, setIsLongBreak] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  
  const focusDurationSecs = focusDurationSetting * 60;
  const breakDurationSecs = isLongBreak ? 15 * 60 : (focusDurationSetting === 50 ? 10 * 60 : 5 * 60);
  
  const [timeLeft, setTimeLeft] = useState(focusDurationSecs);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef(null);
  const ambientAudioRef = useRef(null);

  useEffect(() => {
    if (!isRunning && !isBreak) {
      setTimeLeft(focusDurationSecs);
    }
  }, [focusDurationSetting, isRunning, isBreak, focusDurationSecs]);

  useEffect(() => {
    if (ambientAudioRef.current) {
      if (isRunning && !isBreak && isSoundEnabled) {
        ambientAudioRef.current.play().catch(() => {});
      } else {
        ambientAudioRef.current.pause();
      }
    }
  }, [isRunning, isBreak, isSoundEnabled]);

  const totalDuration = isBreak ? breakDurationSecs : focusDurationSecs;
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
                addPomodoroSession({ subject: selectedSubject, duration: focusDurationSecs });
              }
              const newCount = c + 1;
              setSessionCount(newCount);
              const isLong = newCount > 0 && newCount % 4 === 0;
              
              if (isLong) {
                setIsLongBreak(true);
                addToast('🎉 4 Pomodoros complete! Take a long break.', 'success');
              } else {
                setIsLongBreak(false);
                addToast(`🍅 Pomodoro complete! Starting break...`, 'success');
              }
              
              setIsBreak(true);
              setIsRunning(true);
              return isLong ? 15 * 60 : (focusDurationSetting === 50 ? 10 * 60 : 5 * 60);
            } else {
              addToast('☕ Break over! Ready for next focus session?', 'info');
              setIsBreak(false);
              setIsLongBreak(false);
              setIsRunning(false);
              return focusDurationSecs;
            }
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isBreak, selectedSubject, addPomodoroSession, addToast, playBeep, focusDurationSecs, breakDurationSecs]);

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
    setIsLongBreak(false);
    setTimeLeft(focusDurationSecs);
  };

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTaskText, completed: false }]);
      setNewTaskText('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Today's sessions
  const today = formatDate(new Date());
  const todaySessions = pomodoroSessions.filter(s => {
    const d = formatDate(new Date(s.completedAt));
    return d === today;
  });

  return (
    <Layout title="Pomodoro Timer">
      <div className={isFullscreen ? 'fixed inset-0 z-[100] bg-navy-900 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto' : 'max-w-2xl mx-auto'}>
        <audio ref={ambientAudioRef} src="https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg" loop />
        
        {isFullscreen && (
          <button 
            onClick={() => setIsFullscreen(false)} 
            className="absolute top-6 right-6 p-2 rounded-full bg-navy-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowsPointingInIcon className="w-6 h-6" />
          </button>
        )}

          {/* Timer Card */}
        <GlassCard className={`p-8 text-center mb-6 w-full ${isFullscreen ? 'max-w-3xl flex flex-col items-center' : ''}`}>
          <div className="flex justify-between items-start mb-2 w-full">
            <button 
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-1.5 rounded-full bg-navy-700 text-gray-400 hover:text-white transition-colors"
              title="Toggle Ambient Sound"
            >
              {isSoundEnabled ? <SpeakerWaveIcon className="w-5 h-5" /> : <SpeakerXMarkIcon className="w-5 h-5" />}
            </button>
            <div className="flex-1">
              <h3 className="font-display font-bold text-white text-xl">
                {isBreak ? (isLongBreak ? '🌅 Long Break' : '☕ Break Time') : '🍅 Focus Session'}
              </h3>
            </div>
            {!isFullscreen && (
              <button 
                onClick={() => setIsFullscreen(true)}
                className="p-1.5 rounded-full bg-navy-700 text-gray-400 hover:text-white transition-colors"
                title="Zen Fullscreen Mode"
              >
                <ArrowsPointingOutIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {!isFullscreen && (
            <p className="text-gray-400 text-sm mb-2">
              Session #{sessionCount + 1} · {isBreak ? 'Rest & recharge' : 'Deep work mode'}
            </p>
          )}

          {/* Subject & Duration Selector */}
          {!isRunning && !isBreak && !isFullscreen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex flex-col items-center gap-4"
            >
              <div className="flex gap-2">
                {[25, 50].map(duration => (
                  <button
                    key={duration}
                    onClick={() => setFocusDurationSetting(duration)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      focusDurationSetting === duration ? 'bg-purple-600 text-white shadow-glow-purple' : 'bg-navy-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {duration} min Focus
                  </button>
                ))}
              </div>
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

          {selectedSubject && !isBreak && !isFullscreen && (
            <p className="text-purple-400 text-sm font-semibold mb-4">
              📚 Studying: {selectedSubject}
            </p>
          )}

          {/* Circular Timer and Gamification */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 my-6">
            <TreeAnimation progress={progress} />
            <CircularTimer progress={progress} isBreak={isBreak} isLongBreak={isLongBreak} timeLeft={timeLeft} />
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

          {/* Hidden UI in Fullscreen */}
          {!isFullscreen && (
            <>
              {/* Session dots */}
              <div className="flex items-center justify-center gap-2 mt-6">
                {Array.from({ length: Math.max(sessionCount, 4) }, (_, i) => {
                  const isCurrentCycle = i < (Math.floor(sessionCount / 4) * 4) + 4;
                  const isFilled = i < sessionCount;
                  return (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        isFilled
                          ? 'bg-purple-500 shadow-glow-sm-purple'
                          : (isCurrentCycle ? 'bg-navy-700 border border-gray-700' : 'hidden')
                      }`}
                    />
                  );
                })}
                <span className="text-xs text-gray-500 ml-2">{sessionCount} completed</span>
              </div>

              {/* Mini Task List */}
              {!isBreak && (
                <div className="mt-8 pt-6 border-t border-gray-700/50 text-left">
                  <h4 className="text-sm font-semibold text-white mb-3">🎯 Session Tasks</h4>
                  <div className="flex flex-col gap-2 mb-3 max-h-40 overflow-y-auto pr-2">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2 group">
                        <button onClick={() => toggleTask(task.id)}>
                          {task.completed ? <CheckSolid className="w-5 h-5 text-emerald-400" /> : <CheckOutline className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" />}
                        </button>
                        <span className={`text-sm transition-all ${task.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{task.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field py-1 px-3 text-sm flex-1 bg-navy-800/50"
                      placeholder="Add a task for this session..."
                      value={newTaskText}
                      onChange={e => setNewTaskText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                    />
                    <button onClick={handleAddTask} className="text-purple-400 hover:text-purple-300 transition-colors">
                      <PlusCircleIcon className="w-7 h-7" />
                    </button>
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="mt-6 p-3 bg-navy-800/50 rounded-xl text-xs text-gray-500">
                Each completed pomodoro auto-logs <strong className="text-purple-400">+{(focusDurationSecs / 3600).toFixed(2)}h</strong> to your selected subject
              </div>
            </>
          )}
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
                        {new Date(s.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {Math.round(s.duration / 60)} min focus
                      </p>
                    </div>
                    <span className="text-xs font-bold text-cyan-400 font-display">+{(s.duration / 3600).toFixed(2)}h</span>
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
