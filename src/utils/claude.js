// Smart AI Router - tries OpenAI first, then Anthropic
import { storage } from './storage';

export const getAvailableProvider = () => {
  if (storage.get('openaiApiKey')) return 'openai';
  if (storage.get('anthropicApiKey')) return 'anthropic';
  if (storage.get('geminiApiKey')) return 'gemini';
  return null;
};

export const callAI = async (messages, systemPrompt = '') => {
  const provider = getAvailableProvider();
  if (provider === 'openai') return callOpenAI(messages, systemPrompt);
  if (provider === 'anthropic') return callClaude(messages, systemPrompt);
  if (provider === 'gemini') return callGemini(messages, systemPrompt);
  throw new Error('No API key found. Please add your OpenAI, Anthropic, or Gemini API key in Settings.');
};

// Anthropic (Claude)
export const callClaude = async (messages, systemPrompt = '') => {
  const apiKey = storage.get('anthropicApiKey');
  if (!apiKey) throw new Error('No Anthropic API key set. Please add it in Settings.');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
};

// OpenAI (GPT) — routed through /api/openai proxy to avoid CORS
export const callOpenAI = async (messages, systemPrompt = '') => {
  const apiKey = storage.get('openaiApiKey');
  if (!apiKey) throw new Error('No OpenAI API key set. Please add it in Settings.');

  const formattedMessages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...messages,
  ];

  // Use serverless proxy to bypass CORS
  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey,
      model: 'gpt-4o-mini',
      max_tokens: 2048,
      messages: formattedMessages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const callGemini = async (messages, systemPrompt = '') => {
  const apiKey = storage.get('geminiApiKey');
  if (!apiKey) throw new Error('No Gemini API key set. Please add it in Settings.');

  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const payload = { contents };
  if (systemPrompt) {
    payload.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response from Gemini API');
  }
  
  return data.candidates[0].content.parts[0].text;
};

export const buildStudyContext = (studyLogs, subjects, sleepLogs, exams) => {
  const subjectHours = subjects.map(s => {
    const hours = studyLogs
      .filter(l => l.subject === s.name)
      .reduce((sum, l) => sum + l.hours, 0);
    return { subject: s.name, hoursLogged: hours, weeklyGoal: s.weeklyGoal };
  });

  const recentSleep = sleepLogs.slice(-7);
  const avgSleep = recentSleep.length > 0
    ? recentSleep.reduce((s, l) => s + l.sleepHours, 0) / recentSleep.length
    : 7;

  const upcomingExams = exams
    .filter(e => new Date(e.date) > new Date())
    .map(e => ({
      name: e.name,
      daysLeft: Math.ceil((new Date(e.date) - new Date()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return { subjectHours, avgSleepHours: avgSleep, upcomingExams };
};


