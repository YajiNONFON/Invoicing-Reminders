import cors from 'cors';
import express from 'express';
import { errorHandler, notFoundHandler } from './shared/error-handler';

export function createApp() {
  const app = express();
  app.use(cors({ origin: 'http://localhost:3000' }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
