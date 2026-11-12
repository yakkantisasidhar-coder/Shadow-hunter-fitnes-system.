import { Router, Response } from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth, requireSuperAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { 
  UserRole, 
  SubRole, 
  GymPermission, 
  GymAccessRecord, 
  TeamRole, 
  TeamMember, 
  TeamInvite,
  GymClaimRequest 
} from '../types.js';

export const adminRouter = Router();

// Require Super Admin on all admin subroutes
adminRouter.use(requireAuth, requireSuperAdmin);

// Platform Metrics
adminRouter.get('/metrics', (_req, res) => {
  const users = Object.values(dbStore.getData().userProfiles);
  const gyms = dbStore.getData().gyms;
  const payments = dbStore.getData().payments;
  const workouts = dbStore.getData().workoutHistory;

  const totalRevenueInr = payments.reduce((sum, p) => sum + p.amountInr, 0);
  const activeGyms = gyms.filter(g => g.status === 'approved').length;
  const totalWorkoutsLogged = workouts.length;

  res.json({
    totalUsers: users.length,
    activeGyms,
    totalGyms: gyms.length,
    totalRevenueInr,
    totalWorkoutsLogged,
    subscriptionsCount: payments.length,
    pendingGyms: gyms.filter(g => g.status === 'pending').length
  });
});

// User Administration
adminRouter.get('/users', (req, res) => {
  const { search, role } = req.query;
  let users = Object.values(dbStore.getData().userProfiles);

  if (search) {
    const s = (search as string).toLowerCase();
    users = users.filter(u => u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }

  if (role && role !== 'All') {
    users = users.filter(u => u.role === role);
  }

  res.json({ users });
});

// Suspend / Restore User
adminRouter.post('/users/:id/suspend', (req: AuthenticatedRequest, res: Response) => {
  const { suspend } = req.body; // boolean
  const targetUserId = req.params.id as string;
  const profile = dbStore.getUserProfile(targetUserId);

  if (!profile) return res.status(404).json({ error: 'User profile not found' });
  if (profile.role === 'super_admin') {
    return res.status(403).json({ error: 'Cannot suspend a Super Admin account.' });
  }

  profile.isSuspended = !!suspend;
  dbStore.setUserProfile(targetUserId, profile);

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: suspend ? 'SUSPEND_USER' : 'RESTORE_USER',
    targetType: 'user',
    targetId: targetUserId,
    details: `${suspend ? 'Suspended' : 'Restored'} user account ${profile.email}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ profile });
});

// Role & Permission Management
adminRouter.post('/users/:id/role', (req: AuthenticatedRequest, res: Response) => {
  const targetUserId = req.params.id as string;
  const { role, subRoles, gymId } = req.body;

  const profile = dbStore.getUserProfile(targetUserId);
  const userRecord = dbStore.findUserById(targetUserId);

  if (!profile || !userRecord) return res.status(404).json({ error: 'User not found' });

  const oldRole = profile.role;
  if (role) {
    profile.role = role as UserRole;
    userRecord.role = role as UserRole;
  }

  if (subRoles) {
    profile.subRoles = subRoles as SubRole[];
  }

  if (gymId !== undefined) {
    profile.gymId = gymId;
    const targetGym = dbStore.getData().gyms.find(g => g.id === gymId);
    if (targetGym) {
      profile.gymName = targetGym.name;
    }
  }

  dbStore.setUserProfile(targetUserId, profile);

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'ASSIGN_ROLE',
    targetType: 'permission',
    targetId: targetUserId,
    details: `Updated role for ${profile.email} from ${oldRole} to ${profile.role}. Subroles: ${profile.subRoles?.join(', ') || 'None'}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ profile });
});

// ==========================================
// SUPER HOST: GYM OWNER ACCESS CONTROL
// ==========================================

