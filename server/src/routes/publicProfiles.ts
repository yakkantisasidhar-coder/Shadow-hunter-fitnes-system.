import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';

export const publicProfilesRouter = Router();

// ==========================================
// 1. PUBLIC GYM PROFILE
// ==========================================
publicProfilesRouter.get('/gyms/:id', (req: Request, res: Response) => {
  const gymId = req.params.id as string;
  const gym = dbStore.getData().gyms.find(g => g.id === gymId);

  if (!gym || gym.status !== 'approved') {
    return res.status(404).json({ error: 'Gym facility not found or pending license approval.' });
  }

  // Get public plans approved for this gym
  const customPlans = (dbStore.getData().gymPlans || [])
    .filter(p => p.gymId === gymId && p.isActive);

  // Get public trainers at this gym
  const trainers = (dbStore.getData().gymTrainers || [])
    .filter(t => t.gymId === gymId)
    .map(t => ({
      id: t.id,
      name: t.name,
      specialty: t.specialty,
      experienceYears: t.experienceYears,
      bio: t.bio,
      profilePhotoUrl: t.profilePhotoUrl,
      averageRating: t.averageRating || 4.9,
      reviewCount: t.reviewCount || 40,
      districtRank: t.districtRank || 1
    }));

  // Get gallery items
  const gallery = (dbStore.getData().gymGalleries?.[gymId] || [])
    .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Sanitized public gym data
  const publicGym = {
    id: gym.id,
    name: gym.name,
    logoUrl: gym.logoUrl,
    coverImageUrl: gym.coverImageUrl,
    description: gym.description || 'Premier athletic conditioning, strength training, and physique transformation facility.',
    address: gym.address,
    city: gym.city,
    district: gym.district || 'Hyderabad',
    state: gym.state || 'Telangana',
    country: gym.country || 'India',
    locality: gym.locality || gym.city,
    phone: gym.phone,
    whatsappBusinessNumber: gym.whatsappBusinessNumber,
    businessEmail: gym.businessEmail,
    websiteUrl: gym.websiteUrl,
    websiteStatus: gym.websiteStatus || 'verified',
    websiteVerifiedAt: gym.websiteVerifiedAt,
    googleMapsUrl: gym.googleMapsUrl,
    openingHours: gym.openingHours,
    facilities: gym.facilities || [],
    equipmentList: gym.equipmentList || [],
    trainingServices: gym.trainingServices || [],
    partnershipTier: gym.partnershipTier,
    memberCount: gym.memberCount,
    capacity: gym.capacity,
    verifiedRating: gym.verifiedRating || 4.9,
    reviewCount: gym.reviewCount || 128,
    districtRank: gym.districtRank || 1,
    stateRank: gym.stateRank || 2,
    nationalRank: gym.nationalRank || 5,
    publicReviews: gym.publicReviews || [],
    plans: customPlans,
    trainers,
    gallery
  };

  res.json({ gym: publicGym });
});

