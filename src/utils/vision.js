// Extract a weekly timetable from an uploaded image using a vision-capable
// AI model (OpenAI gpt-4o-mini, Gemini 1.5 Flash, or Claude). Returns
// [{ day, subject, start, end }] with full weekday names and 24h HH:MM.

import { storage } from './storage';
import { getAvailableProvider } from './claude';
import { AI_PROXY_URL } from './aiProxy';

const PROMPT = `You are reading a school/college/study timetable from an image.
Extract every scheduled class or study session you can see.
Respond with ONLY a JSON object (no markdown, no commentary):
{"entries":[{"day":"Monday","subject":"Mathematics","start":"09:00","end":"11:00"}]}
Rules:
- "day" is a full weekday name (Monday…Sunday).
- "start"/"end" are 24-hour "HH:MM".
- If one class spans multiple periods, merge it into a single entry.
- Ignore headers, room numbers, teacher names, breaks/lunch, and anything that is not a class.
- If you cannot read a timetable, return {"entries":[]}.`;

const toDataUrl = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = reject;
  r.readAsDataURL(file);
});

function extractJson(text) {
  let t = (text || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  return JSON.parse(t);
}

async function visionOpenAI(dataUrl) {
  const apiKey = storage.get('openaiApiKey');
  const res = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey,
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      messages: [{ role: 'user', content: [
        { type: 'text', text: PROMPT },
        { type: 'image_url', image_url: { url: dataUrl } },
      ] }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `OpenAI vision error: ${res.status}`);
  return data.choices[0].message.content;
}

async function visionGemini(dataUrl) {
  const apiKey = storage.get('geminiApiKey');
  const [meta, b64] = dataUrl.split(',');
  const mime = (meta.match(/data:(.*?);/) || [])[1] || 'image/png';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: PROMPT }, { inlineData: { mimeType: mime, data: b64 } }] }] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Gemini vision error: ${res.status}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function visionAnthropic(dataUrl) {
  const apiKey = storage.get('anthropicApiKey');
  const [meta, b64] = dataUrl.split(',');
  const mime = (meta.match(/data:(.*?);/) || [])[1] || 'image/png';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: [
        { type: 'text', text: PROMPT },
        { type: 'image', source: { type: 'base64', media_type: mime, data: b64 } },
      ] }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Anthropic vision error: ${res.status}`);
  return data.content[0].text;
}

export async function extractTimetableFromImage(file) {
  const provider = getAvailableProvider();
  if (!provider) throw new Error('No API key found. Add an OpenAI, Gemini, or Anthropic key in Settings.');

  const dataUrl = await toDataUrl(file);
  let raw;
  if (provider === 'openai') raw = await visionOpenAI(dataUrl);
  else if (provider === 'gemini') raw = await visionGemini(dataUrl);
  else raw = await visionAnthropic(dataUrl);

  const parsed = extractJson(raw);
  return Array.isArray(parsed.entries) ? parsed.entries : [];
}
