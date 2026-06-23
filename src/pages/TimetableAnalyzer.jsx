import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import GlassCard from '../components/GlassCard';
import { callAI, getAvailableProvider } from '../utils/claude';
import { CloudArrowUpIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { storage } from '../utils/storage';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => `${i + 7}:00`); // 7am - 8pm

const parseTimetable = (text) => {
  const entries = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Try to parse patterns like: "Monday Math 9:00-11:00" or "Mon, Physics, 14:00, 16:00"
    const patterns = [
      /(\w+)\s+(\w+[\w\s]*?)\s+(\d{1,2}(?::\d{2})?)\s*[-–]\s*(\d{1,2}(?::\d{2})?)/i,
      /(\w+)[,\s]+(\w+[\w\s]*?)[,\s]+(\d{1,2}(?::\d{2})?)[,\s]+(\d{1,2}(?::\d{2})?)/i,
      /(\w+)\s*\|\s*(\w+[\w\s]*?)\s*\|\s*(\d{1,2}(?::\d{2})?)\s*[-–]\s*(\d{1,2}(?::\d{2})?)/i,
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const [, day, subject, start, end] = match;
        const startH = parseInt(start.split(':')[0]);
        const endH = parseInt(end.split(':')[0]);
        if (!isNaN(startH) && !isNaN(endH) && endH > startH) {
          entries.push({
            day: day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
            subject: subject.trim(),
            start: startH,
            end: endH,
            hours: endH - startH,
          });
        }
        break;
      }
    }
  }
  return entries;
};

