import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { config } from './config.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorMiddleware } from './middleware/error.js';
import connectorsRoute from './routes/connectors.js';

const app = new Hono();

// Global middleware
app.use(errorMiddleware);
app.use(corsMiddleware);

// Health check
app.get('/api/health', (c) => {
  return c.json({ success: true, data: { status: 'ok', env: config.nodeEnv } });
});

// Routes
app.route('/api/connectors', connectorsRoute);

// 404
app.notFound((c) => {
  return c.json({ success: false, error: 'Not found', code: 'NOT_FOUND' }, 404);
});

const port = config.port;

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  () => {
    console.log(`[server] Running at http://localhost:${port}`);
  }
);

process.on('SIGINT', () => {
  console.log('\n[server] Shutting down gracefully...');
  server.close();
  process.exit(0);
});

export default app;
