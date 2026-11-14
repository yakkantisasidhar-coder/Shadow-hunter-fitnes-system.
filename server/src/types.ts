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
  gymAccess?: Record<string, GymAccessRecord>;
  subscriptionTier: 'free' | 'monthly' | 'quarterly' | 'annual' | 'gym_collab';
  isSuspended?: boolean;
  avatarUrl?: string;
  // Public Profile & Privacy Preferences
  publicProfileEnabled?: boolean;
  publicDisplayName?: string;
  publicBio?: string;
  privacySettings?: {
    showBio: boolean;
    showBadges: boolean;
    showChallenges: boolean;
    showConsistency: boolean;
    showRankings: boolean;
  };
  districtRank?: number;
  stateRank?: number;
  nationalRank?: number;
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
  services?: string[];
  status: 'pending' | 'approved' | 'suspended';
  partnershipTier: 'standard' | 'premium_collaboration';
  announcementsCount: number;
  logoUrl?: string;
  coverImageUrl?: string;
  description?: string;
  openingHours?: string;
  claimStatus?: 'unclaimed' | 'pending_review' | 'verified' | 'rejected';
  verificationStatus?: 'unverified' | 'under_review' | 'verified';
  claimantId?: string;
  ownershipHistory?: Array<{
    date: string;
    action: string;
    ownerId: string;
    ownerName: string;
    actor: string;
    notes?: string;
  }>;
  branding?: GymBranding;
  gallery?: GymGalleryItem[];
  // Public Profile & Website Integration
  websiteUrl?: string;
  websiteStatus?: 'unverified' | 'pending' | 'verified' | 'flagged';
  websiteVerifiedAt?: string;
  websiteVerifiedBy?: string;
  whatsappBusinessNumber?: string;
  businessEmail?: string;
  country?: string;
  state?: string;
  district?: string;
  locality?: string;
  googleMapsUrl?: string;
  equipmentList?: string[];
  trainingServices?: string[];
  districtRank?: number;
  stateRank?: number;
  nationalRank?: number;
  verifiedRating?: number;
  reviewCount?: number;
  publicReviews?: Array<{
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }>;
  createdAt: string;
}

export type GymPermission =
  | 'manage_gym_members'
  | 'view_member_profiles'
  | 'manage_memberships'
  | 'manage_monthly_bills'
  | 'record_payments'
  | 'view_financial_reports'
  | 'manage_gym_staff'
  | 'manage_attendance'
  | 'manage_gym_announcements'
  | 'edit_gym_info'
  | 'manage_personal_training'
  | 'manage_branding'
  | 'manage_whatsapp';

export interface GymAccessRecord {
  gymId: string;
  gymName: string;
  role: 'gym_owner' | 'gym_staff' | 'gym_trainer';
  status: 'active' | 'suspended' | 'revoked';
  permissions: GymPermission[];
  assignedAt: string;
  assignedBy: string;
}

export type MemberCategory = 
  | 'general' 
  | 'personal_training' 
  | 'group_training' 
  | 'online_coaching' 
  | 'trial' 
  | 'inactive' 
  | 'expired';

export type GymActiveService = 
  | 'general_membership' 
  | 'personal_training' 
  | 'group_training' 
  | 'online_coaching';

