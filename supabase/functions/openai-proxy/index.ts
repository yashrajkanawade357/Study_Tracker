// Vyora — OpenAI proxy (Supabase Edge Function)
//
// A drop-in replacement for the Vercel serverless function in api/openai.js,
// so the app can run on Firebase Hosting (static, no /api routes) without a
// Firebase Cloud Function / Blaze billing. The browser still sends the user's
// OWN OpenAI key in the body — this function only relays the request to
// api.openai.com to dodge CORS. Nothing privileged lives here.
//
// Deploy with verify_jwt OFF (it's an open relay using the caller's key,
// exactly like the old Vercel proxy):
//   supabase functions deploy openai-proxy --no-verify-jwt
//
// Body: { apiKey, messages, model?, max_tokens? }
// Returns the raw OpenAI chat-completions JSON (same shape the app expects).

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let payload: { apiKey?: string; messages?: unknown; model?: string; max_tokens?: number };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { apiKey, messages, model, max_tokens } = payload;
  if (!apiKey) return json({ error: "API key is required" }, 400);

  try {
    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        max_tokens: max_tokens || 2048,
        messages,
      }),
    });

    const data = await upstream.json();
    // Pass OpenAI's status through (e.g. 401 bad key, 429 rate limit) so the
    // client surfaces the real error message.
    return json(data, upstream.status);
  } catch (err) {
    return json({ error: (err as Error).message || "Internal server error" }, 500);
  }
});