// 1. View all registered application users with search and gymAccess details
adminRouter.get('/gym-access/users', (req: AuthenticatedRequest, res: Response) => {
  const { search } = req.query;
  let profiles = Object.values(dbStore.getData().userProfiles);

  if (search) {
    const s = (search as string).toLowerCase();
    profiles = profiles.filter(p => 
      p.fullName.toLowerCase().includes(s) || 
      p.email.toLowerCase().includes(s) ||
      p.id.toLowerCase().includes(s)
    );
  }

  const gyms = dbStore.getData().gyms;

  res.json({
    users: profiles.map(p => ({
      id: p.id,
      email: p.email,
      fullName: p.fullName,
      role: p.role,
      isSuspended: p.isSuspended || false,
      gymAccess: p.gymAccess || {},
      avatarUrl: p.avatarUrl
    })),
    gyms
  });
});

// 2. Grant Gym Owner privileges & assign one or multiple gyms with granular permissions
adminRouter.post('/gym-access/grant', (req: AuthenticatedRequest, res: Response) => {
  const { userId, gymIds, permissions, role = 'gym_owner' } = req.body;

  if (!userId || !gymIds || !Array.isArray(gymIds) || gymIds.length === 0) {
    return res.status(400).json({ error: 'Target userId and at least one gymId are required.' });
  }

  const profile = dbStore.getUserProfile(userId);
  const userRecord = dbStore.findUserById(userId);

  if (!profile || !userRecord) {
    return res.status(404).json({ error: 'Target user account not found.' });
  }

  const allGyms = dbStore.getData().gyms;
  if (!profile.gymAccess) profile.gymAccess = {};

  const assignedGymNames: string[] = [];

  const validPermissions: GymPermission[] = permissions && Array.isArray(permissions) ? permissions : [
    'manage_gym_members',
    'view_member_profiles',
    'manage_memberships',
    'manage_monthly_bills',
    'record_payments',
    'view_financial_reports',
    'manage_gym_staff',
    'manage_attendance',
    'manage_gym_announcements',
    'edit_gym_info'
  ];

  for (const gid of gymIds) {
    const gymObj = allGyms.find(g => g.id === gid);
    const gymName = gymObj?.name || gid;
    assignedGymNames.push(gymName);

    profile.gymAccess[gid] = {
      gymId: gid,
      gymName,
      role: role as 'gym_owner',
      status: 'active',
      permissions: validPermissions,
      assignedAt: new Date().toISOString(),
      assignedBy: req.user!.id
    };
  }

  // Update primary role to gym_owner
  profile.role = 'gym_owner';
  userRecord.role = 'gym_owner';
  profile.gymStatus = 'approved';
  if (!profile.gymId) profile.gymId = gymIds[0];
  if (!profile.gymName) profile.gymName = assignedGymNames[0];

  dbStore.setUserProfile(userId, profile);

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'GYM_ACCESS_GRANT',
    targetType: 'permission',
    targetId: userId,
    details: `Super Host granted Gym Owner access for ${profile.email} to: ${assignedGymNames.join(', ')} with ${validPermissions.length} permissions.`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.status(200).json({
    success: true,
    message: `Gym Owner privileges assigned for ${profile.fullName}`,
    profile
  });
});

// 3. Revoke Gym Owner privileges for a gym
adminRouter.post('/gym-access/revoke', (req: AuthenticatedRequest, res: Response) => {
  const { userId, gymId } = req.body;

  if (!userId || !gymId) {
    return res.status(400).json({ error: 'Target userId and gymId are required.' });
  }

  const profile = dbStore.getUserProfile(userId);
  const userRecord = dbStore.findUserById(userId);

  if (!profile || !userRecord) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (profile.gymAccess && profile.gymAccess[gymId]) {
    profile.gymAccess[gymId].status = 'revoked';
  }

  // Check if any other active gym access remains
  const remainingActive = Object.values(profile.gymAccess || {}).some(ga => ga.status === 'active');
  if (!remainingActive) {
    profile.role = 'individual';
    userRecord.role = 'individual';
  }

  dbStore.setUserProfile(userId, profile);

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'GYM_ACCESS_REVOKE',
    targetType: 'permission',
    targetId: userId,
    details: `Super Host revoked Gym Owner privileges for ${profile.email} on gym '${gymId}'.`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({
    success: true,
    message: `Privileges revoked for gym '${gymId}'.`,
    profile
  });
});