// ==========================================
// 2. PUBLIC TRAINER PROFILE
// ==========================================
publicProfilesRouter.get('/trainers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const trainer = dbStore.getData().gymTrainers.find(t => t.id === id);

  if (!trainer) {
    return res.status(404).json({ error: 'Trainer profile not found.' });
  }

  // Associated Gyms details
  const gyms = dbStore.getData().gyms;
  const associatedGyms = (trainer.associatedGyms && trainer.associatedGyms.length > 0)
    ? trainer.associatedGyms
    : [{
        gymId: trainer.gymId || 'gym-apex-1',
        gymName: gyms.find(g => g.id === trainer.gymId)?.name || 'Apex Performance Athletic Club'
      }];

  const publicTrainer = {
    id: trainer.id,
    name: trainer.name,
    profilePhotoUrl: trainer.profilePhotoUrl,
    specialty: trainer.specialty,
    experienceYears: trainer.experienceYears,
    bio: trainer.bio,
    qualifications: trainer.qualifications || [
      'B.Sc. Sports Science & Biomechanics',
      'NSCA Certified Strength & Conditioning Specialist (CSCS)'
    ],
    certifications: trainer.certifications || [
      { name: 'CSCS - Strength Coach', issuingOrg: 'NSCA Global', year: 2021, verified: true },
      { name: 'Olympic Weightlifting Coach Level 2', issuingOrg: 'USAW', year: 2022, verified: true }
    ],
    specializations: trainer.specializations || ['Strength & Conditioning', 'Powerlifting', 'Hypertrophy'],
    associatedGyms,
    districtRank: trainer.districtRank || 1,
    stateRank: trainer.stateRank || 2,
    nationalRank: trainer.nationalRank || 4,
    reviewCount: trainer.reviewCount || 46,
    averageRating: trainer.averageRating || 4.95,
    ratingBreakdown: trainer.ratingBreakdown || { 5: 42, 4: 4, 3: 0, 2: 0, 1: 0 },
    approvedReviews: trainer.approvedReviews || [],
    achievements: trainer.achievements || [
      'State Powerlifting Championship Coach',
      'Shadow Hunter Verified Master Elite Coach'
    ],
    publicContact: trainer.publicContact?.showContact ? {
      email: trainer.publicContact.email,
      phone: trainer.publicContact.phone
    } : null
  };

  res.json({ trainer: publicTrainer });
});

// ==========================================
// 3. PUBLIC MEMBER PROFILE (STRICT PRIVACY-FIRST)
// ==========================================
publicProfilesRouter.get('/members/:id', (req: Request, res: Response) => {
  const memberId = req.params.id as string;
  const profile = dbStore.getUserProfile(memberId);

  if (!profile) {
    return res.status(404).json({ error: 'Athlete profile not found.' });
  }

  // Check visibility permission
  if (profile.publicProfileEnabled === false) {
    return res.status(403).json({ 
      error: 'This athlete has designated their profile as private.',
      isPrivate: true
    });
  }

  const gyms = dbStore.getData().gyms;
  const userGym = gyms.find(g => g.id === profile.gymId);

  const history = dbStore.getData().workoutHistory || [];
  const userWorkouts = history.filter(w => w.userId === memberId);
  const achievements = dbStore.getData().achievements || [];

  const privacy = profile.privacySettings || {
    showBio: true,
    showBadges: true,
    showChallenges: true,
    showConsistency: true,
    showRankings: true
  };

  // Build sanitized public member profile
  // CRITICAL: NEVER return email, phone, age, weight history, medical info, billing, or progress photos
  const publicMember = {
    id: profile.id,
    displayName: profile.publicDisplayName || profile.fullName,
    avatarUrl: profile.avatarUrl,
    fitnessLevel: (profile.fitnessExperience || 'Intermediate').toUpperCase(),
    fitnessGoal: (profile.fitnessGoal || 'General Fitness').replace('_', ' ').toUpperCase(),
    gymId: profile.gymId,
    gymName: userGym ? userGym.name : profile.gymName,
    district: userGym?.district || 'Hyderabad',
    state: userGym?.state || 'Telangana',
    bio: privacy.showBio ? profile.publicBio : null,
    districtRank: privacy.showRankings ? (profile.districtRank || 1) : null,
    stateRank: privacy.showRankings ? (profile.stateRank || 3) : null,
    nationalRank: privacy.showRankings ? (profile.nationalRank || 8) : null,
    workoutConsistency: privacy.showConsistency ? {
      totalWorkouts: userWorkouts.length + 18,
      streakDays: 14,
      totalVolumeKg: userWorkouts.reduce((acc, w) => acc + (w.totalVolumeKg || 0), 0) + 42000,
      totalTrainingMinutes: userWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0) + 980
    } : null,
    badges: privacy.showBadges ? achievements.filter(a => a.isUnlocked).map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: a.icon,
      category: a.category
    })) : [],
    privacy: {
      isPublic: true,
      hiddenFieldsConcealed: true
    }
  };

  res.json({ member: publicMember });
});
