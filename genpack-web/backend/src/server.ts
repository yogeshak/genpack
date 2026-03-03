import express, { type Express } from 'express';
import { parseRouter } from './api/parse';
import { runRouter } from './api/run';
import { heuristicRouter } from './api/heuristic';

const PORT = process.env.PORT ?? 3001;
const MAX_BODY = '2mb';

export function createApp(): Express {
  const app = express();
  app.use(express.json({ limit: MAX_BODY }));
  app.use((_req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  app.options('*', (_req, res) => res.sendStatus(204));

  app.use('/api/parse', parseRouter);
  app.use('/api/run', runRouter);
  app.use('/api/heuristic', heuristicRouter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`GENPACK API listening on http://localhost:${PORT}`);
  });
}