// 4. Temporarily suspend / restore gym access
adminRouter.post('/gym-access/status', (req: AuthenticatedRequest, res: Response) => {
  const { userId, gymId, status } = req.body; // 'active' | 'suspended'

  if (!userId || !gymId || !status) {
    return res.status(400).json({ error: 'Target userId, gymId, and status are required.' });
  }

  const profile = dbStore.getUserProfile(userId);
  if (!profile) return res.status(404).json({ error: 'User not found.' });

  if (!profile.gymAccess || !profile.gymAccess[gymId]) {
    return res.status(404).json({ error: 'No gym access record exists for this user and facility.' });
  }

  profile.gymAccess[gymId].status = status as 'active' | 'suspended';
  dbStore.setUserProfile(userId, profile);

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: status === 'suspended' ? 'GYM_ACCESS_SUSPEND' : 'GYM_ACCESS_RESTORE',
    targetType: 'permission',
    targetId: userId,
    details: `Super Host set gym access status to '${status}' for ${profile.email} on gym '${gymId}'.`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({
    success: true,
    message: `Access status updated to '${status}'.`,
    profile
  });
});

// 5. Modify individual permissions for a user's gym grant
adminRouter.post('/gym-access/permissions', (req: AuthenticatedRequest, res: Response) => {
  const { userId, gymId, permissions } = req.body;

  if (!userId || !gymId || !Array.isArray(permissions)) {
    return res.status(400).json({ error: 'Target userId, gymId, and permissions array are required.' });
  }

  const profile = dbStore.getUserProfile(userId);
  if (!profile) return res.status(404).json({ error: 'User not found.' });

  if (!profile.gymAccess || !profile.gymAccess[gymId]) {
    return res.status(404).json({ error: 'No gym access record exists for this facility.' });
  }

  profile.gymAccess[gymId].permissions = permissions as GymPermission[];
  dbStore.setUserProfile(userId, profile);

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'GYM_ACCESS_PERMISSIONS_UPDATE',
    targetType: 'permission',
    targetId: userId,
    details: `Super Host modified permissions for ${profile.email} on gym '${gymId}'. Active: ${permissions.join(', ')}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({
    success: true,
    message: 'Permissions updated successfully.',
    gymAccess: profile.gymAccess[gymId]
  });
});

// 6. View complete authorization history
adminRouter.get('/gym-access/history', (_req, res) => {
  const logs = dbStore.getData().auditLogs.filter(l => 
    l.action.startsWith('GYM_ACCESS_') || 
    l.action === 'ASSIGN_ROLE' ||
    l.action === 'APPROVE_GYM' ||
    l.action === 'UPDATE_GYM_STATUS'
  );
  res.json({ history: logs });
});

// Gym Administration
adminRouter.get('/gyms', (_req, res) => {
  const gyms = dbStore.getData().gyms;
  res.json({ gyms });
});

// Approve or Suspend Gym
adminRouter.post('/gyms/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { status } = req.body; // 'approved' | 'suspended' | 'pending'
  const gymId = req.params.id as string;
  const gym = dbStore.getData().gyms.find(g => g.id === gymId);

  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  gym.status = status;
  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'UPDATE_GYM_STATUS',
    targetType: 'gym',
    targetId: gym.id,
    details: `Updated gym "${gym.name}" status to ${status}.`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ gym });
});

// Audit Logs
adminRouter.get('/audit-logs', (_req, res) => {
  const logs = dbStore.getData().auditLogs;
  res.json({ logs });
});

// Platform Analytics
adminRouter.get('/analytics', (_req, res) => {
  res.json({
    revenueTrend: [
      { month: 'Jul', revenue: 14500 },
      { month: 'Aug', revenue: 23800 },
      { month: 'Sep', revenue: 31200 },
      { month: 'Oct', revenue: 44900 },
      { month: 'Nov', revenue: 58400 }
    ],
    userGrowth: [
      { month: 'Jul', users: 80 },
      { month: 'Aug', users: 140 },
      { month: 'Sep', users: 210 },
      { month: 'Oct', users: 320 },
      { month: 'Nov', users: 450 }
    ],
    activityByDay: [
      { day: 'Mon', sessions: 94 },
      { day: 'Tue', sessions: 112 },
      { day: 'Wed', sessions: 85 },
      { day: 'Thu', sessions: 104 },
      { day: 'Fri', sessions: 128 },
      { day: 'Sat', sessions: 142 },
      { day: 'Sun', sessions: 76 }
    ]
  });
});

// ==========================================
// 8. SUPER ADMIN – GYM NETWORK & CLAIMS
// ==========================================

// Get All Platform Gyms with Claim & Verification Status
adminRouter.get('/gym-network', (_req, res) => {
  const gyms = dbStore.getData().gyms;
  const members = dbStore.getData().gymMembers || [];
  const brandings = dbStore.getData().gymBrandings || {};

  const enriched = gyms.map(gym => {
    const gymMemberList = members.filter(m => m.gymId === gym.id);
    const activeCount = gymMemberList.filter(m => m.status === 'active').length || gym.memberCount || 0;
    const branding = brandings[gym.id];

    return {
      id: gym.id,
      name: gym.name,
      logoUrl: branding?.logoUrl || gym.logoUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=150&q=80',
      coverImageUrl: branding?.coverImageUrl || gym.coverImageUrl,
      ownerId: gym.ownerId,
      ownerName: gym.ownerName,
      ownerEmail: gym.ownerEmail,
      location: `${gym.address}, ${gym.city}`,
      address: gym.address,
      city: gym.city,
      phone: gym.phone,
      joinCode: gym.joinCode,
      totalMembers: gym.memberCount || gymMemberList.length,
      activeMembers: activeCount,
      status: gym.status, // 'approved' | 'suspended' | 'pending'
      subscriptionStatus: gym.partnershipTier === 'premium_collaboration' ? 'Premium Active' : 'Standard Active',
      partnershipTier: gym.partnershipTier,
      claimStatus: gym.claimStatus || 'verified', // 'unclaimed' | 'pending_review' | 'verified' | 'rejected'
      verificationStatus: gym.verificationStatus || 'verified', // 'unverified' | 'under_review' | 'verified'
      claimantId: gym.claimantId,
      ownershipHistory: gym.ownershipHistory || [
        {
          date: gym.createdAt || new Date().toISOString(),
          action: 'FACILITY_FOUNDED',
          ownerId: gym.ownerId,
          ownerName: gym.ownerName,
          actor: 'System Admin',
          notes: 'Initial verified facility enrollment.'
        }
      ]
    };
  });

  res.json({ gyms: enriched });
});

// Get All Gym Claim Requests
adminRouter.get('/claims', (_req, res) => {
  const claims = dbStore.getData().gymClaims || [];
  res.json({ claims });
});

// Review Gym Claim (Approve / Reject / Under Review)
adminRouter.post('/claims/:claimId/review', (req: AuthenticatedRequest, res: Response) => {
  const claimId = req.params.claimId as string;
  const { status, reviewNotes } = req.body; // 'approved' | 'rejected' | 'under_review'

  const claims = dbStore.getData().gymClaims || [];
  const claim = claims.find(c => c.id === claimId);
  if (!claim) return res.status(404).json({ error: 'Claim request not found' });

  const gym = dbStore.getData().gyms.find(g => g.id === claim.gymId);
  if (!gym) return res.status(404).json({ error: 'Associated gym facility not found' });

  claim.status = status;
  claim.reviewNotes = reviewNotes || claim.reviewNotes;
  claim.reviewedAt = new Date().toISOString();
  claim.reviewedBy = req.user?.email || 'Super Admin';

  if (!gym.ownershipHistory) gym.ownershipHistory = [];

  if (status === 'approved') {
    // Transfer ownership to claimant
    gym.ownerId = claim.claimantUserId;
    gym.ownerName = claim.claimantName;
    gym.ownerEmail = claim.claimantEmail;
    gym.claimStatus = 'verified';
    gym.verificationStatus = 'verified';

    gym.ownershipHistory.unshift({
      date: new Date().toISOString(),
      action: 'CLAIM_APPROVED',
      ownerId: claim.claimantUserId,
      ownerName: claim.claimantName,
      actor: req.user!.email,
      notes: reviewNotes || `Approved claim with BRN: ${claim.businessRegistrationNumber}`
    });

    // Grant user gym_owner role & gymAccess
    const profile = dbStore.getUserProfile(claim.claimantUserId);
    if (profile) {
      profile.role = 'gym_owner';
      profile.gymId = gym.id;
      profile.gymName = gym.name;
      profile.gymStatus = 'approved';

      if (!profile.gymAccess) profile.gymAccess = {};
      profile.gymAccess[gym.id] = {
        gymId: gym.id,
        gymName: gym.name,
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
        assignedAt: new Date().toISOString(),
        assignedBy: req.user!.id
      };
      dbStore.setUserProfile(claim.claimantUserId, profile);
    }
  } else if (status === 'rejected') {
    gym.claimStatus = 'rejected';
    gym.verificationStatus = 'unverified';
    gym.ownershipHistory.unshift({
      date: new Date().toISOString(),
      action: 'CLAIM_REJECTED',
      ownerId: claim.claimantUserId,
      ownerName: claim.claimantName,
      actor: req.user!.email,
      notes: reviewNotes || 'Claim was rejected following document review.'
    });
  } else if (status === 'under_review') {
    gym.claimStatus = 'pending_review';
    gym.verificationStatus = 'under_review';
  }

  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: `CLAIM_${status.toUpperCase()}`,
    targetType: 'gym',
    targetId: gym.id,
    details: `Processed claim for "${gym.name}" by ${claim.claimantName} -> ${status}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ claim, gym });
});

