import express from 'express';
import { CHANNEL_CONFIGS } from './channels.js';
import { cors, latency, simulateError } from './middleware.js';
import { postsRouter } from './routes/posts.js';
import * as store from './store.js';

export function createApp() {
  const app = express();

  app.use(cors);
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', latency, simulateError);

  app.use('/api/posts', postsRouter);

  app.get('/api/channels', (_req, res) => {
    res.json({ channels: CHANNEL_CONFIGS });
  });

  app.post('/api/_reset', (_req, res) => {
    store.reset();
    res.json({ ok: true });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: 'NOT_FOUND' });
  });

  return app;
}
