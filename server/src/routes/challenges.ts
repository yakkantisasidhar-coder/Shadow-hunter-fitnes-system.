import { Router, Response } from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const challengesRouter = Router();

// Get All Challenges
challengesRouter.get('/', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const challenges = dbStore.getData().fitnessChallenges;
  res.json({ challenges });
});

// Join Challenge
challengesRouter.post('/:id/join', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const challenge = dbStore.getData().fitnessChallenges.find(c => c.id === req.params.id);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

  challenge.joined = true;
  challenge.participantsCount += 1;
  challenge.progressPercent = 10;
  dbStore.save();

  // Create notification
  dbStore.getData().notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: req.user.id,
    title: 'Challenge Joined!',
    message: `You are now competing in "${challenge.title}". Track your progress to earn the ${challenge.badgeName} badge.`,
    type: 'challenge',
    read: false,
    createdAt: new Date().toISOString()
  });
  dbStore.save();

  res.json({ challenge });
});

// Get Achievements
challengesRouter.get('/achievements', requireAuth, (_req: AuthenticatedRequest, res: Response) => {
  const achievements = dbStore.getData().achievements;
  res.json({ achievements });
});