// Directly Assign or Revoke Gym Ownership
adminRouter.post('/gym-network/:id/ownership', (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { newOwnerUserId, revokeOnly = false, notes } = req.body;

  const gym = dbStore.getData().gyms.find(g => g.id === gymId);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  if (!gym.ownershipHistory) gym.ownershipHistory = [];

  if (revokeOnly) {
    const oldOwnerName = gym.ownerName;
    const oldOwnerId = gym.ownerId;
    gym.ownerId = '';
    gym.ownerName = 'Unassigned';
    gym.ownerEmail = '';
    gym.claimStatus = 'unclaimed';
    gym.verificationStatus = 'unverified';

    gym.ownershipHistory.unshift({
      date: new Date().toISOString(),
      action: 'OWNERSHIP_REVOKED',
      ownerId: oldOwnerId,
      ownerName: oldOwnerName,
      actor: req.user!.email,
      notes: notes || 'Super Admin revoked gym ownership.'
    });

    dbStore.save();
    return res.json({ success: true, gym });
  }

  if (!newOwnerUserId) {
    return res.status(400).json({ error: 'newOwnerUserId is required to transfer ownership' });
  }

  const newOwnerProfile = dbStore.getUserProfile(newOwnerUserId);
  if (!newOwnerProfile) return res.status(404).json({ error: 'New owner user account not found' });

  gym.ownerId = newOwnerProfile.id;
  gym.ownerName = newOwnerProfile.fullName;
  gym.ownerEmail = newOwnerProfile.email;
  gym.claimStatus = 'verified';
  gym.verificationStatus = 'verified';

  gym.ownershipHistory.unshift({
    date: new Date().toISOString(),
    action: 'OWNERSHIP_TRANSFERRED',
    ownerId: newOwnerProfile.id,
    ownerName: newOwnerProfile.fullName,
    actor: req.user!.email,
    notes: notes || 'Direct ownership assignment by Super Admin.'
  });

  // Update profile
  newOwnerProfile.role = 'gym_owner';
  newOwnerProfile.gymId = gym.id;
  newOwnerProfile.gymName = gym.name;
  if (!newOwnerProfile.gymAccess) newOwnerProfile.gymAccess = {};
  newOwnerProfile.gymAccess[gym.id] = {
    gymId: gym.id,
    gymName: gym.name,
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
    assignedAt: new Date().toISOString(),
    assignedBy: req.user!.id
  };
  dbStore.setUserProfile(newOwnerUserId, newOwnerProfile);

  dbStore.save();
  res.json({ success: true, gym });
});

