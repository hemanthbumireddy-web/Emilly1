import { createRequire } from 'module';
import { createServer as createViteServer } from 'vite';
import express from 'express';

const require = createRequire(import.meta.url);
const app = require('./server/index.js');

const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: express.Request, res: express.Response) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
