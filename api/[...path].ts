import type { Request, Response } from 'express';
import { createApp } from '../Kimi_Agent_Exact Website Copy Request/server/src/app.js';
import { seedDatabase } from '../Kimi_Agent_Exact Website Copy Request/server/src/db.js';

const app = createApp();

// Initialize database on cold start (idempotent seed — safe to run multiple times)
const initPromise = seedDatabase().catch((err: unknown) => {
  console.error('Database seed error (non-fatal):', err);
});

export default async function handler(req: Request, res: Response) {
  await initPromise;
  return app(req, res);
}
