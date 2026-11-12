import { Router, Response } from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { MuscleGroup, WorkoutHistoryItem } from '../types.js';

export const workoutsRouter = Router();

// Get Exercises
workoutsRouter.get('/exercises', (req, res) => {
  const { muscleGroup, search } = req.query;
  let exercises = dbStore.getData().exercises;

  if (muscleGroup && muscleGroup !== 'All') {
    exercises = exercises.filter(e => e.muscleGroup.toLowerCase() === (muscleGroup as string).toLowerCase());
  }

  if (search) {
    const term = (search as string).toLowerCase();
    exercises = exercises.filter(e => 
      e.name.toLowerCase().includes(term) || 
      e.description.toLowerCase().includes(term) ||
      e.equipment.toLowerCase().includes(term)
    );
  }

  res.json({ exercises });
});

// Get Single Exercise
workoutsRouter.get('/exercises/:id', (req, res) => {
  const exercise = dbStore.getData().exercises.find(e => e.id === req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
  res.json({ exercise });
});

// Get Workout Programs
workoutsRouter.get('/programs', (req, res) => {
  const { category } = req.query;
  let programs = dbStore.getData().workoutPrograms;

  if (category && category !== 'All') {
    programs = programs.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  res.json({ programs });
});

// Get Single Program
workoutsRouter.get('/programs/:id', (req, res) => {
  const program = dbStore.getData().workoutPrograms.find(p => p.id === req.params.id);
  if (!program) return res.status(404).json({ error: 'Workout program not found' });

  // Populate exercises
  const allExercises = dbStore.getData().exercises;
  const detailedExercises = program.exercises.map(item => {
    const exData = allExercises.find(e => e.id === item.exerciseId);
    return {
      ...item,
      exercise: exData
    };
  });

  res.json({
    program: {
      ...program,
      detailedExercises
    }
  });
});

// Log Workout Session Completion
workoutsRouter.post('/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { programTitle, durationMinutes, caloriesBurned, exercisesCount, totalSets, totalVolumeKg } = req.body;

  const newLog: WorkoutHistoryItem = {
    id: `hist-${Date.now()}`,
    userId: req.user.id,
    programTitle: programTitle || 'Custom Workout Session',
    completedAt: new Date().toISOString(),
    durationMinutes: Number(durationMinutes) || 45,
    caloriesBurned: Number(caloriesBurned) || 350,
    exercisesCount: Number(exercisesCount) || 4,
    totalSets: Number(totalSets) || 12,
    totalVolumeKg: Number(totalVolumeKg) || 1200
  };

  dbStore.getData().workoutHistory.unshift(newLog);
  dbStore.save();

  // Create notification
  dbStore.getData().notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: req.user.id,
    title: 'Workout Logged!',
    message: `Great work! You crushed "${newLog.programTitle}" and burned ~${newLog.caloriesBurned} kcal.`,
    type: 'workout',
    read: false,
    createdAt: new Date().toISOString()
  });
  dbStore.save();

  res.status(201).json({ historyItem: newLog });
});

// Get User Workout History
workoutsRouter.get('/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const history = dbStore.getData().workoutHistory.filter(h => h.userId === req.user?.id);
  
  // Calculate quick stats
  const totalWorkouts = history.length;
  const totalMinutes = history.reduce((sum, h) => sum + h.durationMinutes, 0);
  const totalCalories = history.reduce((sum, h) => sum + h.caloriesBurned, 0);
  const totalVolume = history.reduce((sum, h) => sum + h.totalVolumeKg, 0);

  res.json({
    history,
    summary: {
      totalWorkouts,
      totalMinutes,
      totalCalories,
      totalVolume
    }
  });
});