export interface GymMemberRecord {
  id: string;
  gymId: string;
  userId: string;
  userName: string;
  userEmail: string;
  phone?: string;
  status: 'pending' | 'active' | 'rejected' | 'inactive' | 'expired' | 'suspended';
  memberCategory?: MemberCategory;
  activeServices?: GymActiveService[];
  serviceDetails?: {
    general?: {
      planName: string;
      expiryDate: string;
      monthlyFee: number;
    };
    personalTraining?: {
      packageId: string;
      packageName: string;
      trainerId: string;
      trainerName: string;
      totalSessions: number;
      remainingSessions: number;
    };
    groupTraining?: {
      className: string;
      sessionsPerWeek: number;
    };
    onlineCoaching?: {
      coachName: string;
      appAccessExpires: string;
    };
  };
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  // WhatsApp Contact & Consent
  whatsappNumber?: string;
  countryCode?: string;
  whatsappConsent?: boolean;
  consentDate?: string;
  consentSource?: 'in_person' | 'app_signup' | 'digital_form' | 'qr_code';
  whatsappOptOut?: boolean;
  whatsappOptOutAt?: string;
  communicationPreferences?: {
    promotional: boolean;
    serviceUpdates: boolean;
    workoutReminders: boolean;
  };
  planId?: string;
  planName?: string;
  monthlyFee?: number;
  startDate?: string;
  expiryDate?: string;
  fitnessGoal?: string;
  workoutsCompleted?: number;
  lastActive?: string;
  outstandingBalance?: number;
  paymentStatus?: 'paid' | 'unpaid' | 'overdue' | 'partial';
  appliedAt: string;
  approvedAt?: string;
}

export interface GymInvoice {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  amount: number;
  paidAmount: number;
  billingMonth: string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'partially_paid';
  invoiceType?: 'membership' | 'personal_training';
  packageId?: string;
  packageName?: string;
  generatedAt: string;
  paidAt?: string;
  paymentMethod?: 'cash' | 'upi' | 'online';
  receiptNumber?: string;
  notes?: string;
}

export interface GymPaymentRecord {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  invoiceId?: string;
  amount: number;
  paymentMethod: 'cash' | 'upi' | 'online';
  transactionRef?: string;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
  receiptNumber: string;
}

export interface GymAttendanceRecord {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
}

export interface GymExpenseRecord {
  id: string;
  gymId: string;
  category: 'rent' | 'salaries' | 'equipment' | 'maintenance' | 'utilities' | 'other';
  title: string;
  amount: number;
  date: string;
  recordedBy: string;
}

