export type UserRole = 'individual' | 'gym_member' | 'gym_owner' | 'super_admin';

export type SubRole = 'moderator' | 'manager' | 'editor' | 'trainer';

export type FitnessGoal = 
  | 'weight_loss' 
  | 'muscle_building' 
  | 'strength_improvement' 
  | 'general_fitness' 
  | 'endurance' 
  | 'flexibility' 
  | 'weight_maintenance';

export type FitnessExperience = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutLocation = 'home' | 'gym' | 'hybrid';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height?: number; // cm
  currentWeight?: number; // kg
  targetWeight?: number; // kg
  fitnessExperience?: FitnessExperience;
  fitnessGoal?: FitnessGoal;
  workoutLocation?: WorkoutLocation;
  activityLevel?: ActivityLevel;
  dietaryPreferences?: string[];
  availableWorkoutTime?: number; // minutes per session
  role: UserRole;
  subRoles?: SubRole[];
  gymId?: string;
  gymName?: string;
  gymStatus?: 'pending' | 'approved' | 'rejected' | 'none';
  subscriptionTier: 'free' | 'monthly' | 'quarterly' | 'annual' | 'gym_collab';
  isSuspended?: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type MuscleGroup = 
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Legs'
  | 'Abs'
  | 'Glutes'
  | 'Full Body'
  | 'Cardio'
  | 'Stretching';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: string[];
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  instructions: string[];
  safetyTips: string[];
  defaultSets: number;
  defaultReps: number;
  defaultRestSeconds: number;
  estimatedCaloriesPerMin: number;
  animationSvgKey: string;
}

export interface WorkoutProgram {
  id: string;
  title: string;
  description: string;
  category: 'Beginner' | 'Intermediate' | 'Advanced' | 'Weight Loss' | 'Muscle Building' | 'Home' | 'Gym' | 'Full Body';
  durationWeeks: number;
  daysPerWeek: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  coverGradient: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    restSeconds: number;
  }[];
}

export interface ActiveWorkoutSession {
  programId?: string;
  programTitle: string;
  startTime: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  timerSeconds: number;
  isPaused: boolean;
  completedExercises: {
    exerciseId: string;
    exerciseName: string;
    setsCompleted: number;
    totalReps: number;
    weightUsedKg?: number;
  }[];
}

export interface WorkoutHistoryItem {
  id: string;
  userId: string;
  programTitle: string;
  completedAt: string;
  durationMinutes: number;
  caloriesBurned: number;
  exercisesCount: number;
  totalSets: number;
  totalVolumeKg: number;
}

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  servingSize: string;
}

export interface DailyNutritionLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  calorieTarget: number;
  waterTargetMl: number;
  waterCurrentMl: number;
  meals: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snacks: MealItem[];
  };
}

export interface BodyMeasurementLog {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  armsCm: number;
  thighsCm: number;
  hipsCm: number;
  calvesCm: number;
  notes?: string;
}

export interface ProgressPhoto {
  id: string;
  userId: string;
  date: string;
  tag: 'front' | 'side' | 'back';
  imageUrl: string;
  weightKg: number;
  notes?: string;
}

export interface FitnessChallenge {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly';
  targetGoal: string;
  durationDays: number;
  xpPoints: number;
  badgeName: string;
  participantsCount: number;
  joined: boolean;
  progressPercent: number;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'workout_count' | 'weight_goal' | 'challenge';
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface Gym {
  id: string;
  name: string;
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
  address: string;
  city: string;
  phone: string;
  joinCode: string;
  capacity: number;
  memberCount: number;
  facilities: string[];
  status: 'pending' | 'approved' | 'suspended';
  partnershipTier: 'standard' | 'premium_collaboration';
  announcementsCount: number;
  createdAt: string;
}

export interface GymMemberRecord {
  id: string;
  gymId: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'pending' | 'active' | 'rejected';
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  appliedAt: string;
  approvedAt?: string;
}

export interface GymTrainer {
  id: string;
  gymId: string;
  name: string;
  email: string;
  specialty: string;
  experienceYears: number;
  bio: string;
  assignedClientsCount: number;
}

export interface GymAnnouncement {
  id: string;
  gymId: string;
  title: string;
  content: string;
  priority: 'normal' | 'high' | 'urgent';
  author: string;
  createdAt: string;
}

export interface GymCompetition {
  id: string;
  gymId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  metric: 'workout_sessions' | 'total_minutes' | 'volume_lifted';
  participants: {
    userId: string;
    userName: string;
    score: number;
    rank: number;
  }[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'individual' | 'gym_collaboration';
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  priceInr: number;
  originalPriceInr?: number;
  discountPercentage?: number;
  features: string[];
  popular?: boolean;
}

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  amountInr: number;
  currency: string;
  planName: string;
  status: 'success' | 'failed' | 'refunded';
  discountApplied: boolean;
  discountCode?: string;
  date: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'workout' | 'challenge' | 'gym' | 'payment' | 'security';
  read: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  targetType: 'user' | 'gym' | 'permission' | 'system' | 'subscription';
  targetId: string;
  details: string;
  ipAddress: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
