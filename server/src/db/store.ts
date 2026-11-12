import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  UserProfile, 
  Exercise, 
  WorkoutProgram, 
  WorkoutHistoryItem, 
  DailyNutritionLog, 
  BodyMeasurementLog, 
  ProgressPhoto, 
  FitnessChallenge, 
  AchievementBadge, 
  Gym, 
  GymMemberRecord, 
  GymTrainer, 
  GymAnnouncement, 
  GymCompetition, 
  SubscriptionPlan, 
  PaymentTransaction, 
  AppNotification, 
  AuditLogItem, 
  ChatMessage,
  GymMessage,
  GymInvoice,
  GymPaymentRecord,
  GymAttendanceRecord,
  GymExpenseRecord,
  GymCustomPlan,
  GymAccessRecord,
  GymPermission,
  PersonalTrainingPackage,
  PersonalTrainingSession,
  TrainerAvailability,
  GymClaimRequest,
  GymBranding,
  GymGalleryItem,
  TeamMember,
  TeamInvite,
  GymWhatsAppIntegration,
  WhatsAppConsentRecord,
  WhatsAppTemplate,
  WhatsAppCampaign,
  WhatsAppMessageLog,
  WhatsAppAutomationSettings,
  GymDesignTemplate
} from '../types.js';
import { SEED_EXERCISES, SEED_WORKOUT_PROGRAMS, SEED_SUBSCRIPTION_PLANS } from './seedData.js';
import { 
  SEED_GYM_PLANS, 
  SEED_GYM_MEMBERS, 
  SEED_GYM_INVOICES, 
  SEED_GYM_PAYMENTS, 
  SEED_GYM_ATTENDANCE, 
  SEED_GYM_EXPENSES 
} from './gymManagementSeed.js';
import {
  SEED_PT_PACKAGES,
  SEED_PT_SESSIONS,
  SEED_TRAINER_AVAILABILITIES,
  SEED_GYM_CLAIMS,
  SEED_GYM_BRANDINGS,
  SEED_GYM_GALLERIES,
  SEED_TEAM_MEMBERS,
  SEED_TEAM_INVITES
} from './ecosystemSeed.js';
import {
  SEED_WHATSAPP_INTEGRATIONS,
  SEED_WHATSAPP_CONSENT_RECORDS,
  SEED_WHATSAPP_TEMPLATES,
  SEED_WHATSAPP_CAMPAIGNS,
  SEED_WHATSAPP_MESSAGE_LOGS,
  SEED_WHATSAPP_AUTOMATION_SETTINGS,
  SEED_GYM_DESIGN_TEMPLATES
} from './whatsappSeed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    role: UserProfile['role'];
  }>;
  userProfiles: Record<string, UserProfile>;
  exercises: Exercise[];
  workoutPrograms: WorkoutProgram[];
  workoutHistory: WorkoutHistoryItem[];
  nutritionLogs: DailyNutritionLog[];
  bodyMeasurements: BodyMeasurementLog[];
  progressPhotos: ProgressPhoto[];
  fitnessChallenges: FitnessChallenge[];
  achievements: AchievementBadge[];
  gyms: Gym[];
  gymMembers: GymMemberRecord[];
  gymTrainers: GymTrainer[];
  gymAnnouncements: GymAnnouncement[];
  gymCompetitions: GymCompetition[];
  subscriptionPlans: SubscriptionPlan[];
  payments: PaymentTransaction[];
  notifications: AppNotification[];
  auditLogs: AuditLogItem[];
  chatMessages: Record<string, ChatMessage[]>;
  gymMessages: GymMessage[];
  gymInvoices: GymInvoice[];
  gymPayments: GymPaymentRecord[];
  gymAttendance: GymAttendanceRecord[];
  gymExpenses: GymExpenseRecord[];
  gymPlans: GymCustomPlan[];
  ptPackages: PersonalTrainingPackage[];
  ptSessions: PersonalTrainingSession[];
  trainerAvailabilities: TrainerAvailability[];
  gymClaims: GymClaimRequest[];
  gymBrandings: Record<string, GymBranding>;
  gymGalleries: Record<string, GymGalleryItem[]>;
  teamMembers: TeamMember[];
  teamInvites: TeamInvite[];
  whatsappIntegrations: Record<string, GymWhatsAppIntegration>;
  whatsappConsentRecords: WhatsAppConsentRecord[];
  whatsappTemplates: WhatsAppTemplate[];
  whatsappCampaigns: WhatsAppCampaign[];
  whatsappMessageLogs: WhatsAppMessageLog[];
  whatsappAutomationSettings: Record<string, WhatsAppAutomationSettings>;
  gymDesignTemplates: GymDesignTemplate[];
}

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectoryExists();
    this.data = this.loadDatabase();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DatabaseSchema = JSON.parse(raw);
        if (!parsed.gymMessages) parsed.gymMessages = [];
        if (!parsed.gymInvoices || parsed.gymInvoices.length === 0) parsed.gymInvoices = SEED_GYM_INVOICES;
        if (!parsed.gymPayments || parsed.gymPayments.length === 0) parsed.gymPayments = SEED_GYM_PAYMENTS;
        if (!parsed.gymAttendance || parsed.gymAttendance.length === 0) parsed.gymAttendance = SEED_GYM_ATTENDANCE;
        if (!parsed.gymExpenses || parsed.gymExpenses.length === 0) parsed.gymExpenses = SEED_GYM_EXPENSES;
        if (!parsed.gymPlans || parsed.gymPlans.length === 0) parsed.gymPlans = SEED_GYM_PLANS;
        if (!parsed.gymMembers || parsed.gymMembers.length <= 1) parsed.gymMembers = SEED_GYM_MEMBERS;

        // Ecosystem entities initialization
        if (!parsed.ptPackages || parsed.ptPackages.length === 0) parsed.ptPackages = SEED_PT_PACKAGES;
        if (!parsed.ptSessions || parsed.ptSessions.length === 0) parsed.ptSessions = SEED_PT_SESSIONS;
        if (!parsed.trainerAvailabilities || parsed.trainerAvailabilities.length === 0) parsed.trainerAvailabilities = SEED_TRAINER_AVAILABILITIES;
        if (!parsed.gymClaims || parsed.gymClaims.length === 0) parsed.gymClaims = SEED_GYM_CLAIMS;
        if (!parsed.gymBrandings || Object.keys(parsed.gymBrandings).length === 0) parsed.gymBrandings = SEED_GYM_BRANDINGS;
        if (!parsed.gymGalleries || Object.keys(parsed.gymGalleries).length === 0) parsed.gymGalleries = SEED_GYM_GALLERIES;
        if (!parsed.teamMembers || parsed.teamMembers.length === 0) parsed.teamMembers = SEED_TEAM_MEMBERS;
        if (!parsed.teamInvites) parsed.teamInvites = SEED_TEAM_INVITES;

        // WhatsApp Communication Entities
        if (!parsed.whatsappIntegrations) parsed.whatsappIntegrations = SEED_WHATSAPP_INTEGRATIONS;
        if (!parsed.whatsappConsentRecords || parsed.whatsappConsentRecords.length === 0) parsed.whatsappConsentRecords = SEED_WHATSAPP_CONSENT_RECORDS;
        if (!parsed.whatsappTemplates || parsed.whatsappTemplates.length === 0) parsed.whatsappTemplates = SEED_WHATSAPP_TEMPLATES;
        if (!parsed.whatsappCampaigns || parsed.whatsappCampaigns.length === 0) parsed.whatsappCampaigns = SEED_WHATSAPP_CAMPAIGNS;
        if (!parsed.whatsappMessageLogs || parsed.whatsappMessageLogs.length === 0) parsed.whatsappMessageLogs = SEED_WHATSAPP_MESSAGE_LOGS;
        if (!parsed.whatsappAutomationSettings) parsed.whatsappAutomationSettings = SEED_WHATSAPP_AUTOMATION_SETTINGS;
        if (!parsed.gymDesignTemplates || parsed.gymDesignTemplates.length === 0) parsed.gymDesignTemplates = SEED_GYM_DESIGN_TEMPLATES;

        // Ensure Gym entries have branding and claim status
        if (parsed.gyms) {
          parsed.gyms.forEach(g => {
            if (!g.claimStatus) {
              g.claimStatus = g.id === 'gym-apex-1' ? 'verified' : (g.id === 'gym-titan-2' ? 'verified' : 'unclaimed');
            }
            if (!g.verificationStatus) {
              g.verificationStatus = 'verified';
            }
            if (!g.logoUrl) {
              g.logoUrl = g.id === 'gym-apex-1'
                ? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80'
                : 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&q=80';
            }
            if (!g.coverImageUrl) {
              g.coverImageUrl = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80';
            }
          });
        }

        // Ensure members have memberCategory & activeServices
        if (parsed.gymMembers) {
          parsed.gymMembers.forEach(m => {
            if (!m.memberCategory) m.memberCategory = 'general';
            if (!m.activeServices) {
              m.activeServices = m.id === 'gm-1' 
                ? ['general_membership', 'personal_training'] 
                : ['general_membership'];
            }
            if (!m.serviceDetails) {
              m.serviceDetails = {
                general: {
                  planName: m.planName || 'Apex Gold Full Access',
                  expiryDate: m.expiryDate || '2026-12-15',
                  monthlyFee: m.monthlyFee || 2500
                },
                personalTraining: m.id === 'gm-1' ? {
                  packageId: 'pt-pkg-apex-1',
                  packageName: '1-on-1 Elite Hypertrophy (12 Sessions)',
                  trainerId: 'trainer-1',
                  trainerName: 'David Miller',
                  totalSessions: 12,
                  remainingSessions: 10
                } : undefined
              };
            }
          });
        }

        // Ensure Marcus Sterling (user-owner-1) has gymAccess records
        if (parsed.userProfiles && parsed.userProfiles['user-owner-1']) {
          const owner = parsed.userProfiles['user-owner-1'];
          if (!owner.gymAccess) {
            owner.gymAccess = {
              'gym-apex-1': {
                gymId: 'gym-apex-1',
                gymName: 'Apex Performance Athletic Club',
                role: 'gym_owner',
                status: 'active',
                permissions: [
                  'manage_gym_members',
                  'view_member_profiles',
                  'manage_memberships',
                  'manage_monthly_bills',
                  'record_payments',
                  'view_financial_reports',
                  'manage_gym_staff',
                  'manage_attendance',
                  'manage_gym_announcements',
                  'edit_gym_info',
                  'manage_personal_training',
                  'manage_branding'
                ],
                assignedAt: new Date(Date.now() - 86400000 * 90).toISOString(),
                assignedBy: 'user-admin-1'
              }
            };
          } else if (owner.gymAccess['gym-apex-1']) {
            if (!owner.gymAccess['gym-apex-1'].permissions.includes('manage_personal_training')) {
              owner.gymAccess['gym-apex-1'].permissions.push('manage_personal_training');
            }
            if (!owner.gymAccess['gym-apex-1'].permissions.includes('manage_branding')) {
              owner.gymAccess['gym-apex-1'].permissions.push('manage_branding');
            }
            if (!owner.gymAccess['gym-apex-1'].permissions.includes('manage_whatsapp')) {
              owner.gymAccess['gym-apex-1'].permissions.push('manage_whatsapp');
            }
          }
        }

        // Hydrate Gym Trainers with Public Profile & Review records
        if (parsed.gymTrainers) {
          parsed.gymTrainers.forEach((t, idx) => {
            if (!t.profilePhotoUrl) {
              t.profilePhotoUrl = idx === 0 
                ? 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=300&q=80'
                : 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80';
            }
            if (!t.qualifications || t.qualifications.length === 0) {
              t.qualifications = [
                'B.Sc. Sports Science & Biomechanics',
                'NSCA Certified Strength & Conditioning Specialist (CSCS)',
                'Precision Nutrition Level 2 Master Coach'
              ];
            }
            if (!t.certifications || t.certifications.length === 0) {
              t.certifications = [
                { name: 'CSCS - Strength Coach', issuingOrg: 'NSCA Global', year: 2021, verified: true },
                { name: 'Olympic Weightlifting Coach Level 2', issuingOrg: 'USAW / IWF', year: 2022, verified: true },
                { name: 'Clinical Sports Rehabilitation', issuingOrg: 'NASM', year: 2023, verified: true }
              ];
            }
            if (!t.specializations || t.specializations.length === 0) {
              t.specializations = ['Powerlifting', 'Hypertrophy Periodization', 'Athletic Conditioning', 'Rehabilitation'];
            }
            if (!t.associatedGyms || t.associatedGyms.length === 0) {
              t.associatedGyms = [
                { gymId: t.gymId || 'gym-apex-1', gymName: 'Apex Performance Athletic Club' }
              ];
            }
            if (!t.districtRank) t.districtRank = idx + 1;
            if (!t.stateRank) t.stateRank = idx + 2;
            if (!t.nationalRank) t.nationalRank = idx + 4;
            if (!t.averageRating) t.averageRating = idx === 0 ? 4.95 : 4.88;
            if (!t.reviewCount) t.reviewCount = idx === 0 ? 46 : 32;
            if (!t.ratingBreakdown) {
              t.ratingBreakdown = { 5: 42, 4: 4, 3: 0, 2: 0, 1: 0 };
            }
            if (!t.achievements || t.achievements.length === 0) {
              t.achievements = [
                'State Powerlifting Championship Coach 2024',
                'Mentored 100+ Athletes to Competition Podium',
                'Shadow Hunter Verified Master Elite Coach'
              ];
            }
            if (!t.publicContact) {
              t.publicContact = {
                email: t.email,
                phone: '+91 91234 56789',
                showContact: true
              };
            }
            if (!t.approvedReviews || t.approvedReviews.length === 0) {
              t.approvedReviews = [
                {
                  id: `trev-1-${t.id}`,
                  studentId: 'user-athlete-1',
                  studentName: 'Alex Reynolds',
                  rating: 5,
                  text: 'David transformed my squat mechanics and periodized programming. Added 35kg to my total in 16 weeks without any joint discomfort.',
                  date: '2026-10-18T11:00:00Z',
                  verifiedStudent: true
                },
                {
                  id: `trev-2-${t.id}`,
                  studentId: 'user-member-1',
                  studentName: 'Sarah Jenkins',
                  rating: 5,
                  text: 'Patient, highly scientific, and holds you strictly accountable to technique before adding load. The best coach I have worked with.',
                  date: '2026-10-05T09:30:00Z',
                  verifiedStudent: true
                }
              ];
            }
          });
        }

        // Hydrate User Profiles with Privacy and Ranking defaults
        if (parsed.userProfiles) {
          Object.values(parsed.userProfiles).forEach((p: any, pIdx) => {
            if (p.publicProfileEnabled === undefined) {
              p.publicProfileEnabled = p.role !== 'super_admin';
            }
            if (!p.publicDisplayName) p.publicDisplayName = p.fullName;
            if (!p.publicBio) {
              p.publicBio = p.role === 'individual' || p.role === 'gym_member'
                ? 'Competitive strength athlete focusing on powerlifting and hypertrophy. Training with consistency on the Shadow Hunter system.'
                : 'Fitness enthusiast & facility leader.';
            }
            if (!p.privacySettings) {
              p.privacySettings = {
                showBio: true,
                showBadges: true,
                showChallenges: true,
                showConsistency: true,
                showRankings: true
              };
            }
            if (!p.districtRank) p.districtRank = pIdx + 1;
            if (!p.stateRank) p.stateRank = pIdx + 3;
            if (!p.nationalRank) p.nationalRank = pIdx + 8;
          });
        }

        return parsed;
      } catch (err) {
        console.error('Error reading db.json, initializing fresh store:', err);
      }
    }
    return this.createInitialData();
  }

  public save() {
    try {
      this.ensureDirectoryExists();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save db.json:', err);
    }
  }

  private createInitialData(): DatabaseSchema {
    const defaultData: DatabaseSchema = {
      users: [
        {
          id: 'user-admin-1',
          email: 'admin@shadowhunter.com',
          passwordHash: 'admin123', // In production use bcrypt
          role: 'super_admin'
        },
        {
          id: 'user-owner-1',
          email: 'owner@apexfitness.com',
          passwordHash: 'owner123',
          role: 'gym_owner'
        },
        {
          id: 'user-member-1',
          email: 'member@apexfitness.com',
          passwordHash: 'member123',
          role: 'gym_member'
        },
        {
          id: 'user-athlete-1',
          email: 'alex@shadowhunter.com',
          passwordHash: 'athlete123',
          role: 'individual'
        }
      ],
      userProfiles: {
        'user-admin-1': {
          id: 'user-admin-1',
          email: 'admin@shadowhunter.com',
          fullName: 'Alexander Vance',
          role: 'super_admin',
          subscriptionTier: 'annual',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        },
        'user-owner-1': {
          id: 'user-owner-1',
          email: 'owner@apexfitness.com',
          fullName: 'Marcus Sterling',
          role: 'gym_owner',
          gymId: 'gym-apex-1',
          gymName: 'Apex Performance Athletic Club',
          gymStatus: 'approved',
          subscriptionTier: 'gym_collab',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
        },
        'user-member-1': {
          id: 'user-member-1',
          email: 'member@apexfitness.com',
          fullName: 'Sarah Jenkins',
          role: 'gym_member',
          gymId: 'gym-apex-1',
          gymName: 'Apex Performance Athletic Club',
          gymStatus: 'approved',
          age: 27,
          gender: 'female',
          height: 168,
          currentWeight: 62.5,
          targetWeight: 58.0,
          fitnessGoal: 'weight_loss',
          fitnessExperience: 'intermediate',
          workoutLocation: 'gym',
          activityLevel: 'moderately_active',
          availableWorkoutTime: 50,
          subscriptionTier: 'monthly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
        },
        'user-athlete-1': {
          id: 'user-athlete-1',
          email: 'alex@shadowhunter.com',
          fullName: 'Alex Reynolds',
          role: 'individual',
          age: 29,
          gender: 'male',
          height: 182,
          currentWeight: 84.0,
          targetWeight: 80.0,
          fitnessGoal: 'muscle_building',
          fitnessExperience: 'intermediate',
          workoutLocation: 'hybrid',
          activityLevel: 'very_active',
          dietaryPreferences: ['High-Protein', 'Low-Sugar'],
          availableWorkoutTime: 60,
          subscriptionTier: 'quarterly',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
        }
      },
      exercises: SEED_EXERCISES,
      workoutPrograms: SEED_WORKOUT_PROGRAMS,
      workoutHistory: [
        {
          id: 'hist-1',
          userId: 'user-athlete-1',
          programTitle: 'Upper / Lower Hypertrophy Split',
          completedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
          durationMinutes: 52,
          caloriesBurned: 420,
          exercisesCount: 5,
          totalSets: 17,
          totalVolumeKg: 4620
        },
        {
          id: 'hist-2',
          userId: 'user-athlete-1',
          programTitle: 'Commercial Gym Strength Mastery',
          completedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          durationMinutes: 60,
          caloriesBurned: 510,
          exercisesCount: 4,
          totalSets: 16,
          totalVolumeKg: 5800
        },
        {
          id: 'hist-3',
          userId: 'user-member-1',
          programTitle: 'Metabolic Fat Loss & Conditioning',
          completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          durationMinutes: 44,
          caloriesBurned: 380,
          exercisesCount: 4,
          totalSets: 14,
          totalVolumeKg: 2100
        }
      ],
      nutritionLogs: [
        {
          id: 'nutr-today-alex',
          userId: 'user-athlete-1',
          date: new Date().toISOString().split('T')[0],
          calorieTarget: 2600,
          waterTargetMl: 3500,
          waterCurrentMl: 2250,
          meals: {
            breakfast: [
              { id: 'm-1', name: 'Rolled Oats with Whey Protein & Berries', calories: 480, proteinGrams: 36, carbsGrams: 64, fatGrams: 9, servingSize: '1 bowl (300g)' },
              { id: 'm-2', name: 'Black Americano Coffee', calories: 5, proteinGrams: 0, carbsGrams: 1, fatGrams: 0, servingSize: '250ml' }
            ],
            lunch: [
              { id: 'm-3', name: 'Grilled Herb Chicken Breast & Quinoa Bowl', calories: 650, proteinGrams: 52, carbsGrams: 62, fatGrams: 14, servingSize: '380g' },
              { id: 'm-4', name: 'Steamed Broccoli & Extra Virgin Olive Oil', calories: 120, proteinGrams: 4, carbsGrams: 8, fatGrams: 8, servingSize: '150g' }
            ],
            dinner: [
              { id: 'm-5', name: 'Baked Atlantic Salmon with Sweet Potato', calories: 590, proteinGrams: 44, carbsGrams: 48, fatGrams: 22, servingSize: '350g' }
            ],
            snacks: [
              { id: 'm-6', name: 'Greek Yogurt 0% with Crushed Almonds', calories: 230, proteinGrams: 22, carbsGrams: 12, fatGrams: 9, servingSize: '200g' }
            ]
          }
        }
      ],
      bodyMeasurements: [
        {
          id: 'meas-1',
          userId: 'user-athlete-1',
          date: new Date(Date.now() - 86400000 * 28).toISOString().split('T')[0],
          weightKg: 86.2,
          chestCm: 106,
          waistCm: 86,
          armsCm: 38.5,
          thighsCm: 61,
          hipsCm: 99,
          calvesCm: 39,
          notes: 'Baseline measurement before high-intensity hyper split cycle.'
        },
        {
          id: 'meas-2',
          userId: 'user-athlete-1',
          date: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0],
          weightKg: 85.1,
          chestCm: 107,
          waistCm: 84.5,
          armsCm: 39.0,
          thighsCm: 61.5,
          hipsCm: 98,
          calvesCm: 39,
          notes: 'Mid-month check. Waist down 1.5cm, arm perimeter expanding.'
        },
        {
          id: 'meas-3',
          userId: 'user-athlete-1',
          date: new Date().toISOString().split('T')[0],
          weightKg: 84.0,
          chestCm: 108,
          waistCm: 83.0,
          armsCm: 39.5,
          thighsCm: 62.0,
          hipsCm: 97,
          calvesCm: 39.2,
          notes: 'Consistent nutrition compliance. Feeling strong and lean.'
        }
      ],
      progressPhotos: [
        {
          id: 'photo-1',
          userId: 'user-athlete-1',
          date: new Date(Date.now() - 86400000 * 28).toISOString().split('T')[0],
          tag: 'front',
          imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80',
          weightKg: 86.2,
          notes: 'Week 1 Front Baseline'
        },
        {
          id: 'photo-2',
          userId: 'user-athlete-1',
          date: new Date().toISOString().split('T')[0],
          tag: 'front',
          imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80',
          weightKg: 84.0,
          notes: 'Week 4 Front Follow-up: Noticeable core definition'
        }
      ],
      fitnessChallenges: [
        {
          id: 'chal-30-day-consistency',
          title: '30-Day Training Streak',
          description: 'Log at least 20 verified workout sessions within 30 days to establish ironclad workout consistency.',
          category: 'monthly',
          targetGoal: '20 Workouts',
          durationDays: 30,
          xpPoints: 500,
          badgeName: 'Iron Consistency',
          participantsCount: 342,
          joined: true,
          progressPercent: 65
        },
        {
          id: 'chal-weekly-volume',
          title: '15,000 kg Weekly Volume',
          description: 'Accumulate a combined 15,000 kg of resistance load in compound movements over 7 days.',
          category: 'weekly',
          targetGoal: '15,000 kg Volume',
          durationDays: 7,
          xpPoints: 200,
          badgeName: 'Volume Pioneer',
          participantsCount: 189,
          joined: true,
          progressPercent: 82
        },
        {
          id: 'chal-hydration-master',
          title: '3-Liter Daily Hydration',
          description: 'Reach your 3000ml water intake goal 5 consecutive days to optimize cellular hydration and recovery.',
          category: 'daily',
          targetGoal: '5 Days Hydration',
          durationDays: 5,
          xpPoints: 100,
          badgeName: 'Optimal Hydration',
          participantsCount: 512,
          joined: false,
          progressPercent: 0
        }
      ],
      achievements: [
        {
          id: 'ach-first-workout',
          title: 'First Step to Greatness',
          description: 'Logged your initial verified workout session.',
          icon: 'Flame',
          category: 'workout_count',
          unlockedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
          isUnlocked: true
        },
        {
          id: 'ach-volume-master',
          title: 'Ton of Steel',
          description: 'Moved over 10,000 kg in total cumulative workout volume.',
          icon: 'Dumbbell',
          category: 'workout_count',
          unlockedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          isUnlocked: true
        },
        {
          id: 'ach-streak-7',
          title: '7-Day Unbroken Streak',
          description: 'Trained or logged nutrition for 7 consecutive days.',
          icon: 'Zap',
          category: 'streak',
          unlockedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          isUnlocked: true
        },
        {
          id: 'ach-weight-goal',
          title: 'Body Recomposition Champ',
          description: 'Achieved first major milestone towards target bodyweight.',
          icon: 'Trophy',
          category: 'weight_goal',
          isUnlocked: false
        }
      ],
      gyms: [
        {
          id: 'gym-apex-1',
          name: 'Apex Performance Athletic Club',
          ownerId: 'user-owner-1',
          ownerEmail: 'owner@apexfitness.com',
          ownerName: 'Marcus Sterling',
          address: '448 Metro Boulevard, Highline District',
          city: 'Metropolis',
          phone: '+1 (555) 234-8990',
          joinCode: 'APEX50',
          capacity: 250,
          memberCount: 88,
          facilities: ['Olympic Weightlifting Platforms', 'Sauna & Ice Bath Recovery', 'Functional Turf Track', 'DEXA Body Composition Scanner'],
          status: 'approved',
          partnershipTier: 'premium_collaboration',
          announcementsCount: 3,
          createdAt: new Date(Date.now() - 86400000 * 90).toISOString()
        },
        {
          id: 'gym-titan-2',
          name: 'Titan Commercial Health Club',
          ownerId: 'user-owner-2',
          ownerEmail: 'manager@titangym.com',
          ownerName: 'Elena Rostova',
          address: '12 Westway Corporate Park',
          city: 'Metropolis',
          phone: '+1 (555) 887-2114',
          joinCode: 'TITAN2025',
          capacity: 400,
          memberCount: 164,
          facilities: ['24/7 Access', 'Cardio Cinema', 'Spinning Theater', 'Powerlifting Zone'],
          status: 'approved',
          partnershipTier: 'standard',
          announcementsCount: 1,
          createdAt: new Date(Date.now() - 86400000 * 60).toISOString()
        }
      ],
      gymMembers: [
        {
          id: 'gm-1',
          gymId: 'gym-apex-1',
          userId: 'user-member-1',
          userName: 'Sarah Jenkins',
          userEmail: 'member@apexfitness.com',
          status: 'active',
          assignedTrainerId: 'trainer-1',
          assignedTrainerName: 'Coach David Miller',
          appliedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          approvedAt: new Date(Date.now() - 86400000 * 29).toISOString()
        }
      ],
      gymTrainers: [
        {
          id: 'trainer-1',
          gymId: 'gym-apex-1',
          name: 'David Miller',
          email: 'david.miller@apexfitness.com',
          specialty: 'Biomechanics & Hypertrophy',
          experienceYears: 8,
          bio: 'Certified CSCS and performance coach specializing in compound lift mechanics and injury reduction.',
          assignedClientsCount: 14
        },
        {
          id: 'trainer-2',
          gymId: 'gym-apex-1',
          name: 'Clara Hughes',
          email: 'clara.hughes@apexfitness.com',
          specialty: 'Metabolic Conditioning & Functional Mobility',
          experienceYears: 6,
          bio: 'Former collegiate track athlete guiding individuals through high-efficiency fat loss and mobility programming.',
          assignedClientsCount: 19
        }
      ],
      gymAnnouncements: [
        {
          id: 'ann-1',
          gymId: 'gym-apex-1',
          title: 'New Rogue Olympic Calibrated Plates Arrived',
          content: 'We have fully upgraded lifting platforms 3 and 4 with calibrated steel plates and competition barbells. Please remember to re-rack your weights.',
          priority: 'normal',
          author: 'Marcus Sterling (Gym Director)',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'ann-2',
          gymId: 'gym-apex-1',
          title: 'Special 50% Partner Member Subscription Discount',
          content: 'All verified Apex members can use code APEX50 on checkout to enjoy an exclusive 50% discount on Shadow Hunter Pro plans!',
          priority: 'high',
          author: 'Apex Administration',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
        }
      ],
      gymCompetitions: [
        {
          id: 'comp-apex-nov',
          gymId: 'gym-apex-1',
          title: 'Autumn Apex Consistency Championship',
          description: 'Who can log the most verified training hours and strict compound sets this month?',
          startDate: '2026-11-01',
          endDate: '2026-11-30',
          metric: 'total_minutes',
          participants: [
            { userId: 'user-member-1', userName: 'Sarah Jenkins', score: 620, rank: 1 },
            { userId: 'user-athlete-1', userName: 'Alex Reynolds', score: 580, rank: 2 },
            { userId: 'user-guest-3', userName: 'Michael Chang', score: 490, rank: 3 }
          ]
        }
      ],
      subscriptionPlans: SEED_SUBSCRIPTION_PLANS,
      payments: [
        {
          id: 'pay-1',
          userId: 'user-athlete-1',
          userEmail: 'alex@shadowhunter.com',
          razorpayPaymentId: 'pay_NmK872Xz991La',
          razorpayOrderId: 'order_NmK77aL01Baa',
          amountInr: 2499,
          currency: 'INR',
          planName: 'Quarterly Peak Performer',
          status: 'success',
          discountApplied: false,
          date: new Date(Date.now() - 86400000 * 14).toISOString()
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-athlete-1',
          title: 'Today’s Workout Ready',
          message: 'Upper / Lower Hypertrophy Split is queued for today. Hydrate and get ready!',
          type: 'workout',
          read: false,
          createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
        },
        {
          id: 'notif-2',
          userId: 'user-athlete-1',
          title: 'Challenge Milestone Achieved',
          message: 'You have completed 65% of the 30-Day Training Streak challenge.',
          type: 'challenge',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ],
      auditLogs: [
        {
          id: 'audit-1',
          timestamp: new Date(Date.now() - 86400000 * 20).toISOString(),
          actorId: 'user-admin-1',
          actorEmail: 'admin@shadowhunter.com',
          actorRole: 'super_admin',
          action: 'APPROVE_GYM',
          targetType: 'gym',
          targetId: 'gym-apex-1',
          details: 'Approved gym registration for Apex Performance Athletic Club.',
          ipAddress: '192.168.1.1'
        },
        {
          id: 'audit-2',
          timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
          actorId: 'user-admin-1',
          actorEmail: 'admin@shadowhunter.com',
          actorRole: 'super_admin',
          action: 'GRANT_ROLE',
          targetType: 'permission',
          targetId: 'user-owner-1',
          details: 'Assigned Gym Leader role scoped to gym-apex-1.',
          ipAddress: '192.168.1.1'
        }
      ],
      chatMessages: {
        'user-athlete-1': [
          {
            id: 'chat-init-1',
            role: 'assistant',
            content: 'Welcome to your SHADOW HUNTER AI Fitness Assistant! I am calibrated with your fitness profile (Target: Muscle Building, Weight: 84kg, Experience: Intermediate). How can I assist your training or nutrition today?',
            timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
          }
        ]
      },
      gymMessages: [
        {
          id: 'msg-1',
          gymId: 'gym-apex-1',
          senderId: 'user-owner-1',
          senderName: 'Marcus Sterling (Gym Director)',
          senderRole: 'gym_owner',
          channel: 'community',
          content: 'Welcome to the Apex Performance Community Board! Let’s crush this week’s training targets.',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'msg-2',
          gymId: 'gym-apex-1',
          senderId: 'user-member-1',
          senderName: 'Sarah Jenkins',
          senderRole: 'gym_member',
          channel: 'trainer_qa',
          targetTrainerId: 'trainer-1',
          targetTrainerName: 'David Miller',
          content: 'Hi Coach David, on the barbell Romanian deadlifts, should I keep my shins perpendicular throughout the entire eccentric descent?',
          createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
        },
        {
          id: 'msg-3',
          gymId: 'gym-apex-1',
          senderId: 'trainer-1',
          senderName: 'Coach David Miller',
          senderRole: 'gym_owner',
          channel: 'trainer_qa',
          targetTrainerId: 'trainer-1',
          targetTrainerName: 'David Miller',
          content: 'Exactly Sarah! Keep a soft knee bend and hinge purely at the hips. The bar should remain in close contact with your thighs and shins.',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
        }
      ],
      gymInvoices: SEED_GYM_INVOICES,
      gymPayments: SEED_GYM_PAYMENTS,
      gymAttendance: SEED_GYM_ATTENDANCE,
      gymExpenses: SEED_GYM_EXPENSES,
      gymPlans: SEED_GYM_PLANS,
      ptPackages: SEED_PT_PACKAGES,
      ptSessions: SEED_PT_SESSIONS,
      trainerAvailabilities: SEED_TRAINER_AVAILABILITIES,
      gymClaims: SEED_GYM_CLAIMS,
      gymBrandings: SEED_GYM_BRANDINGS,
      gymGalleries: SEED_GYM_GALLERIES,
      teamMembers: SEED_TEAM_MEMBERS,
      teamInvites: SEED_TEAM_INVITES,
      whatsappIntegrations: SEED_WHATSAPP_INTEGRATIONS,
      whatsappConsentRecords: SEED_WHATSAPP_CONSENT_RECORDS,
      whatsappTemplates: SEED_WHATSAPP_TEMPLATES,
      whatsappCampaigns: SEED_WHATSAPP_CAMPAIGNS,
      whatsappMessageLogs: SEED_WHATSAPP_MESSAGE_LOGS,
      whatsappAutomationSettings: SEED_WHATSAPP_AUTOMATION_SETTINGS,
      gymDesignTemplates: SEED_GYM_DESIGN_TEMPLATES
    };

    return defaultData;
  }

  // Getters and Mutators
  public getData(): DatabaseSchema {
    return this.data;
  }

  public findUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public getUserProfile(userId: string): UserProfile | undefined {
    return this.data.userProfiles[userId];
  }

  public setUserProfile(userId: string, profile: UserProfile) {
    this.data.userProfiles[userId] = profile;
    this.save();
  }

  public addUser(user: DatabaseSchema['users'][0], profile: UserProfile) {
    this.data.users.push(user);
    this.data.userProfiles[user.id] = profile;
    this.save();
  }

  public addAuditLog(entry: Omit<AuditLogItem, 'id' | 'timestamp'>) {
    const logItem: AuditLogItem = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(logItem);
    this.save();
    return logItem;
  }
}

export const dbStore = new DatabaseStore();