// View Complete Gym History (Ownership + Audits)
adminRouter.get('/gym-network/:id/history', (req, res) => {
  const gymId = req.params.id as string;
  const gym = dbStore.getData().gyms.find(g => g.id === gymId);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  const auditLogs = dbStore.getData().auditLogs.filter(l => 
    l.targetId === gymId || (l.details && l.details.includes(gym.name))
  );

  res.json({
    gym,
    ownershipHistory: gym.ownershipHistory || [],
    auditLogs
  });
});

// ==========================================
// 9. SUPER ADMIN – MY TEAM MANAGEMENT
// ==========================================

// Get Team Members & Pending Invites
adminRouter.get('/team', (_req, res) => {
  const teamMembers = dbStore.getData().teamMembers || [];
  const teamInvites = dbStore.getData().teamInvites || [];
  res.json({ teamMembers, teamInvites });
});

// Invite Team Member
adminRouter.post('/team/invite', (req: AuthenticatedRequest, res: Response) => {
  const { email, fullName, role, customRoleName, allowedGyms = 'all', permissions = [] } = req.body;

  if (!email || !role) {
    return res.status(400).json({ error: 'Email and team role are required' });
  }

  // PLATFORM OWNER HIERARCHY LOCK:
  // Only platform owner (admin@shadowhunter.com or user-admin-1) can invite Super Admin
  const isPlatformOwner = req.user?.email === 'admin@shadowhunter.com' || req.user?.id === 'user-admin-1';
  if (role === 'super_admin' && !isPlatformOwner) {
    return res.status(403).json({ error: 'Hierarchy Restriction: Only the Platform Owner can grant or invite Super Admin accounts.' });
  }

  const inviteToken = `INV-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const newInvite: TeamInvite = {
    id: `inv-${Date.now()}`,
    email,
    role: role as TeamRole,
    customRoleName,
    allowedGyms: allowedGyms === 'all' ? 'all' : (Array.isArray(allowedGyms) ? allowedGyms : [allowedGyms]),
    permissions: Array.isArray(permissions) ? permissions : [],
    inviteToken,
    status: 'pending',
    expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
    createdAt: new Date().toISOString(),
    createdBy: req.user!.email
  };

  if (!dbStore.getData().teamInvites) dbStore.getData().teamInvites = [];
  dbStore.getData().teamInvites.unshift(newInvite);

  // Also create a teamMember record with status 'invited'
  const newMember: TeamMember = {
    id: `team-${Date.now()}`,
    email,
    fullName: fullName || email.split('@')[0],
    role: role as TeamRole,
    customRoleName,
    status: 'invited',
    allowedGyms: newInvite.allowedGyms,
    permissions: newInvite.permissions,
    invitedAt: new Date().toISOString(),
    invitedBy: req.user!.email
  };

  if (!dbStore.getData().teamMembers) dbStore.getData().teamMembers = [];
  dbStore.getData().teamMembers.push(newMember);

  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'TEAM_INVITE_SENT',
    targetType: 'user',
    targetId: newMember.id,
    details: `Invited "${newMember.fullName}" (${newMember.email}) as ${role} (Token: ${inviteToken})`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.status(201).json({ invite: newInvite, member: newMember });
});

// Edit Team Member Permissions & Scopes
adminRouter.post('/team/:memberId/permissions', (req: AuthenticatedRequest, res: Response) => {
  const memberId = req.params.memberId as string;
  const { role, customRoleName, allowedGyms, permissions } = req.body;

  const members = dbStore.getData().teamMembers || [];
  const member = members.find(m => m.id === memberId);
  if (!member) return res.status(404).json({ error: 'Team member not found' });

  // Hierarchy Protection
  const isPlatformOwner = req.user?.email === 'admin@shadowhunter.com' || req.user?.id === 'user-admin-1';
  if (role === 'super_admin' && member.role !== 'super_admin' && !isPlatformOwner) {
    return res.status(403).json({ error: 'Hierarchy Restriction: Only the Platform Owner can grant Super Admin clearance.' });
  }

  // Prevent team members from escalating their own permissions
  if (member.userId === req.user?.id && !isPlatformOwner) {
    return res.status(403).json({ error: 'Self-Escalation Prohibited: You cannot alter your own team clearance or privileges.' });
  }

  if (role) member.role = role;
  if (customRoleName !== undefined) member.customRoleName = customRoleName;
  if (allowedGyms) member.allowedGyms = allowedGyms;
  if (permissions) member.permissions = permissions;

  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'TEAM_PERMISSIONS_UPDATED',
    targetType: 'permission',
    targetId: member.id,
    details: `Updated permissions for team member "${member.fullName}" (${member.email})`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ member });
});

// Suspend / Restore Team Member
adminRouter.post('/team/:memberId/status', (req: AuthenticatedRequest, res: Response) => {
  const memberId = req.params.memberId as string;
  const { status } = req.body; // 'active' | 'suspended' | 'revoked'

  const members = dbStore.getData().teamMembers || [];
  const member = members.find(m => m.id === memberId);
  if (!member) return res.status(404).json({ error: 'Team member not found' });

  // Cannot suspend or revoke the platform creator
  if (member.email === 'admin@shadowhunter.com' || member.userId === 'user-admin-1') {
    return res.status(403).json({ error: 'Platform Master Protection: The root Platform Owner account cannot be suspended or revoked.' });
  }

  member.status = status;
  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: `TEAM_MEMBER_${status.toUpperCase()}`,
    targetType: 'user',
    targetId: member.id,
    details: `Changed team member "${member.fullName}" status to ${status}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ member });
});