export interface GymCustomPlan {
  id: string;
  gymId: string;
  name: string;
  monthlyFee: number;
  billingCycle: 'monthly' | 'quarterly' | 'half_yearly' | 'annual';
  durationMonths: number;
  features: string[];
  isActive: boolean;
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
  // Public Trainer Profile additions
  profilePhotoUrl?: string;
  qualifications?: string[];
  certifications?: Array<{
    name: string;
    issuingOrg: string;
    year: number;
    verified: boolean;
  }>;
  specializations?: string[];
  associatedGyms?: Array<{
    gymId: string;
    gymName: string;
  }>;
  districtRank?: number;
  stateRank?: number;
  nationalRank?: number;
  reviewCount?: number;
  averageRating?: number;
  ratingBreakdown?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  approvedReviews?: Array<{
    id: string;
    studentId: string;
    studentName: string;
    rating: number;
    text: string;
    date: string;
    verifiedStudent: boolean;
  }>;
  achievements?: string[];
  publicContact?: {
    email?: string;
    phone?: string;
    showContact: boolean;
  };
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
  type: 'workout' | 'challenge' | 'gym' | 'payment' | 'security' | 'achievement';
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
  targetType: 'user' | 'gym' | 'permission' | 'system' | 'subscription' | 'payment';
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

export interface GymMessage {
  id: string;
  gymId: string;
  senderId: string;
  senderName: string;
  senderRole: UserProfile['role'];
  channel: 'community' | 'trainer_qa';
  targetTrainerId?: string;
  targetTrainerName?: string;
  content: string;
  createdAt: string;
}

// ==========================================
// PERSONAL TRAINING MODULE
// ==========================================

export interface PersonalTrainingPackage {
  id: string;
  gymId: string;
  name: string;
  type: 'one_on_one' | 'group';
  totalSessions: number;
  priceInr: number;
  validityDays: number;
  description?: string;
  trainerSpecialtyRequired?: string;
  isActive: boolean;
  createdAt: string;
}

export interface PersonalTrainingSession {
  id: string;
  gymId: string;
  trainerId: string;
  trainerName: string;
  memberId: string;
  memberName: string;
  packageId: string;
  packageName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  sessionNotes?: string;
  completedAt?: string;
  loggedBy?: string;
}

export interface TrainerAvailability {
  trainerId: string;
  workingDays: string[];
  timeSlots: string[];
  maxClients: number;
  activeClients: number;
  rating: number;
  completedSessions: number;
}

// ==========================================
// GYM CLAIMS & NETWORK
// ==========================================

export interface GymClaimRequest {
  id: string;
  gymId: string;
  gymName: string;
  claimantUserId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  businessRegistrationNumber: string;
  proofDocumentUrl?: string;
  physicalAddressProof?: string;
  status: 'pending_review' | 'under_review' | 'approved' | 'rejected';
  reviewNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// ==========================================
// WHITE-LABEL BRANDING & GALLERY
// ==========================================

export interface GymBranding {
  gymId: string;
  gymName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  coverImageUrl: string;
  tagline: string;
  customDomain?: string;
  whiteLabelEnabled: boolean;
  brandingTier: 'standard' | 'white_label_pro';
}

export interface GymGalleryItem {
  id: string;
  gymId: string;
  imageUrl: string;
  caption: string;
  displayOrder: number;
  uploadedAt: string;
}

// ==========================================
// SUPER ADMIN – MY TEAM
// ==========================================

export type TeamRole = 
  | 'super_admin' 
  | 'admin' 
  | 'finance_manager' 
  | 'support_team' 
  | 'moderator' 
  | 'gym_manager' 
  | 'custom_role';

export interface TeamMember {
  id: string;
  userId?: string;
  email: string;
  fullName: string;
  role: TeamRole;
  customRoleName?: string;
  status: 'active' | 'invited' | 'suspended' | 'revoked';
  allowedGyms: string[] | 'all';
  permissions: string[];
  invitedAt: string;
  invitedBy: string;
  acceptedAt?: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: TeamRole;
  customRoleName?: string;
  allowedGyms: string[] | 'all';
  permissions: string[];
  inviteToken: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: string;
  createdAt: string;
  createdBy: string;
}

// ==========================================
// GYM & MEMBER RANKINGS
// ==========================================

export type RankingScope = 'district' | 'state' | 'national';

export interface GymRankingItem {
  rank: number;
  gymId: string;
  gymName: string;
  logoUrl?: string;
  city: string;
  district?: string;
  state?: string;
  activeAthletes: number;
  avgWorkoutMinutes: number;
  totalVolumeKg: number;
  verifiedAchievements: number;
  complianceRate: string;
  score: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  movement?: 'up' | 'down' | 'same';
  verifiedRating?: number;
  reviewCount?: number;
  websiteUrl?: string;
  websiteStatus?: 'unverified' | 'pending' | 'verified' | 'flagged';
}

export interface MemberRankingItem {
  rank: number;
  gymRank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  gymId: string;
  gymName: string;
  district?: string;
  state?: string;
  fitnessLevel: string;
  workoutsCount: number;
  volumeKg: number;
  trainingMinutes: number;
  verifiedAchievementsCount: number;
  progressScore: number;
  movement?: 'up' | 'down' | 'same';
}

export interface TrainerRankingItem {
  rank: number;
  trainerId: string;
  name: string;
  avatarUrl?: string;
  gymId: string;
  gymName: string;
  district?: string;
  state?: string;
  specialty: string;
  experienceYears: number;
  averageRating: number;
  reviewCount: number;
  assignedClientsCount: number;
  score: number;
  movement?: 'up' | 'down' | 'same';
  verifiedCertificationsCount: number;
}

// ==========================================
// WHATSAPP BUSINESS & ENGAGEMENT SYSTEM
// ==========================================

export type WhatsAppQualityRating = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
export type WhatsAppLimitTier = 'TIER_50' | 'TIER_250' | 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED';

export interface GymWhatsAppIntegration {
  gymId: string;
  status: 'connected' | 'disconnected' | 'pending_verification' | 'restricted';
  phoneNumberId?: string;
  wabaId?: string;
  displayPhoneNumber?: string;
  verifiedName?: string;
  qualityRating?: WhatsAppQualityRating;
  messagingLimitTier?: WhatsAppLimitTier;
  accessTokenEncrypted?: string;
  webhookVerified: boolean;
  webhookSecret?: string;
  lastHealthCheck?: string;
  monthlyMessageAllowance: number;
  monthlyMessagesSent: number;
  providerChargesInr: number;
  connectedAt?: string;
  disconnectedAt?: string;
  errorSummary?: string;
}

export interface WhatsAppConsentRecord {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  phoneNumber: string;
  whatsappNumber: string;
  countryCode: string;
  hasConsent: boolean;
  consentDate: string;
  consentSource: 'in_person' | 'app_signup' | 'digital_form' | 'qr_code';
  preferences: {
    promotional: boolean;
    serviceUpdates: boolean;
    workoutReminders: boolean;
  };
  optedOut: boolean;
  optedOutAt?: string;
  updatedAt: string;
}

export type WhatsAppTemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type WhatsAppTemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED';
export type WhatsAppHeaderType = 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';

export interface WhatsAppTemplate {
  id: string;
  gymId: string;
  name: string;
  category: WhatsAppTemplateCategory;
  language: string;
  metaStatus: WhatsAppTemplateStatus;
  headerType: WhatsAppHeaderType;
  headerTextOrMediaUrl?: string;
  bodyText: string;
  footerText?: string;
  buttons?: Array<{ type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'; text: string; value?: string }>;
  exampleVariables: Record<string, string>;
  rejectionReason?: string;
  createdAt: string;
}

export type WhatsAppCampaignType = 
  | 'festival' 
  | 'renewal_reminder' 
  | 'announcement' 
  | 'fitness_tip' 
  | 'birthday' 
  | 'general';

export interface WhatsAppCampaign {
  id: string;
  gymId: string;
  name: string;
  type: WhatsAppCampaignType;
  occasionKey?: string;
  templateId?: string;
  messageBody: string;
  posterImageUrl?: string;
  posterTitle?: string;
  targetAudience: 'all_consented' | 'active' | 'expiring' | 'pt' | 'group' | 'trial' | 'custom';
  customMemberIds?: string[] | null;
  scheduledAt?: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled' | 'failed';
  stats: {
    eligible: number;
    submitted: number;
    delivered: number;
    read: number;
    failed: number;
    skippedNoConsent: number;
  };
  urgent?: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface WhatsAppMessageLog {
  id: string;
  gymId: string;
  campaignId?: string;
  campaignName?: string;
  memberId: string;
  memberName: string;
  recipientNumberMasked: string;
  category: 'MARKETING' | 'UTILITY';
  providerMessageId?: string;
  messageContentSnippet: string;
  hasMedia: boolean;
  mediaUrl?: string;
  status: 'queued' | 'submitted' | 'delivered' | 'read' | 'failed';
  failureReason?: string;
  submittedAt: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface WhatsAppAutomationTriggerConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  timingHoursBeforeOrAfter: number;
  templateId?: string;
  posterTemplateId?: string;
  requireApproval: boolean;
  category: 'onboarding' | 'lifecycle' | 'billing' | 'attendance' | 'training' | 'facility';
}

export interface WhatsAppAutomationSettings {
  gymId: string;
  triggers: Record<string, WhatsAppAutomationTriggerConfig>;
  quietHours: {
    enabled: boolean;
    start: string; // e.g. "21:00"
    end: string;   // e.g. "08:00"
  };
  timezone: string; // e.g. "Asia/Kolkata"
  duplicateSuppressionHours: number;
  isPaused: boolean;
  updatedAt: string;
}

export interface GymDesignTemplate {
  id: string;
  gymId: string; // 'system' or specific gymId
  title: string;
  category: 'festival' | 'announcement' | 'fitness_content' | 'membership_business';
  subCategory: string; // e.g. 'diwali', 'sankranti', 'maintenance', 'motivation', 'renewal'
  backgroundUrl: string;
  backgroundColor: string;
  headline: string;
  subheadline: string;
  badgeText?: string;
  fontFamily: string;
  textColor: string;
  accentColor: string;
  showLogo: boolean;
  showGymName: boolean;
  showContactInfo: boolean;
  previewUrl: string;
  isAiGenerated?: boolean;
  aiPrompt?: string;
  createdAt: string;
}

// ==========================================
// PHASE 1: DYNAMIC MISSIONS & POINTS ENGINE
// ==========================================

export type ChallengeFrequency = 'daily' | 'weekly' | 'monthly' | 'special_event';
export type ChallengeDiscipline = 
  | 'Strength' 
  | 'Cardio' 
  | 'Flexibility' 
  | 'Endurance' 
  | 'Consistency' 
  | 'Weight Management' 
  | 'Personal Training' 
  | 'Group Activities' 
  | 'General Fitness';

export interface DynamicMission {
  id: string;
  title: string;
  description: string;
  discipline: ChallengeDiscipline;
  frequency: ChallengeFrequency;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite';
  xpPoints: number;
  badgeName?: string;
  badgeIcon?: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  isActive: boolean;
  targetGymId?: string; // Optional: gym specific or global
  targetRegion?: string;
  verificationMethod: 'workout_record' | 'attendance_checkin' | 'trainer_confirmation' | 'backend_calculation';
  criteria: {
    workoutCount?: number;
    totalDurationMinutes?: number;
    caloriesBurned?: number;
    totalVolumeKg?: number;
    attendanceCount?: number;
    streakDays?: number;
    specificExerciseId?: string;
    specificReps?: number;
  };
  participantsCount: number;
  completionsCount: number;
  createdAt: string;
  createdBy: string;
}

export interface PointTransaction {
  id: string;
  userId: string;
  gymId?: string;
  challengeId?: string;
  pointsEarned: number;
  reason: string;
  verificationStatus: 'verified' | 'pending' | 'flagged';
  verifiedBy?: string;
  transactionRef: string;
  timestamp: string;
}

export interface UserMissionProgress {
  userId: string;
  missionId: string;
  frequency: ChallengeFrequency;
  status: 'in_progress' | 'completed' | 'claimed' | 'expired';
  currentValue: number;
  targetValue: number;
  percent: number;
  verifiedAt?: string;
  claimedAt?: string;
  periodKey: string; // e.g. "2026-11-14" for daily, "2026-W46" for weekly, "2026-11" for monthly
}

// ==========================================
// PHASE 2: SUPER HOST ID & SUBSCRIPTION ENTITLEMENTS
// ==========================================

export interface PermanentIdRecord {
  id: string; // e.g. "SH-000001", "GYM-000125", "TR-000245", "MEM-001245", "STF-000125"
  entityType: 'super_host' | 'gym_owner' | 'trainer' | 'member' | 'staff';
  targetUserId: string;
  targetGymId?: string;
  allocatedAt: string;
}

export interface GymSubscriptionEntitlement {
  gymId: string;
  planId: string;
  planName: string;
  status: 'active' | 'trial' | 'grace_period' | 'suspended' | 'cancelled' | 'expired';
  startDate: string;
  expiryDate: string;
  maxMembers: number;
  maxStaff: number;
  currentMembers: number;
  currentStaff: number;
  enabledFeatures: string[];
  discountPercent?: number;
  trialDaysLeft?: number;
  lastPaymentRef?: string;
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PlatformStaffPermissionGroup {
  id: string;
  name: string;
  description: string;
  permissions: Array<
    | 'view_gyms'
    | 'manage_gyms'
    | 'manage_subscriptions'
    | 'view_financial_reports'
    | 'manage_users'
    | 'manage_trainers'
    | 'manage_support_tickets'
    | 'manage_campaigns'
    | 'audit_security'
  >;
  assignedGymIds?: string[]; // Empty means all platform gyms
  createdAt: string;
}




