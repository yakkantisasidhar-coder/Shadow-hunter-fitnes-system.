import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.js';
import { workoutsRouter } from './routes/workouts.js';
import { nutritionRouter } from './routes/nutrition.js';
import { aiRouter } from './routes/ai.js';
import { progressRouter } from './routes/progress.js';
import { challengesRouter } from './routes/challenges.js';
import { gymsRouter } from './routes/gyms.js';
import { subscriptionsRouter } from './routes/subscriptions.js';
import { adminRouter } from './routes/admin.js';
import { notificationsRouter } from './routes/notifications.js';
import { leaderboardsRouter } from './routes/leaderboards.js';
import { whatsappRouter } from './routes/whatsapp.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLIENT_DIST = path.join(__dirname, '../../client/dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(express.json());

// Routes Mount
app.use('/api/auth', authRouter);
app.use('/api/workouts', workoutsRouter);
app.use('/api/nutrition', nutritionRouter);
app.use('/api/ai', aiRouter);
app.use('/api/progress', progressRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/gyms', gymsRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/leaderboards', leaderboardsRouter);
app.use('/api/gyms/whatsapp', whatsappRouter);
app.use('/api/whatsapp', whatsappRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'operational',
    system: 'SHADOW HUNTER FITNESS SYSTEM API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend build
app.use(express.static(CLIENT_DIST));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`[SHADOW HUNTER] Fitness Backend & Client listening on port ${PORT}`);
});

