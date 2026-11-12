import { Router, Response } from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { BodyMeasurementLog, ProgressPhoto } from '../types.js';

export const progressRouter = Router();

// Get Measurements History
progressRouter.get('/measurements', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const measurements = dbStore.getData().bodyMeasurements
    .filter(m => m.userId === req.user?.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  res.json({ measurements });
});

// Log New Measurement
progressRouter.post('/measurements', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { weightKg, chestCm, waistCm, armsCm, thighsCm, hipsCm, calvesCm, notes } = req.body;

  const newLog: BodyMeasurementLog = {
    id: `meas-${Date.now()}`,
    userId: req.user.id,
    date: new Date().toISOString().split('T')[0],
    weightKg: Number(weightKg),
    chestCm: Number(chestCm) || 0,
    waistCm: Number(waistCm) || 0,
    armsCm: Number(armsCm) || 0,
    thighsCm: Number(thighsCm) || 0,
    hipsCm: Number(hipsCm) || 0,
    calvesCm: Number(calvesCm) || 0,
    notes: notes || ''
  };

  dbStore.getData().bodyMeasurements.push(newLog);

  // Also update user profile currentWeight
  const profile = dbStore.getUserProfile(req.user.id);
  if (profile && weightKg) {
    profile.currentWeight = Number(weightKg);
    dbStore.setUserProfile(req.user.id, profile);
  }

  dbStore.save();
  res.status(201).json({ measurement: newLog });
});

// Get Progress Photos
progressRouter.get('/photos', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const photos = dbStore.getData().progressPhotos
    .filter(p => p.userId === req.user?.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  res.json({ photos });
});

// Upload/Log Progress Photo
progressRouter.post('/photos', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { tag, imageUrl, weightKg, notes } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

  const newPhoto: ProgressPhoto = {
    id: `photo-${Date.now()}`,
    userId: req.user.id,
    date: new Date().toISOString().split('T')[0],
    tag: tag || 'front',
    imageUrl,
    weightKg: Number(weightKg) || 80,
    notes: notes || ''
  };

  dbStore.getData().progressPhotos.push(newPhoto);
  dbStore.save();

  res.status(201).json({ photo: newPhoto });
});

// Consolidated Analytics
progressRouter.get('/analytics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const userHistory = dbStore.getData().workoutHistory.filter(h => h.userId === req.user?.id);
  const userMeasurements = dbStore.getData().bodyMeasurements.filter(m => m.userId === req.user?.id);

  // Weight Trend Data
  const weightTrend = userMeasurements.map(m => ({
    date: m.date,
    weight: m.weightKg,
    waist: m.waistCm,
    chest: m.chestCm
  }));

  // Workout Volume and Duration Trend
  const workoutVolume = userHistory.map(h => ({
    date: h.completedAt.split('T')[0],
    volumeKg: h.totalVolumeKg,
    durationMin: h.durationMinutes,
    calories: h.caloriesBurned
  }));

  res.json({
    weightTrend,
    workoutVolume,
    stats: {
      totalWorkouts: userHistory.length,
      loggedMeasurementsCount: userMeasurements.length,
      currentWeight: userMeasurements.length > 0 ? userMeasurements[userMeasurements.length - 1].weightKg : 80
    }
  });
});
