// Resolves the OpenAI proxy endpoint the app talks to.
//
// Default '/api/openai' keeps local dev (the vite middleware in vite.config.js)
// and the Vercel deploy working with zero changes.
//
// For the Firebase Hosting build (static files, no /api routes), set
// VITE_AI_PROXY_URL to the deployed Supabase Edge Function — see .env.firebase:
//   https://<project-ref>.supabase.co/functions/v1/openai-proxy
export const AI_PROXY_URL = import.meta.env.VITE_AI_PROXY_URL || '/api/openai';