// Revoke and Remove Team Member
adminRouter.delete('/team/:memberId', (req: AuthenticatedRequest, res: Response) => {
  const memberId = req.params.memberId as string;
  const members = dbStore.getData().teamMembers || [];
  const member = members.find(m => m.id === memberId);

  if (!member) return res.status(404).json({ error: 'Team member not found' });

  if (member.email === 'admin@shadowhunter.com' || member.userId === 'user-admin-1') {
    return res.status(403).json({ error: 'Cannot revoke the platform owner account.' });
  }

  dbStore.getData().teamMembers = members.filter(m => m.id !== memberId);
  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'TEAM_MEMBER_REMOVED',
    targetType: 'user',
    targetId: member.id,
    details: `Revoked and removed team member "${member.fullName}" (${member.email})`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ success: true, message: `Team access revoked for ${member.fullName}` });
});

// Team Audit Logs
adminRouter.get('/team/audit', (_req, res) => {
  const logs = dbStore.getData().auditLogs.filter(l => 
    l.action.startsWith('TEAM_') || l.action.startsWith('CLAIM_')
  );
  res.json({ logs });
});

// ==========================================
// SUPER ADMIN – WHATSAPP INTEGRATION HEALTH
// ==========================================

adminRouter.get('/whatsapp-health', (_req, res) => {
  const store = dbStore.getData();
  const integrations = Object.values(store.whatsappIntegrations || {});
  const gyms = store.gyms || [];

  const overview = integrations.map(item => {
    const gym = gyms.find(g => g.id === item.gymId);
    return {
      gymId: item.gymId,
      gymName: gym?.name || item.verifiedName || 'Gym Partner',
      displayPhoneNumber: item.displayPhoneNumber || 'Not Connected',
      status: item.status,
      qualityRating: item.qualityRating || 'UNKNOWN',
      messagingLimitTier: item.messagingLimitTier || 'TIER_50',
      webhookVerified: item.webhookVerified,
      monthlyMessageAllowance: item.monthlyMessageAllowance,
      monthlyMessagesSent: item.monthlyMessagesSent,
      providerChargesInr: item.providerChargesInr,
      lastHealthCheck: item.lastHealthCheck,
      connectedAt: item.connectedAt
    };
  });

  const totals = {
    totalConnected: integrations.filter(i => i.status === 'connected').length,
    totalPending: integrations.filter(i => i.status === 'pending_verification').length,
    totalDisconnected: integrations.filter(i => i.status === 'disconnected').length,
    totalMessagesSent: integrations.reduce((acc, i) => acc + (i.monthlyMessagesSent || 0), 0),
    totalProviderChargesInr: integrations.reduce((acc, i) => acc + (i.providerChargesInr || 0), 0)
  };

  res.json({ integrations: overview, totals });
});