const ScheduleGrid = ({ entries }) => {
  if (!entries.length) return null;
  
  const subjectColors = {};
  const colorPalette = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#22d3ee', '#34d399'];
  const subjects = [...new Set(entries.map(e => e.subject))];
  subjects.forEach((s, i) => { subjectColors[s] = colorPalette[i % colorPalette.length]; });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header */}
        <div className="grid" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
          <div className="text-xs text-gray-500 text-center py-2"></div>
          {DAYS.map(d => (
            <div key={d} className="text-xs font-semibold text-gray-400 text-center py-2 border-l border-gray-700/20">
              {d.slice(0, 3)}
            </div>
          ))}
        </div>
        
        {/* Time Rows */}
        {TIME_SLOTS.map(slot => {
          const slotH = parseInt(slot);
          return (
            <div key={slot} className="grid border-t border-gray-700/10" style={{ gridTemplateColumns: '80px repeat(7, 1fr)', minHeight: '40px' }}>
              <div className="text-xs text-gray-600 text-right pr-3 pt-1">{slot}</div>
              {DAYS.map(day => {
                const entry = entries.find(e => {
                  const dayMatch = e.day.toLowerCase().startsWith(day.toLowerCase().slice(0, 3));
                  return dayMatch && e.start <= slotH && e.end > slotH;
                });
                return (
                  <div key={day} className="border-l border-gray-700/10 p-0.5">
                    {entry && entry.start === slotH ? (
                      <div
                        className="rounded-md px-1.5 py-1 text-xs font-semibold text-white overflow-hidden"
                        style={{
                          backgroundColor: subjectColors[entry.subject] + '33',
                          border: `1px solid ${subjectColors[entry.subject]}60`,
                          color: subjectColors[entry.subject],
                        }}
                      >
                        {entry.subject}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TimetableAnalyzer = () => {
  const { studyLogs, subjects, addToast } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [parsedEntries, setParsedEntries] = useState([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [suggestedEntries, setSuggestedEntries] = useState([]);
  const [rawText, setRawText] = useState('');
  const hasApiKey = !!getAvailableProvider();

  const processFile = useCallback(async (file) => {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setRawText(text);
    const entries = parseTimetable(text);
    setParsedEntries(entries);
    if (entries.length === 0) {
      addToast('Could not parse timetable. Check format. Showing raw text.', 'warning');
    } else {
      addToast(`✅ Parsed ${entries.length} sessions from timetable`, 'success');
    }
  }, [addToast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  // Projected vs actual
  const comparison = subjects.map(s => {
    const projected = parsedEntries
      .filter(e => e.subject.toLowerCase().includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(e.subject.toLowerCase()))
      .reduce((sum, e) => sum + e.hours, 0);
    const actual = studyLogs.filter(l => l.subject === s.name).reduce((sum, l) => sum + l.hours, 0);
    return { ...s, projected, actual };
  }).filter(s => s.projected > 0 || s.actual > 0);

  const analyzeWithClaude = async () => {
    setLoading(true);
    try {
      const projectedData = parsedEntries.reduce((acc, e) => {
        acc[e.subject] = (acc[e.subject] || 0) + e.hours;
        return acc;
      }, {});
      
      const actualData = subjects.reduce((acc, s) => {
        const hours = studyLogs.filter(l => l.subject === s.name).reduce((sum, l) => sum + l.hours, 0);
        if (hours > 0) acc[s.name] = hours;
        return acc;
      }, {});

      const prompt = `I have the following timetable data:
Projected hours per subject from timetable: ${JSON.stringify(projectedData)}
Actual hours logged: ${JSON.stringify(actualData)}

Please:
1. Analyze gaps between projected and actual study time
2. Suggest a redistributed weekly timetable with even coverage
3. Format the timetable suggestion as: Day | Subject | Start | End
(Use format: Monday | Mathematics | 9:00 | 11:00)
4. Provide a brief explanation of your changes

Make the timetable cover Monday-Friday primarily, with optional Saturday sessions.`;

      const response = await callAI([{ role: 'user', content: prompt }], 
        'You are a study timetable optimizer. Provide practical, balanced schedules.');
      
      setAiSuggestion(response);
      
      // Try to extract timetable entries from response
      const entries = parseTimetable(response);
      if (entries.length > 0) setSuggestedEntries(entries);
      
      addToast('✅ AI timetable generated!', 'success');
    } catch (err) {
      addToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadTimetable = () => {
    const content = aiSuggestion || parsedEntries.map(e => 
      `${e.day} | ${e.subject} | ${e.start}:00 | ${e.end}:00`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suggested-timetable.txt';
    a.click();
    URL.revokeObjectURL(url);
    addToast('📥 Timetable downloaded!', 'success');
  };

  return (
    <Layout title="Timetable Analyzer">
      {/* Upload Zone */}
      <GlassCard className="p-6 mb-6">
        <h3 className="font-display font-bold text-white mb-4">📤 Upload Timetable</h3>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
            dragOver
              ? 'border-purple-500 bg-purple-900/20'
              : 'border-gray-700/50 hover:border-purple-700/50 hover:bg-navy-700/20'
          }`}
        >
          <CloudArrowUpIcon className={`w-12 h-12 mx-auto mb-3 ${dragOver ? 'text-purple-400' : 'text-gray-500'}`} />
          <p className="text-gray-300 font-semibold mb-1">
            {fileName ? `📄 ${fileName}` : 'Drop your timetable file here'}
          </p>
          <p className="text-gray-500 text-sm mb-4">Supports .txt, .csv files</p>
          <label className="btn-secondary cursor-pointer inline-block">
            📁 Browse File
            <input type="file" className="hidden" accept=".txt,.csv" onChange={handleFileInput} />
          </label>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Or paste timetable text directly:</p>
          <textarea
            className="input-field text-xs h-28 resize-none"
            placeholder={"Monday Math 9:00-11:00\nTuesday Physics 10:00-12:00\nWednesday Chemistry 14:00-16:00"}
            onChange={e => {
              setRawText(e.target.value);
              const entries = parseTimetable(e.target.value);
              setParsedEntries(entries);
            }}
            value={rawText}
          />
        </div>
      </GlassCard>

      {/* Parsed Schedule Grid */}
      {parsedEntries.length > 0 && (
        <GlassCard className="p-6 mb-6">
          <h3 className="font-display font-bold text-white mb-4">
            📅 Parsed Schedule ({parsedEntries.length} sessions)
          </h3>
          <ScheduleGrid entries={parsedEntries} />
        </GlassCard>
      )}

      {/* Comparison Table */}
      {comparison.length > 0 && (
        <GlassCard className="p-6 mb-6">
          <h3 className="font-display font-bold text-white mb-4">📊 Projected vs Actual Hours</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/30">
                  <th className="text-left py-2 text-gray-400 font-semibold">Subject</th>
                  <th className="text-right py-2 text-gray-400 font-semibold">Projected</th>
                  <th className="text-right py-2 text-gray-400 font-semibold">Actual</th>
                  <th className="text-right py-2 text-gray-400 font-semibold">Gap</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(s => {
                  const gap = s.actual - s.projected;
                  return (
                    <tr key={s.id} className="border-b border-gray-700/10 hover:bg-navy-700/20">
                      <td className="py-2.5 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="text-white">{s.name}</span>
                      </td>
                      <td className="text-right py-2.5 text-gray-300">{s.projected}h</td>
                      <td className="text-right py-2.5 text-gray-300">{s.actual.toFixed(1)}h</td>
                      <td className={`text-right py-2.5 font-bold ${gap >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {gap >= 0 ? '+' : ''}{gap.toFixed(1)}h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* AI Analysis */}
      <GlassCard className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-white">🤖 AI Timetable Optimizer</h3>
          <button
            onClick={analyzeWithClaude}
            disabled={loading || !hasApiKey}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Optimizing...
              </>
            ) : '✨ Generate Optimal Timetable'}
          </button>
        </div>

        {!hasApiKey && (
          <p className="text-amber-400 text-sm">⚠️ Add your API key in Settings to use AI optimization.</p>
        )}

        {aiSuggestion && (
          <div className="mt-4">
            <div className="bg-navy-800/50 rounded-xl p-4 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto font-mono text-xs mb-4">
              {aiSuggestion}
            </div>
            
            {suggestedEntries.length > 0 && (
              <>
                <h4 className="font-display font-bold text-white mb-3">📅 Suggested Schedule Grid</h4>
                <ScheduleGrid entries={suggestedEntries} />
              </>
            )}
          </div>
        )}
      </GlassCard>

      {/* Download */}
      {(aiSuggestion || parsedEntries.length > 0) && (
        <div className="flex justify-end">
          <button onClick={downloadTimetable} className="btn-cyan flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download Timetable (.txt)
          </button>
        </div>
      )}
    </Layout>
  );
};

export default TimetableAnalyzer;
