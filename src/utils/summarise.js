// Produce a detailed, structured summary of a document's text using the
// configured AI provider (OpenAI / Anthropic / Gemini).

import { callAI } from './claude';

const MAX_CHARS = 40000; // keep the prompt within sane token limits

function extractJson(text) {
  let t = (text || '').trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  return JSON.parse(t);
}

export async function summariseText(rawText) {
  const text = (rawText || '').trim();
  if (!text) throw new Error('No text found in the document.');

  const truncated = text.length > MAX_CHARS;
  const input = truncated ? text.slice(0, MAX_CHARS) : text;

  const system = `You are an expert summariser. Read the document and produce a DETAILED, faithful summary as a SINGLE JSON object (no markdown, no commentary):
{
  "title": "a concise title for the document",
  "overview": "2-3 sentence high-level overview",
  "summary": "a thorough multi-paragraph summary (use \\n\\n between paragraphs) capturing the main arguments, structure and important details",
  "keyPoints": ["the most important points as short bullet strings"],
  "takeaways": ["actionable or memorable takeaways"]
}
Be comprehensive but do not invent content that is not in the document.`;

  const userMsg = `Summarise this document in detail.${truncated ? ' (Note: the document was long and has been truncated.)' : ''}\n\n"""\n${input}\n"""`;

  const raw = await callAI([{ role: 'user', content: userMsg }], system);
  const result = extractJson(raw);

  return {
    title: result.title || 'Document summary',
    overview: result.overview || '',
    summary: result.summary || '',
    keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
    takeaways: Array.isArray(result.takeaways) ? result.takeaways : [],
    truncated,
    charCount: text.length,
  };
}

// Flatten a summary into a single string suitable for text-to-speech.
export function summaryToSpeech(s) {
  const parts = [s.title, s.overview, s.summary];
  if (s.keyPoints?.length) parts.push('Key points. ' + s.keyPoints.join('. '));
  if (s.takeaways?.length) parts.push('Takeaways. ' + s.takeaways.join('. '));
  return parts.filter(Boolean).join('. ').replace(/\s+/g, ' ').trim();
}
