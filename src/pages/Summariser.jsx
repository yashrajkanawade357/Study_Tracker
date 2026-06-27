import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import CalendarLayout from '../components/CalendarLayout';
import { getAvailableProvider } from '../utils/claude';
import { extractText } from '../utils/docExtract';
import { summariseText, summaryToSpeech } from '../utils/summarise';
import {
  DocumentArrowUpIcon, SparklesIcon, PlayIcon, PauseIcon, StopIcon,
  DocumentTextIcon, ListBulletIcon, LightBulbIcon,
} from '@heroicons/react/24/outline';

const Summariser = () => {
  const { addToast } = useApp();
  const hasKey = !!getAvailableProvider();

  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [paste, setPaste] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [summarising, setSummarising] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [tts, setTts] = useState('idle'); // idle | playing | paused

  const keepAlive = useRef(null);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const stopTts = useCallback(() => {
    try { window.speechSynthesis?.cancel(); } catch (_) { /* ignore */ }
    clearInterval(keepAlive.current);
    setTts('idle');
  }, []);

  useEffect(() => () => stopTts(), [stopTts]); // stop on unmount

  const run = async (getText) => {
    setError('');
    setSummary(null);
    stopTts();
    if (!hasKey) { setError('Add an AI key in Settings to summarise.'); return; }
    try {
      const text = await getText();
      if (!text || text.trim().length < 20) { setError('Not enough readable text found.'); return; }
      setSummarising(true);
      const result = await summariseText(text);
      setSummary(result);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      addToast(`Summariser error: ${err.message}`, 'error');
    } finally {
      setExtracting(false);
      setSummarising(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setExtracting(true);
    run(() => extractText(file));
  };

  const summarisePaste = () => {
    if (!paste.trim()) return;
    setFileName('');
    run(() => Promise.resolve(paste));
  };

  // ── TTS ──
  const play = () => {
    if (!summary || !supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(summaryToSpeech(summary));
    u.rate = 1.0;
    u.onend = () => { clearInterval(keepAlive.current); setTts('idle'); };
    u.onerror = () => { clearInterval(keepAlive.current); setTts('idle'); };
    window.speechSynthesis.speak(u);
    // Chrome stops long utterances after ~15s — nudge it to keep going.
    keepAlive.current = setInterval(() => {
      const s = window.speechSynthesis;
      if (s.speaking && !s.paused) { s.pause(); s.resume(); }
    }, 9000);
    setTts('playing');
  };
  const pause = () => { window.speechSynthesis.pause(); setTts('paused'); };
  const resume = () => { window.speechSynthesis.resume(); setTts('playing'); };

  const busy = extracting || summarising;

  return (
    <CalendarLayout>
      <div className="sticky top-0 z-30 bg-navy-950/85 backdrop-blur-md border-b border-cyan-700/15 px-4 md:px-6 py-3">
        <h2 className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-2">
          <DocumentTextIcon className="w-6 h-6 text-cyan-400" /> Document Summariser
        </h2>
      </div>

      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        {!hasKey && (
          <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-900/15 p-3 text-sm text-amber-300">
            Add an AI key (OpenAI, Gemini, or Anthropic) in <Link to="/settings" className="underline font-semibold">Settings</Link> to use the summariser.
          </div>
        )}

        {/* Upload */}
        <div className="rounded-2xl border border-navy-600 bg-navy-900/40 p-5 mb-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragOver ? 'border-cyan-500 bg-cyan-900/10' : 'border-navy-600 hover:border-cyan-700/50'}`}
          >
            {extracting ? (
              <>
                <div className="w-10 h-10 mx-auto mb-3 border-4 border-cyan-700/30 border-t-cyan-500 rounded-full animate-spin" />
                <p className="text-gray-300 font-semibold">Reading {fileName}…</p>
              </>
            ) : (
              <>
                <DocumentArrowUpIcon className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-cyan-400' : 'text-gray-500'}`} />
                <p className="text-gray-300 font-semibold mb-1">{fileName ? `📄 ${fileName}` : 'Drop a document here'}</p>
                <p className="text-gray-500 text-sm mb-4">PDF · Word (.docx) · Text (.txt, .md)</p>
                <label className="btn-secondary cursor-pointer inline-block">
                  📁 Browse File
                  <input type="file" className="hidden" accept=".pdf,.docx,.txt,.md,.csv" onChange={(e) => processFile(e.target.files[0])} />
                </label>
              </>
            )}
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Or paste text directly:</p>
            <textarea
              className="input-field text-sm min-h-[90px] resize-y"
              placeholder="Paste an article, notes, or any text to summarise…"
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button onClick={summarisePaste} disabled={busy || !paste.trim() || !hasKey} className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)' }}>
                <SparklesIcon className="w-4 h-4" /> Summarise text
              </button>
            </div>
          </div>
        </div>

        {error && <div className="mb-5 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 text-sm p-3">{error}</div>}

        {summarising && (
          <div className="rounded-2xl border border-navy-600 bg-navy-900/40 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 relative">
              <div className="w-12 h-12 border-4 border-cyan-700/30 rounded-full" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-white font-semibold">Summarising…</p>
            <p className="text-gray-500 text-sm mt-1">Reading the document and writing a detailed summary</p>
          </div>
        )}

        {/* Result */}
        {summary && !summarising && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-cyan-700/25 bg-navy-900/50 overflow-hidden">
            <div className="p-5 border-b border-navy-600 flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <h3 className="text-xl font-display font-bold text-white">{summary.title}</h3>
                {summary.overview && <p className="text-sm text-gray-400 mt-1 leading-relaxed">{summary.overview}</p>}
              </div>
              {/* TTS controls */}
              {supported && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  {tts === 'idle' && (
                    <button onClick={play} className="btn-cyan text-sm flex items-center gap-1.5"><PlayIcon className="w-4 h-4" /> Listen</button>
                  )}
                  {tts === 'playing' && (
                    <button onClick={pause} className="btn-cyan text-sm flex items-center gap-1.5"><PauseIcon className="w-4 h-4" /> Pause</button>
                  )}
                  {tts === 'paused' && (
                    <button onClick={resume} className="btn-cyan text-sm flex items-center gap-1.5"><PlayIcon className="w-4 h-4" /> Resume</button>
                  )}
                  {tts !== 'idle' && (
                    <button onClick={stopTts} className="px-3 py-2 rounded-xl bg-navy-700 hover:bg-navy-600 text-gray-300 text-sm flex items-center gap-1.5"><StopIcon className="w-4 h-4" /> Stop</button>
                  )}
                </div>
              )}
            </div>

            <div className="p-5 space-y-6">
              {/* Detailed summary */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 mb-2 flex items-center gap-1.5"><DocumentTextIcon className="w-4 h-4" /> Summary</p>
                <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{summary.summary}</div>
              </div>

              {summary.keyPoints.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-purple-300 mb-2 flex items-center gap-1.5"><ListBulletIcon className="w-4 h-4" /> Key points</p>
                  <ul className="space-y-1.5">
                    {summary.keyPoints.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><span className="text-cyan-400 mt-1">•</span><span>{p}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.takeaways.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300 mb-2 flex items-center gap-1.5"><LightBulbIcon className="w-4 h-4" /> Takeaways</p>
                  <ul className="space-y-1.5">
                    {summary.takeaways.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300"><span className="text-amber-400 mt-1">✦</span><span>{p}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[11px] text-gray-600 pt-2 border-t border-navy-700">
                {summary.charCount.toLocaleString()} characters analysed{summary.truncated ? ' (long document — truncated for length)' : ''}.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </CalendarLayout>
  );
};

export default Summariser;