// ==========================================
// SUPER ADMIN – PUBLIC PROFILE & WEBSITE VERIFICATION
// ==========================================

// Verify or Flag Gym Official Website
adminRouter.post('/verify-gym-website', (req: AuthenticatedRequest, res: Response) => {
  const { gymId, action, reviewNotes } = req.body; // action: 'verify' | 'flag' | 'unverify'
  if (!gymId || !action) {
    return res.status(400).json({ error: 'gymId and action are required.' });
  }

  const gym = dbStore.getData().gyms.find(g => g.id === gymId);
  if (!gym) return res.status(404).json({ error: 'Gym not found.' });

  const prevStatus = gym.websiteStatus;
  if (action === 'verify') {
    gym.websiteStatus = 'verified';
    gym.websiteVerifiedAt = new Date().toISOString();
    gym.websiteVerifiedBy = req.user?.id || 'admin';
  } else if (action === 'flag') {
    gym.websiteStatus = 'flagged';
  } else {
    gym.websiteStatus = 'unverified';
  }

  dbStore.addAuditLog({
    actorId: req.user?.id || 'admin',
    actorEmail: req.user?.email || 'admin@shadowhunter.com',
    actorRole: 'super_admin',
    action: `WEBSITE_${action.toUpperCase()}`,
    targetType: 'gym',
    targetId: gymId,
    details: `Official website ${gym.websiteUrl} status updated from '${prevStatus}' to '${gym.websiteStatus}'. Notes: ${reviewNotes || 'Verified by compliance'}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  dbStore.save();
  res.json({ success: true, gymId, websiteStatus: gym.websiteStatus, websiteUrl: gym.websiteUrl });
});

// Verify Trainer Certifications
adminRouter.post('/verify-trainer-certification', (req: AuthenticatedRequest, res: Response) => {
  const { trainerId, certName, verified } = req.body;
  if (!trainerId || !certName) {
    return res.status(400).json({ error: 'trainerId and certName are required.' });
  }

  const trainer = dbStore.getData().gymTrainers.find(t => t.id === trainerId);
  if (!trainer) return res.status(404).json({ error: 'Trainer not found.' });

  if (!trainer.certifications) trainer.certifications = [];
  const cert = trainer.certifications.find(c => c.name.toLowerCase() === certName.toLowerCase());

  if (cert) {
    cert.verified = Boolean(verified);
  } else {
    trainer.certifications.push({
      name: certName,
      issuingOrg: 'Accredited Sports Institution',
      year: new Date().getFullYear(),
      verified: Boolean(verified)
    });
  }

  dbStore.addAuditLog({
    actorId: req.user?.id || 'admin',
    actorEmail: req.user?.email || 'admin@shadowhunter.com',
    actorRole: 'super_admin',
    action: 'TRAINER_CERT_VERIFICATION',
    targetType: 'user',
    targetId: trainerId,
    details: `Certification '${certName}' set to verified=${Boolean(verified)} for coach ${trainer.name}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  dbStore.save();
  res.json({ success: true, trainerId, certifications: trainer.certifications });
});



