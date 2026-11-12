import { 
  PersonalTrainingPackage, 
  PersonalTrainingSession, 
  TrainerAvailability, 
  GymClaimRequest, 
  GymBranding, 
  GymGalleryItem, 
  TeamMember, 
  TeamInvite 
} from '../types.js';

export const SEED_PT_PACKAGES: PersonalTrainingPackage[] = [
  {
    id: 'pt-pkg-apex-1',
    gymId: 'gym-apex-1',
    name: '1-on-1 Elite Hypertrophy (12 Sessions)',
    type: 'one_on_one',
    totalSessions: 12,
    priceInr: 14400,
    validityDays: 60,
    description: 'Direct 1-on-1 progressive overload training, form biomechanics, and personalized workout logs with CSCS certified coach.',
    trainerSpecialtyRequired: 'Biomechanics & Hypertrophy',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString()
  },
  {
    id: 'pt-pkg-apex-2',
    gymId: 'gym-apex-1',
    name: '1-on-1 Metabolic Conditioning (8 Sessions)',
    type: 'one_on_one',
    totalSessions: 8,
    priceInr: 9600,
    validityDays: 45,
    description: 'High-intensity conditioning, mobility work, and fat-loss optimization with heart-rate zone tracking.',
    trainerSpecialtyRequired: 'Metabolic Conditioning',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'pt-pkg-apex-3',
    gymId: 'gym-apex-1',
    name: 'Small Group Strength Camp (10 Sessions)',
    type: 'group',
    totalSessions: 10,
    priceInr: 6500,
    validityDays: 30,
    description: 'Semi-private barbell mastery group (max 4 athletes per coach) focusing on Squat, Bench, and Deadlift mechanics.',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];

export const SEED_PT_SESSIONS: PersonalTrainingSession[] = [
  {
    id: 'pt-sess-1',
    gymId: 'gym-apex-1',
    trainerId: 'trainer-1',
    trainerName: 'David Miller',
    memberId: 'gm-1',
    memberName: 'Sarah Jenkins',
    packageId: 'pt-pkg-apex-1',
    packageName: '1-on-1 Elite Hypertrophy (12 Sessions)',
    scheduledAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    durationMinutes: 60,
    status: 'completed',
    sessionNotes: 'Barbell RDL form check passed. Shins perpendicular. Increased working sets to 70kg.',
    completedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
    loggedBy: 'David Miller'
  },
  {
    id: 'pt-sess-2',
    gymId: 'gym-apex-1',
    trainerId: 'trainer-1',
    trainerName: 'David Miller',
    memberId: 'gm-1',
    memberName: 'Sarah Jenkins',
    packageId: 'pt-pkg-apex-1',
    packageName: '1-on-1 Elite Hypertrophy (12 Sessions)',
    scheduledAt: new Date(Date.now() + 86400000 * 1).toISOString(),
    durationMinutes: 60,
    status: 'scheduled',
    sessionNotes: 'Upper body horizontal push/pull focus. Heavy dumbbell bench press warmup.'
  },
  {
    id: 'pt-sess-3',
    gymId: 'gym-apex-1',
    trainerId: 'trainer-2',
    trainerName: 'Clara Hughes',
    memberId: 'gm-4',
    memberName: 'Priya Sharma',
    packageId: 'pt-pkg-apex-2',
    packageName: '1-on-1 Metabolic Conditioning (8 Sessions)',
    scheduledAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    durationMinutes: 45,
    status: 'completed',
    sessionNotes: 'Kettlebell snatch cadence test. Excellent cardiovascular recovery rates.',
    completedAt: new Date(Date.now() - 86400000 * 5 + 2700000).toISOString(),
    loggedBy: 'Clara Hughes'
  }
];

export const SEED_TRAINER_AVAILABILITIES: TrainerAvailability[] = [
  {
    trainerId: 'trainer-1',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    timeSlots: ['06:00 - 07:00', '07:30 - 08:30', '16:00 - 17:00', '17:30 - 18:30', '19:00 - 20:00'],
    maxClients: 15,
    activeClients: 14,
    rating: 4.9,
    completedSessions: 142
  },
  {
    trainerId: 'trainer-2',
    workingDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    timeSlots: ['08:00 - 09:00', '09:30 - 10:30', '17:00 - 18:00', '18:30 - 19:30'],
    maxClients: 20,
    activeClients: 19,
    rating: 4.8,
    completedSessions: 118
  }
];

export const SEED_GYM_CLAIMS: GymClaimRequest[] = [
  {
    id: 'claim-titan-1',
    gymId: 'gym-titan-2',
    gymName: 'Titan Commercial Health Club',
    claimantUserId: 'user-owner-2',
    claimantName: 'Elena Rostova',
    claimantEmail: 'manager@titangym.com',
    claimantPhone: '+1 (555) 887-2114',
    businessRegistrationNumber: 'BRN-TITAN-882914',
    proofDocumentUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80',
    physicalAddressProof: 'Commercial Lease Agreement #CLA-9921, 12 Westway Corporate Park',
    status: 'approved',
    reviewNotes: 'Verified official corporate license document and commercial address lease.',
    submittedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    reviewedAt: new Date(Date.now() - 86400000 * 24).toISOString(),
    reviewedBy: 'Alexander Vance (Super Admin)'
  },
  {
    id: 'claim-metro-pending',
    gymId: 'gym-metro-3',
    gymName: 'Metro Athletics & Iron',
    claimantUserId: 'user-athlete-1',
    claimantName: 'Alex Reynolds',
    claimantEmail: 'alex@shadowhunter.com',
    claimantPhone: '+1 (555) 902-3341',
    businessRegistrationNumber: 'BRN-METRO-44102',
    proofDocumentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    physicalAddressProof: 'Utility Bill & Business Registration Certificate',
    status: 'pending_review',
    reviewNotes: 'Ownership documentation awaiting platform admin verification.',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const SEED_GYM_BRANDINGS: Record<string, GymBranding> = {
  'gym-apex-1': {
    gymId: 'gym-apex-1',
    gymName: 'Apex Performance Athletic Club',
    primaryColor: '#7651D5',
    secondaryColor: '#A58AF5',
    logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
    tagline: 'High Performance Strength, Conditioning & Scientific Recovery',
    customDomain: 'apex.shadowhunter.fitness',
    whiteLabelEnabled: true,
    brandingTier: 'white_label_pro'
  },
  'gym-titan-2': {
    gymId: 'gym-titan-2',
    gymName: 'Titan Commercial Health Club',
    primaryColor: '#2563EB',
    secondaryColor: '#60A5FA',
    logoUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&q=80',
    coverImageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80',
    tagline: '24/7 Elite Commercial Training Equipment & Spin Studios',
    customDomain: 'titan.shadowhunter.fitness',
    whiteLabelEnabled: true,
    brandingTier: 'standard'
  }
};

export const SEED_GYM_GALLERIES: Record<string, GymGalleryItem[]> = {
  'gym-apex-1': [
    {
      id: 'gal-1',
      gymId: 'gym-apex-1',
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
      caption: 'Olympic lifting platforms with competition calibrated discs',
      displayOrder: 1,
      uploadedAt: new Date(Date.now() - 86400000 * 30).toISOString()
    },
    {
      id: 'gal-2',
      gymId: 'gym-apex-1',
      imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=80',
      caption: 'Dumbbell training zone up to 60 kg pairs',
      displayOrder: 2,
      uploadedAt: new Date(Date.now() - 86400000 * 25).toISOString()
    },
    {
      id: 'gal-3',
      gymId: 'gym-apex-1',
      imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80',
      caption: 'Finnish sauna and contrast ice bath recovery suites',
      displayOrder: 3,
      uploadedAt: new Date(Date.now() - 86400000 * 20).toISOString()
    }
  ]
};

export const SEED_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'team-1',
    userId: 'user-admin-1',
    email: 'admin@shadowhunter.com',
    fullName: 'Alexander Vance',
    role: 'super_admin',
    status: 'active',
    allowedGyms: 'all',
    permissions: ['all_platform_permissions'],
    invitedAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    invitedBy: 'SYSTEM_CREATOR',
    acceptedAt: new Date(Date.now() - 86400000 * 180).toISOString()
  },
  {
    id: 'team-2',
    userId: 'user-finance-1',
    email: 'finance@shadowhunter.com',
    fullName: 'Sophia Martinez',
    role: 'finance_manager',
    status: 'active',
    allowedGyms: 'all',
    permissions: ['view_financial_reports', 'manage_monthly_bills', 'view_platform_analytics', 'export_financial_csv'],
    invitedAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    invitedBy: 'admin@shadowhunter.com',
    acceptedAt: new Date(Date.now() - 86400000 * 59).toISOString()
  },
  {
    id: 'team-3',
    email: 'support.lead@shadowhunter.com',
    fullName: 'Liam O’Connor',
    role: 'support_team',
    status: 'active',
    allowedGyms: 'all',
    permissions: ['view_member_profiles', 'view_gym_directory', 'manage_support_tickets'],
    invitedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    invitedBy: 'admin@shadowhunter.com',
    acceptedAt: new Date(Date.now() - 86400000 * 29).toISOString()
  }
];

export const SEED_TEAM_INVITES: TeamInvite[] = [
  {
    id: 'inv-1',
    email: 'moderator.ops@shadowhunter.com',
    role: 'moderator',
    allowedGyms: 'all',
    permissions: ['moderate_gym_community', 'review_reported_content'],
    inviteToken: 'INV-MOD-99104A',
    status: 'pending',
    expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdBy: 'admin@shadowhunter.com'
  }
];
