import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only plugin that mimics the Vercel /api/openai serverless function locally
function openaiProxyPlugin() {
  return {
    name: 'openai-proxy',
    configureServer(server) {
      server.middlewares.use('/api/openai', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // Read the request body
        let body = '';
        for await (const chunk of req) body += chunk;

        try {
          const { apiKey, ...openaiBody } = JSON.parse(body);

          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(openaiBody),
          });

          const data = await response.json();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = response.status;
          res.end(JSON.stringify(data));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), openaiProxyPlugin()],
  server: {
    port: 5173,
    open: true,
  },
})
