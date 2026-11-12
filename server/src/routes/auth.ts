import { Router, Response } from 'express';
import { dbStore } from '../db/store.js';
import { signUserToken, requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { UserProfile } from '../types.js';

export const authRouter = Router();

// Login
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = dbStore.findUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  }

  const profile = dbStore.getUserProfile(user.id);
  if (profile?.isSuspended) {
    return res.status(403).json({ error: 'Account suspended. Please contact platform administration.' });
  }

  const token = signUserToken({ id: user.id, email: user.email, role: user.role });

  dbStore.addAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: 'USER_LOGIN',
    targetType: 'user',
    targetId: user.id,
    details: 'User authenticated successfully.',
    ipAddress: req.ip || '127.0.0.1'
  });

  return res.json({
    token,
    user: profile || {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: 'Fitness User',
      subscriptionTier: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  });
});

// Register
authRouter.post('/register', (req, res) => {
  const {
    email,
    password,
    fullName,
    age,
    gender,
    height,
    currentWeight,
    targetWeight,
    fitnessExperience,
    fitnessGoal,
    workoutLocation,
    activityLevel,
    dietaryPreferences,
    availableWorkoutTime,
    role = 'individual'
  } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Full name, email, and password are required' });
  }

  const existing = dbStore.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const newUserId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  
  const newProfile: UserProfile = {
    id: newUserId,
    email,
    fullName,
    age: age ? Number(age) : undefined,
    gender,
    height: height ? Number(height) : undefined,
    currentWeight: currentWeight ? Number(currentWeight) : undefined,
    targetWeight: targetWeight ? Number(targetWeight) : undefined,
    fitnessExperience: fitnessExperience || 'beginner',
    fitnessGoal: fitnessGoal || 'general_fitness',
    workoutLocation: workoutLocation || 'home',
    activityLevel: activityLevel || 'moderately_active',
    dietaryPreferences: dietaryPreferences || [],
    availableWorkoutTime: availableWorkoutTime ? Number(availableWorkoutTime) : 45,
    role: role as UserProfile['role'],
    subscriptionTier: 'free',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  dbStore.addUser(
    {
      id: newUserId,
      email,
      passwordHash: password,
      role: newProfile.role
    },
    newProfile
  );

  const token = signUserToken({ id: newUserId, email, role: newProfile.role });

  dbStore.addAuditLog({
    actorId: newUserId,
    actorEmail: email,
    actorRole: newProfile.role,
    action: 'USER_REGISTERED',
    targetType: 'user',
    targetId: newUserId,
    details: `New account registered with role: ${newProfile.role}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  return res.status(201).json({
    token,
    user: newProfile
  });
});

// Forgot Password
authRouter.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const user = dbStore.findUserByEmail(email);
  if (!user) {
    // For security, still return success message
    return res.json({ message: 'If an account exists, a secure reset email has been dispatched.' });
  }

  return res.json({ 
    message: 'Password reset instructions have been dispatched to your email.',
    simulatedResetToken: `reset-${Date.now()}` 
  });
});

// Get Current User Profile
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const profile = dbStore.getUserProfile(req.user.id);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  return res.json({ user: profile });
});

// Update Profile
authRouter.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const currentProfile = dbStore.getUserProfile(req.user.id);
  if (!currentProfile) return res.status(404).json({ error: 'Profile not found' });

  const updated: UserProfile = {
    ...currentProfile,
    ...req.body,
    id: currentProfile.id,
    email: currentProfile.email,
    role: currentProfile.role, // role cannot be self-escalated
    updatedAt: new Date().toISOString()
  };

  dbStore.setUserProfile(req.user.id, updated);
  return res.json({ user: updated });
});

// Switch Account (For convenient testing across all 4 account roles)
authRouter.post('/switch-account', (req, res) => {
  const { targetRole } = req.body;
  const accounts: Record<string, string> = {
    'super_admin': 'admin@shadowhunter.com',
    'gym_owner': 'owner@apexfitness.com',
    'gym_member': 'member@apexfitness.com',
    'individual': 'alex@shadowhunter.com'
  };

  const targetEmail = accounts[targetRole];
  if (!targetEmail) {
    return res.status(400).json({ error: 'Invalid target role persona.' });
  }

  const user = dbStore.findUserByEmail(targetEmail);
  if (!user) return res.status(404).json({ error: 'Persona account not found' });

  const profile = dbStore.getUserProfile(user.id);
  const token = signUserToken({ id: user.id, email: user.email, role: user.role });

  return res.json({
    token,
    user: profile
  });
});
