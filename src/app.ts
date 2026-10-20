import cors from 'cors';
import express from 'express';
import { errorHandler, notFoundHandler } from './shared/error-handler';
import router from './routes';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './config/swagger';

export function createApp() {
  const app = express();
  app.use(cors({ origin: 'http://localhost:3000' }));
  app.use(express.json());

  app.use('/api', router);

  app.get('/docs.json', (_req, res) => {
    res.json(openApiSpec);
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
