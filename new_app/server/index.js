import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT_DIR,
  buildExcelBuffer,
  readTrackerData,
  writeTrackerDataAtomic,
} from './storage.mjs';

const isDev = process.argv.includes('--dev');
const PORT = Number(process.env.PORT || 3000);
const HOST = '127.0.0.1';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, mode: 'local-express' });
  });

  app.get('/api/data', (_req, res) => {
    try {
      const data = readTrackerData();
      res.json(data);
    } catch (error) {
      console.error('Failed to read tracker data:', error);
      res.status(500).json({ error: 'שגיאה בקריאת קובץ הנתונים.' });
    }
  });

  app.put('/api/data', (req, res) => {
    try {
      const saved = writeTrackerDataAtomic(req.body);
      res.json(saved);
    } catch (error) {
      console.error('Failed to save tracker data:', error);
      res.status(500).json({ error: 'שגיאה בשמירת קובץ הנתונים.' });
    }
  });

  app.get('/api/export.xlsx', (_req, res) => {
    try {
      const data = readTrackerData();
      const activeOffices = data.offices.filter((o) => !o.archived);
      const buffer = buildExcelBuffer(activeOffices);
      const stamp = new Date().toISOString().slice(0, 10);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="offices-backup-${stamp}.xlsx"`
      );
      res.send(buffer);
    } catch (error) {
      console.error('Failed to export XLSX:', error);
      res.status(500).json({ error: 'שגיאה בייצוא קובץ האקסל.' });
    }
  });

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: ROOT_DIR,
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(ROOT_DIR, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.use((_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    } else {
      app.get('/', (_req, res) => {
        res
          .status(503)
          .send('Build not found. Run "npm run build" or start with "npm run dev".');
      });
    }
  }

  app.listen(PORT, HOST, () => {
    console.log(`Law Internship Tracker running at http://localhost:${PORT}`);
    console.log(`Listening strictly on ${HOST} (local only).`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
