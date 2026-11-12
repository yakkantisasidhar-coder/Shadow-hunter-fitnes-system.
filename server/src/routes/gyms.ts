import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth, requireRole, requireGymPermission, AuthenticatedRequest } from '../middleware/auth.js';
import { 
  Gym, 
  GymMemberRecord, 
  GymTrainer, 
  GymAnnouncement, 
  GymMessage,
  GymInvoice,
  GymPaymentRecord,
  GymAttendanceRecord,
  GymExpenseRecord,
  GymCustomPlan,
  PersonalTrainingPackage,
  PersonalTrainingSession,
  TrainerAvailability,
  GymBranding,
  GymGalleryItem,
  GymClaimRequest,
  MemberCategory,
  GymActiveService
} from '../types.js';

export const gymsRouter = Router();

// List Gyms
gymsRouter.get('/', (_req, res) => {
  const gyms = dbStore.getData().gyms;
  res.json({ gyms });
});

// Register Gym (Gym Owner)
gymsRouter.post('/register', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, address, city, phone, capacity, facilities, partnershipTier = 'standard' } = req.body;
  if (!name || !address || !phone) {
    return res.status(400).json({ error: 'Gym name, address, and contact phone are required' });
  }

  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 4);
  const joinCode = `${cleanName}${Math.floor(1000 + Math.random() * 9000)}`;

  const newGym: Gym = {
    id: `gym-${Date.now()}`,
    name,
    ownerId: req.user.id,
    ownerEmail: req.user.email,
    ownerName: dbStore.getUserProfile(req.user.id)?.fullName || 'Gym Owner',
    address,
    city: city || 'Metropolis',
    phone,
    joinCode,
    capacity: Number(capacity) || 200,
    memberCount: 1,
    facilities: facilities || ['Weightlifting Area', 'Cardio Deck', 'Locker Rooms'],
    status: 'approved', // Auto-approved for development/demo, super admin can suspend
    partnershipTier: partnershipTier as 'standard' | 'premium_collaboration',
    announcementsCount: 1,
    createdAt: new Date().toISOString()
  };

  dbStore.getData().gyms.push(newGym);

  // Upgrade user role to gym_owner
  const profile = dbStore.getUserProfile(req.user.id);
  if (profile) {
    profile.role = 'gym_owner';
    profile.gymId = newGym.id;
    profile.gymName = newGym.name;
    profile.gymStatus = 'approved';
    dbStore.setUserProfile(req.user.id, profile);
  }

  // Create initial announcement
  dbStore.getData().gymAnnouncements.push({
    id: `ann-${Date.now()}`,
    gymId: newGym.id,
    title: 'Welcome to ' + newGym.name,
    content: 'Our official facility portal is now live on Shadow Hunter Fitness System. Members can join using code: ' + joinCode,
    priority: 'normal',
    author: newGym.ownerName,
    createdAt: new Date().toISOString()
  });

  dbStore.addAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    actorRole: req.user.role,
    action: 'REGISTER_GYM',
    targetType: 'gym',
    targetId: newGym.id,
    details: `Registered gym "${newGym.name}" with join code ${joinCode}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  dbStore.save();
  res.status(201).json({ gym: newGym });
});

// Join Gym using Code
gymsRouter.post('/join-by-code', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { joinCode } = req.body;
  if (!joinCode) return res.status(400).json({ error: 'Gym join code is required' });

  const gym = dbStore.getData().gyms.find(g => g.joinCode.toUpperCase() === joinCode.trim().toUpperCase());
  if (!gym) return res.status(404).json({ error: 'Invalid gym code. Please check with your gym front desk.' });

  const userProfile = dbStore.getUserProfile(req.user.id);
  if (!userProfile) return res.status(404).json({ error: 'User profile not found' });

  // Check if existing membership
  const existingMember = dbStore.getData().gymMembers.find(m => m.gymId === gym.id && m.userId === req.user?.id);
  if (existingMember) {
    return res.status(400).json({ error: `You have already applied to this gym. Status: ${existingMember.status}` });
  }

  const memberRecord: GymMemberRecord = {
    id: `gm-${Date.now()}`,
    gymId: gym.id,
    userId: req.user.id,
    userName: userProfile.fullName,
    userEmail: userProfile.email,
    status: 'pending',
    appliedAt: new Date().toISOString()
  };

  dbStore.getData().gymMembers.push(memberRecord);

  userProfile.gymId = gym.id;
  userProfile.gymName = gym.name;
  userProfile.gymStatus = 'pending';
  dbStore.setUserProfile(req.user.id, userProfile);

  // Notify Gym Owner
  dbStore.getData().notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: gym.ownerId,
    title: 'New Member Application',
    message: `${userProfile.fullName} (${userProfile.email}) applied to join ${gym.name}.`,
    type: 'gym',
    read: false,
    createdAt: new Date().toISOString()
  });

  dbStore.save();
  res.json({ message: 'Application submitted! Pending approval from gym owner.', memberRecord });
});

// Get Specific Gym Details
gymsRouter.get('/:id', (req, res) => {
  const gym = dbStore.getData().gyms.find(g => g.id === req.params.id);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  const trainers = dbStore.getData().gymTrainers.filter(t => t.gymId === gym.id);
  const announcements = dbStore.getData().gymAnnouncements.filter(a => a.gymId === gym.id);
  const competitions = dbStore.getData().gymCompetitions.filter(c => c.gymId === gym.id);

  res.json({
    gym,
    trainers,
    announcements,
    competitions
  });
});

// ==========================================
// 1. MEMBER MANAGEMENT
// ==========================================

// Get Gym Members with filtering, category, sorting, and search
gymsRouter.get('/:id/members', requireAuth, requireGymPermission('view_member_profiles'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { status, category, search, sortBy } = req.query;

  let members = (dbStore.getData().gymMembers || []).filter(m => m.gymId === gymId);

  if (status && status !== 'all') {
    members = members.filter(m => m.status === status);
  }

  if (category && category !== 'all') {
    members = members.filter(m => m.memberCategory === category || (m.activeServices && m.activeServices.includes(category as any)));
  }

  if (search) {
    const s = (search as string).toLowerCase();
    members = members.filter(m => 
      m.userName.toLowerCase().includes(s) || 
      m.userEmail.toLowerCase().includes(s) ||
      (m.phone && m.phone.toLowerCase().includes(s)) ||
      (m.planName && m.planName.toLowerCase().includes(s))
    );
  }

  // Sorting
  if (sortBy === 'name') {
    members.sort((a, b) => a.userName.localeCompare(b.userName));
  } else if (sortBy === 'expiryDate') {
    members.sort((a, b) => (a.expiryDate || '').localeCompare(b.expiryDate || ''));
  } else if (sortBy === 'balance') {
    members.sort((a, b) => (b.outstandingBalance || 0) - (a.outstandingBalance || 0));
  }

  res.json({ members });
});

// Get Detailed Member Profile & History
gymsRouter.get('/:id/members/:memberId', requireAuth, requireGymPermission('view_member_profiles'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const memberId = req.params.memberId as string;

  const member = (dbStore.getData().gymMembers || []).find(m => m.id === memberId && m.gymId === gymId);
  if (!member) return res.status(404).json({ error: 'Member not found in facility records' });

  const invoices = (dbStore.getData().gymInvoices || []).filter(inv => inv.gymId === gymId && (inv.memberId === member.id || inv.memberId === member.userId));
  const payments = (dbStore.getData().gymPayments || []).filter(p => p.gymId === gymId && (p.memberId === member.id || p.memberId === member.userId));
  const attendance = (dbStore.getData().gymAttendance || []).filter(a => a.gymId === gymId && (a.memberId === member.id || a.memberId === member.userId));
  const userProfile = dbStore.getUserProfile(member.userId);
  const workoutLogs = (dbStore.getData().workoutHistory || []).filter(w => w.userId === member.userId);
  const ptSessions = (dbStore.getData().ptSessions || []).filter(s => s.gymId === gymId && (s.memberId === member.id || s.memberId === member.userId));

  res.json({
    member,
    userProfile,
    invoices,
    payments,
    attendance,
    workoutLogs,
    ptSessions
  });
});

// Add New Member to Gym (supporting memberCategory and activeServices)
gymsRouter.post('/:id/members', requireAuth, requireGymPermission('manage_gym_members'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const gym = dbStore.getData().gyms.find(g => g.id === gymId);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  const {
    userName,
    userEmail,
    phone,
    planId,
    planName,
    monthlyFee,
    startDate,
    expiryDate,
    assignedTrainerId,
    assignedTrainerName,
    fitnessGoal,
    memberCategory = 'general',
    activeServices = ['general_membership'],
    serviceDetails
  } = req.body;

  if (!userName || !userEmail) {
    return res.status(400).json({ error: 'Member name and email are required' });
  }

  const existing = (dbStore.getData().gymMembers || []).find(m => m.gymId === gymId && m.userEmail.toLowerCase() === userEmail.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'A member with this email is already registered in this gym.' });
  }

  const newMember: GymMemberRecord = {
    id: `gm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gymId,
    userId: `user-guest-${Date.now()}`,
    userName,
    userEmail,
    phone: phone || '',
    status: 'active',
    memberCategory: memberCategory as MemberCategory,
    activeServices: Array.isArray(activeServices) ? activeServices : ['general_membership'],
    serviceDetails: serviceDetails || {
      general: {
        planName: planName || 'Apex Gold All-Access',
        expiryDate: expiryDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        monthlyFee: Number(monthlyFee) || 2500
      }
    },
    planId: planId || 'plan-apex-1',
    planName: planName || 'Apex Gold All-Access',
    monthlyFee: Number(monthlyFee) || 2500,
    startDate: startDate || new Date().toISOString().split('T')[0],
    expiryDate: expiryDate || new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    fitnessGoal: fitnessGoal || 'General Fitness',
    workoutsCompleted: 0,
    lastActive: new Date().toISOString(),
    outstandingBalance: 0,
    assignedTrainerId,
    assignedTrainerName,
    appliedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString()
  };

  dbStore.getData().gymMembers.unshift(newMember);
  gym.memberCount += 1;
  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'ADD_GYM_MEMBER',
    targetType: 'user',
    targetId: newMember.id,
    details: `Added new gym member "${userName}" (${userEmail}) to ${gym.name} (Category: ${memberCategory})`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.status(201).json({ member: newMember });
});

// Update Member Details / Membership & Services
gymsRouter.put('/:id/members/:memberId', requireAuth, requireGymPermission('manage_memberships'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const memberId = req.params.memberId as string;

  const member = (dbStore.getData().gymMembers || []).find(m => m.id === memberId && m.gymId === gymId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const {
    userName,
    phone,
    planId,
    planName,
    monthlyFee,
    startDate,
    expiryDate,
    status,
    assignedTrainerId,
    assignedTrainerName,
    fitnessGoal,
    memberCategory,
    activeServices,
    serviceDetails
  } = req.body;

  if (userName) member.userName = userName;
  if (phone !== undefined) member.phone = phone;
  if (planId) member.planId = planId;
  if (planName) member.planName = planName;
  if (monthlyFee !== undefined) member.monthlyFee = Number(monthlyFee);
  if (startDate) member.startDate = startDate;
  if (expiryDate) member.expiryDate = expiryDate;
  if (status) member.status = status;
  if (assignedTrainerId !== undefined) member.assignedTrainerId = assignedTrainerId;
  if (assignedTrainerName !== undefined) member.assignedTrainerName = assignedTrainerName;
  if (fitnessGoal) member.fitnessGoal = fitnessGoal;
  if (memberCategory) member.memberCategory = memberCategory;
  if (activeServices) member.activeServices = activeServices;
  if (serviceDetails) member.serviceDetails = serviceDetails;

  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'UPDATE_MEMBER_DETAILS',
    targetType: 'user',
    targetId: member.id,
    details: `Updated membership profile for "${member.userName}" (Status: ${member.status})`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ member });
});

// Member Status Toggle: Suspend / Activate / Expire
gymsRouter.post('/:id/members/:memberId/status', requireAuth, requireGymPermission('manage_memberships'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const memberId = req.params.memberId as string;
  const { status } = req.body; // 'active' | 'suspended' | 'inactive' | 'expired'

  const member = (dbStore.getData().gymMembers || []).find(m => m.id === memberId && m.gymId === gymId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const oldStatus = member.status;
  member.status = status;
  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'CHANGE_MEMBER_STATUS',
    targetType: 'user',
    targetId: member.id,
    details: `Changed member "${member.userName}" status from ${oldStatus} to ${status}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ member });
});

// Member Application: Approve / Reject
gymsRouter.post('/:id/members/:memberId/action', requireAuth, requireGymPermission('manage_gym_members'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { action, assignedTrainerId } = req.body; // 'approve' | 'reject'
  const gym = dbStore.getData().gyms.find(g => g.id === req.params.id);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  const member = dbStore.getData().gymMembers.find(m => m.id === req.params.memberId && m.gymId === gym.id);
  if (!member) return res.status(404).json({ error: 'Member application not found' });

  if (action === 'approve') {
    member.status = 'active';
    member.approvedAt = new Date().toISOString();
    member.startDate = new Date().toISOString().split('T')[0];
    member.expiryDate = new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0];
    gym.memberCount += 1;

    // Assign trainer if provided
    if (assignedTrainerId) {
      const trainer = dbStore.getData().gymTrainers.find(t => t.id === assignedTrainerId);
      if (trainer) {
        member.assignedTrainerId = trainer.id;
        member.assignedTrainerName = trainer.name;
        trainer.assignedClientsCount += 1;
      }
    }

    // Update user profile to gym_member role
    const profile = dbStore.getUserProfile(member.userId);
    if (profile) {
      if (profile.role === 'individual') profile.role = 'gym_member';
      profile.gymStatus = 'approved';
      dbStore.setUserProfile(member.userId, profile);
    }

    // Send notification
    dbStore.getData().notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: member.userId,
      title: 'Gym Membership Approved!',
      message: `Congratulations! Your membership at ${gym.name} is now approved.`,
      type: 'gym',
      read: false,
      createdAt: new Date().toISOString()
    });
  } else {
    member.status = 'rejected';
    const profile = dbStore.getUserProfile(member.userId);
    if (profile) {
      profile.gymStatus = 'rejected';
      dbStore.setUserProfile(member.userId, profile);
    }
  }

  dbStore.save();
  res.json({ member });
});

// ==========================================
// 2. MONTHLY BILLING MANAGEMENT
// ==========================================

// Get Invoices
gymsRouter.get('/:id/invoices', requireAuth, requireGymPermission('manage_monthly_bills'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { status, month, search } = req.query;

  let invoices = (dbStore.getData().gymInvoices || []).filter(inv => inv.gymId === gymId);

  if (status && status !== 'all') {
    invoices = invoices.filter(inv => inv.status === status);
  }

  if (month && month !== 'all') {
    invoices = invoices.filter(inv => inv.billingMonth.toLowerCase().includes((month as string).toLowerCase()));
  }

  if (search) {
    const s = (search as string).toLowerCase();
    invoices = invoices.filter(inv => 
      inv.memberName.toLowerCase().includes(s) || 
      inv.memberEmail.toLowerCase().includes(s) ||
      (inv.receiptNumber && inv.receiptNumber.toLowerCase().includes(s))
    );
  }

  res.json({ invoices });
});

// Batch Generate Monthly Bills for Members
gymsRouter.post('/:id/invoices/generate-monthly', requireAuth, requireGymPermission('manage_monthly_bills'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { billingMonth, dueDate } = req.body; // e.g. "December 2026", "2026-12-05"

  if (!billingMonth) {
    return res.status(400).json({ error: 'Billing month is required (e.g. December 2026)' });
  }

  const gym = dbStore.getData().gyms.find(g => g.id === gymId);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  const members = (dbStore.getData().gymMembers || []).filter(m => m.gymId === gymId && (m.status === 'active' || m.status === 'expired'));
  const currentInvoices = dbStore.getData().gymInvoices || [];

  const createdInvoices: GymInvoice[] = [];

  for (const m of members) {
    // Avoid duplicate invoice for same month
    const existing = currentInvoices.find(inv => 
      inv.gymId === gymId && 
      (inv.memberId === m.id || inv.memberEmail === m.userEmail) && 
      inv.billingMonth.toLowerCase() === billingMonth.toLowerCase()
    );

    if (!existing) {
      const invAmount = m.monthlyFee || 2000;
      const newInv: GymInvoice = {
        id: `inv-${gymId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        gymId,
        memberId: m.id,
        memberName: m.userName,
        memberEmail: m.userEmail,
        amount: invAmount,
        paidAmount: 0,
        billingMonth,
        dueDate: dueDate || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        status: 'unpaid',
        generatedAt: new Date().toISOString()
      };

      currentInvoices.unshift(newInv);
      createdInvoices.push(newInv);
      m.outstandingBalance = (m.outstandingBalance || 0) + invAmount;
    }
  }

  dbStore.getData().gymInvoices = currentInvoices;
  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'GENERATE_MONTHLY_BILLS',
    targetType: 'subscription',
    targetId: gymId,
    details: `Generated ${createdInvoices.length} monthly invoices for ${billingMonth} at ${gym.name}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.status(201).json({
    message: `Generated ${createdInvoices.length} invoices for ${billingMonth}`,
    createdCount: createdInvoices.length,
    invoices: createdInvoices
  });
});

// Create Single Manual Invoice
gymsRouter.post('/:id/invoices', requireAuth, requireGymPermission('manage_monthly_bills'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { memberId, amount, billingMonth, dueDate, notes } = req.body;

  const member = (dbStore.getData().gymMembers || []).find(m => m.id === memberId && m.gymId === gymId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const newInvoice: GymInvoice = {
    id: `inv-${gymId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gymId,
    memberId: member.id,
    memberName: member.userName,
    memberEmail: member.userEmail,
    amount: Number(amount) || member.monthlyFee || 2000,
    paidAmount: 0,
    billingMonth: billingMonth || 'November 2026',
    dueDate: dueDate || new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    status: 'unpaid',
    generatedAt: new Date().toISOString(),
    notes
  };

  member.outstandingBalance = (member.outstandingBalance || 0) + newInvoice.amount;
  dbStore.getData().gymInvoices.unshift(newInvoice);
  dbStore.save();

  res.status(201).json({ invoice: newInvoice });
});

// Record Cash, UPI, or Online Payment against an Invoice
gymsRouter.post('/:id/invoices/:invoiceId/record-payment', requireAuth, requireGymPermission('record_payments'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const invoiceId = req.params.invoiceId as string;
  const { amount, paymentMethod, transactionRef, notes } = req.body;

  const invoice = (dbStore.getData().gymInvoices || []).find(inv => inv.id === invoiceId && inv.gymId === gymId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const payAmount = Number(amount) || (invoice.amount - invoice.paidAmount);
  if (payAmount <= 0) {
    return res.status(400).json({ error: 'Payment amount must be greater than zero' });
  }

  const receiptNumber = `REC-${gymId.toUpperCase().substring(0, 6)}-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  invoice.paidAmount += payAmount;
  if (invoice.paidAmount >= invoice.amount) {
    invoice.status = 'paid';
  } else {
    invoice.status = 'partially_paid';
  }
  invoice.paidAt = new Date().toISOString();
  invoice.paymentMethod = paymentMethod || 'cash';
  invoice.receiptNumber = receiptNumber;

  // Reduce member outstanding balance
  const member = (dbStore.getData().gymMembers || []).find(m => m.id === invoice.memberId || m.userEmail === invoice.memberEmail);
  if (member) {
    member.outstandingBalance = Math.max(0, (member.outstandingBalance || 0) - payAmount);
    // If expired, renew membership by 30 days
    if (member.status === 'expired' && invoice.status === 'paid') {
      member.status = 'active';
      member.expiryDate = new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0];
    }
  }

  // Create payment record
  const newPayment: GymPaymentRecord = {
    id: `pay-rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gymId,
    memberId: invoice.memberId,
    memberName: invoice.memberName,
    invoiceId: invoice.id,
    amount: payAmount,
    paymentMethod: paymentMethod || 'cash',
    transactionRef: transactionRef || (paymentMethod === 'cash' ? 'CASH-RECEIPT' : `TXN-${Date.now()}`),
    notes: notes || `Payment for ${invoice.billingMonth}`,
    recordedBy: dbStore.getUserProfile(req.user!.id)?.fullName || req.user!.email,
    recordedAt: new Date().toISOString(),
    receiptNumber
  };

  dbStore.getData().gymPayments.unshift(newPayment);
  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'RECORD_MEMBER_PAYMENT',
    targetType: 'subscription',
    targetId: newPayment.id,
    details: `Recorded ${paymentMethod?.toUpperCase()} payment of ₹${payAmount} for ${invoice.memberName} (Receipt: ${receiptNumber})`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.status(201).json({
    success: true,
    invoice,
    payment: newPayment,
    receipt: {
      receiptNumber,
      memberName: invoice.memberName,
      amount: payAmount,
      date: newPayment.recordedAt,
      method: paymentMethod,
      transactionRef: newPayment.transactionRef,
      recordedBy: newPayment.recordedBy
    }
  });
});

// Payment Reminder Trigger
gymsRouter.post('/:id/invoices/:invoiceId/remind', requireAuth, requireGymPermission('manage_monthly_bills'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const invoiceId = req.params.invoiceId as string;

  const invoice = (dbStore.getData().gymInvoices || []).find(inv => inv.id === invoiceId && inv.gymId === gymId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const member = (dbStore.getData().gymMembers || []).find(m => m.id === invoice.memberId || m.userEmail === invoice.memberEmail);
  const gym = dbStore.getData().gyms.find(g => g.id === gymId);

  if (member) {
    dbStore.getData().notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: member.userId,
      title: 'Payment Reminder: ' + invoice.billingMonth,
      message: `Your membership fee of ₹${invoice.amount - invoice.paidAmount} for ${gym?.name || 'your gym'} is due. Please settle via Cash, UPI, or Online Portal.`,
      type: 'payment',
      read: false,
      createdAt: new Date().toISOString()
    });
    dbStore.save();
  }

  res.json({ success: true, message: `Payment reminder delivered to ${invoice.memberName}` });
});

// Get Payment History Records
gymsRouter.get('/:id/payments', requireAuth, requireGymPermission('record_payments'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { method, search } = req.query;

  let payments = (dbStore.getData().gymPayments || []).filter(p => p.gymId === gymId);

  if (method && method !== 'all') {
    payments = payments.filter(p => p.paymentMethod === method);
  }

  if (search) {
    const s = (search as string).toLowerCase();
    payments = payments.filter(p => 
      p.memberName.toLowerCase().includes(s) || 
      p.receiptNumber.toLowerCase().includes(s) ||
      (p.transactionRef && p.transactionRef.toLowerCase().includes(s))
    );
  }

  res.json({ payments });
});

// ==========================================
// 3. FINANCIAL ANALYTICS & EXPENSES
// ==========================================

gymsRouter.get('/:id/financials', requireAuth, requireGymPermission('view_financial_reports'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;

  const invoices = (dbStore.getData().gymInvoices || []).filter(inv => inv.gymId === gymId);
  const payments = (dbStore.getData().gymPayments || []).filter(p => p.gymId === gymId);
  const expenses = (dbStore.getData().gymExpenses || []).filter(e => e.gymId === gymId);
  const members = (dbStore.getData().gymMembers || []).filter(m => m.gymId === gymId);

  // Total Billed Revenue
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Total Collections
  const totalCollections = payments.reduce((sum, p) => sum + p.amount, 0);

  // SEPARATE REGULAR MEMBERSHIP REVENUE FROM PERSONAL TRAINING REVENUE
  const membershipInvoices = invoices.filter(inv => inv.invoiceType !== 'personal_training');
  const ptInvoices = invoices.filter(inv => inv.invoiceType === 'personal_training');
  
  const membershipBilled = membershipInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const ptBilled = ptInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const ptInvoiceIds = new Set(ptInvoices.map(i => i.id));
  const ptCollections = payments.filter(p => p.invoiceId && ptInvoiceIds.has(p.invoiceId)).reduce((sum, p) => sum + p.amount, 0);
  const membershipCollections = totalCollections - ptCollections;

  // Outstanding Payments
  const outstandingPayments = invoices
    .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'partially_paid')
    .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  const membershipOutstanding = membershipInvoices
    .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'partially_paid')
    .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  const ptOutstanding = ptInvoices
    .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'partially_paid')
    .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  // Total Monthly Expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Net Cash Flow
  const netCashFlow = totalCollections - totalExpenses;

  // Memberships Metrics
  const activeMembers = members.filter(m => m.status === 'active').length;
  const expiredMembers = members.filter(m => m.status === 'expired').length;
  const suspendedMembers = members.filter(m => m.status === 'suspended').length;
  const newMembershipsThisMonth = members.filter(m => {
    const d = new Date(m.appliedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const expiringSoonCount = members.filter(m => {
    if (!m.expiryDate) return false;
    const exp = new Date(m.expiryDate).getTime();
    const now = Date.now();
    const daysLeft = (exp - now) / (1000 * 3600 * 24);
    return daysLeft >= 0 && daysLeft <= 14;
  }).length;

  // Monthly Revenue Trends
  const revenueTrends = [
    { month: 'Jul 2026', billed: 45000, collected: 42000, membership: 32000, pt: 10000, expenses: 32000 },
    { month: 'Aug 2026', billed: 58000, collected: 55000, membership: 39000, pt: 16000, expenses: 38000 },
    { month: 'Sep 2026', billed: 72000, collected: 68000, membership: 47000, pt: 21000, expenses: 42000 },
    { month: 'Oct 2026', billed: 85000, collected: 81000, membership: 55000, pt: 26000, expenses: 46000 },
    { month: 'Nov 2026', billed: totalBilled || 92000, collected: totalCollections || 88000, membership: membershipCollections || 60000, pt: ptCollections || 28000, expenses: totalExpenses || 48000 }
  ];

  res.json({
    metrics: {
      totalBilled,
      totalCollections,
      outstandingPayments,
      totalExpenses,
      netCashFlow,
      // Segregated Revenue Streams
      membershipBilled,
      membershipCollections,
      membershipOutstanding,
      ptBilled,
      ptCollections,
      ptOutstanding,
      // Operational counts
      activeMembers,
      expiredMembers,
      suspendedMembers,
      newMembershipsThisMonth: newMembershipsThisMonth || 3,
      renewalsCount: 5,
      expiringSoonCount
    },
    revenueTrends,
    recentExpenses: expenses.slice(0, 10),
    recentPayments: payments.slice(0, 10)
  });
});

// Manage Expenses
gymsRouter.get('/:id/expenses', requireAuth, requireGymPermission('view_financial_reports'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const expenses = (dbStore.getData().gymExpenses || []).filter(e => e.gymId === gymId);
  res.json({ expenses });
});

gymsRouter.post('/:id/expenses', requireAuth, requireGymPermission('view_financial_reports'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { category, title, amount, date } = req.body;

  if (!title || !amount) {
    return res.status(400).json({ error: 'Expense title and amount are required' });
  }

  const newExpense: GymExpenseRecord = {
    id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gymId,
    category: category || 'other',
    title,
    amount: Number(amount),
    date: date || new Date().toISOString().split('T')[0],
    recordedBy: dbStore.getUserProfile(req.user!.id)?.fullName || req.user!.email
  };

  dbStore.getData().gymExpenses.unshift(newExpense);
  dbStore.save();

  res.status(201).json({ expense: newExpense });
});

// ==========================================
// 4. GYM OPERATIONS: PLANS, ATTENDANCE, PROFILE
// ==========================================

// Get Membership Plans
gymsRouter.get('/:id/plans', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const plans = (dbStore.getData().gymPlans || []).filter(p => p.gymId === gymId);
  res.json({ plans });
});

// Create Membership Plan
gymsRouter.post('/:id/plans', requireAuth, requireGymPermission('manage_memberships'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { name, monthlyFee, billingCycle, durationMonths, features } = req.body;

  if (!name || !monthlyFee) {
    return res.status(400).json({ error: 'Plan name and monthly fee are required' });
  }

  const newPlan: GymCustomPlan = {
    id: `plan-${gymId}-${Date.now()}`,
    gymId,
    name,
    monthlyFee: Number(monthlyFee),
    billingCycle: billingCycle || 'monthly',
    durationMonths: Number(durationMonths) || 1,
    features: Array.isArray(features) ? features : ['Full Gym Access'],
    isActive: true
  };

  dbStore.getData().gymPlans.push(newPlan);
  dbStore.save();

  res.status(201).json({ plan: newPlan });
});

// Attendance Records
gymsRouter.get('/:id/attendance', requireAuth, requireGymPermission('manage_attendance'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { date } = req.query;

  let attendance = (dbStore.getData().gymAttendance || []).filter(a => a.gymId === gymId);

  if (date) {
    attendance = attendance.filter(a => a.date === date);
  }

  res.json({ attendance });
});

// Member Check-in
gymsRouter.post('/:id/attendance/check-in', requireAuth, requireGymPermission('manage_attendance'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { memberId } = req.body;

  const member = (dbStore.getData().gymMembers || []).find(m => m.id === memberId && m.gymId === gymId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  if (member.status === 'suspended') {
    return res.status(403).json({ error: 'Check-in blocked: Member is currently suspended.' });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const newRecord: GymAttendanceRecord = {
    id: `att-${Date.now()}`,
    gymId,
    memberId: member.id,
    memberName: member.userName,
    checkInTime: new Date().toISOString(),
    date: todayStr
  };

  member.lastActive = newRecord.checkInTime;
  member.workoutsCompleted = (member.workoutsCompleted || 0) + 1;

  dbStore.getData().gymAttendance.unshift(newRecord);
  dbStore.save();

  res.status(201).json({ attendance: newRecord });
});

// Member Check-out
gymsRouter.post('/:id/attendance/check-out', requireAuth, requireGymPermission('manage_attendance'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { attendanceId } = req.body;

  const record = (dbStore.getData().gymAttendance || []).find(a => a.id === attendanceId && a.gymId === gymId);
  if (!record) return res.status(404).json({ error: 'Attendance check-in record not found' });

  record.checkOutTime = new Date().toISOString();
  dbStore.save();

  res.json({ attendance: record });
});

// Update Gym Profile
gymsRouter.put('/:id/profile', requireAuth, requireGymPermission('edit_gym_info'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const gym = dbStore.getData().gyms.find(g => g.id === gymId);
  if (!gym) return res.status(404).json({ error: 'Gym facility not found' });

  const { name, address, city, phone, capacity, facilities } = req.body;
  if (name) gym.name = name;
  if (address) gym.address = address;
  if (city) gym.city = city;
  if (phone) gym.phone = phone;
  if (capacity) gym.capacity = Number(capacity);
  if (facilities && Array.isArray(facilities)) gym.facilities = facilities;

  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'UPDATE_GYM_PROFILE',
    targetType: 'gym',
    targetId: gym.id,
    details: `Updated facility profile for "${gym.name}"`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ gym });
});


// Add Trainer
gymsRouter.post('/:id/trainers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const gym = dbStore.getData().gyms.find(g => g.id === req.params.id);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  if (req.user.role !== 'super_admin' && gym.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { name, email, specialty, experienceYears, bio } = req.body;
  if (!name || !specialty) return res.status(400).json({ error: 'Trainer name and specialty required' });

  const newTrainer: GymTrainer = {
    id: `trainer-${Date.now()}`,
    gymId: gym.id,
    name,
    email: email || '',
    specialty,
    experienceYears: Number(experienceYears) || 3,
    bio: bio || 'Professional fitness trainer.',
    assignedClientsCount: 0
  };

  dbStore.getData().gymTrainers.push(newTrainer);
  dbStore.save();
  res.status(201).json({ trainer: newTrainer });
});

// Post Announcement
gymsRouter.post('/:id/announcements', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const gym = dbStore.getData().gyms.find(g => g.id === req.params.id);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  if (req.user.role !== 'super_admin' && gym.ownerId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { title, content, priority = 'normal' } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

  const authorProfile = dbStore.getUserProfile(req.user.id);
  const newAnnouncement: GymAnnouncement = {
    id: `ann-${Date.now()}`,
    gymId: gym.id,
    title,
    content,
    priority: priority as 'normal' | 'high' | 'urgent',
    author: authorProfile?.fullName || 'Gym Administration',
    createdAt: new Date().toISOString()
  };

  dbStore.getData().gymAnnouncements.unshift(newAnnouncement);
  gym.announcementsCount += 1;
  dbStore.save();

  res.status(201).json({ announcement: newAnnouncement });
});

// Get Gym Messages (Community & Trainer Q&A)
gymsRouter.get('/:id/messages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const channel = req.query.channel as string;

  const allMessages = dbStore.getData().gymMessages || [];
  let filtered = allMessages.filter(m => m.gymId === gymId);

  if (channel && (channel === 'community' || channel === 'trainer_qa')) {
    filtered = filtered.filter(m => m.channel === channel);
  }

  res.json({ messages: filtered });
});

// Post a Message (Community or Trainer Q&A)
gymsRouter.post('/:id/messages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const gymId = req.params.id as string;
  const gym = dbStore.getData().gyms.find(g => g.id === gymId);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  const { content, channel = 'community', targetTrainerId, targetTrainerName } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  const profile = dbStore.getUserProfile(req.user.id);

  const newMessage: GymMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gymId,
    senderId: req.user.id,
    senderName: profile?.fullName || 'Fitness Member',
    senderRole: req.user.role,
    channel: channel === 'trainer_qa' ? 'trainer_qa' : 'community',
    targetTrainerId,
    targetTrainerName,
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  if (!dbStore.getData().gymMessages) {
    dbStore.getData().gymMessages = [];
  }

  dbStore.getData().gymMessages.push(newMessage);
  dbStore.save();

  res.status(201).json({ message: newMessage });
});

// ==========================================
// 5. PERSONAL TRAINING (PT) MANAGEMENT MODULE
// ==========================================

// Get PT Packages
gymsRouter.get('/:id/pt/packages', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const packages = (dbStore.getData().ptPackages || []).filter(p => p.gymId === gymId);
  res.json({ packages });
});

// Create PT Package
gymsRouter.post('/:id/pt/packages', requireAuth, requireGymPermission('manage_personal_training'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { name, type, totalSessions, priceInr, validityDays, description, trainerSpecialtyRequired } = req.body;

  if (!name || !priceInr || !totalSessions) {
    return res.status(400).json({ error: 'Package name, price, and total sessions are required' });
  }

  const newPackage: PersonalTrainingPackage = {
    id: `pt-pkg-${gymId}-${Date.now()}`,
    gymId,
    name,
    type: type === 'group' ? 'group' : 'one_on_one',
    totalSessions: Number(totalSessions),
    priceInr: Number(priceInr),
    validityDays: Number(validityDays) || 30,
    description: description || '',
    trainerSpecialtyRequired,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  if (!dbStore.getData().ptPackages) dbStore.getData().ptPackages = [];
  dbStore.getData().ptPackages.push(newPackage);
  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'CREATE_PT_PACKAGE',
    targetType: 'gym',
    targetId: newPackage.id,
    details: `Created PT Package "${newPackage.name}" (${newPackage.type}) at ₹${newPackage.priceInr}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.status(201).json({ package: newPackage });
});

// Update / Toggle PT Package
gymsRouter.put('/:id/pt/packages/:pkgId', requireAuth, requireGymPermission('manage_personal_training'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const pkgId = req.params.pkgId as string;
  const pkg = (dbStore.getData().ptPackages || []).find(p => p.id === pkgId && p.gymId === gymId);

  if (!pkg) return res.status(404).json({ error: 'PT Package not found' });

  const { name, type, totalSessions, priceInr, validityDays, description, isActive } = req.body;
  if (name) pkg.name = name;
  if (type) pkg.type = type;
  if (totalSessions !== undefined) pkg.totalSessions = Number(totalSessions);
  if (priceInr !== undefined) pkg.priceInr = Number(priceInr);
  if (validityDays !== undefined) pkg.validityDays = Number(validityDays);
  if (description !== undefined) pkg.description = description;
  if (isActive !== undefined) pkg.isActive = !!isActive;

  dbStore.save();
  res.json({ package: pkg });
});

// Get PT Sessions
gymsRouter.get('/:id/pt/sessions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { trainerId, memberId, status } = req.query;

  let sessions = (dbStore.getData().ptSessions || []).filter(s => s.gymId === gymId);

  if (trainerId && trainerId !== 'all') {
    sessions = sessions.filter(s => s.trainerId === trainerId);
  }
  if (memberId) {
    sessions = sessions.filter(s => s.memberId === memberId);
  }
  if (status && status !== 'all') {
    sessions = sessions.filter(s => s.status === status);
  }

  res.json({ sessions });
});

// Schedule PT Session
gymsRouter.post('/:id/pt/sessions', requireAuth, requireGymPermission('manage_personal_training'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { trainerId, memberId, packageId, scheduledAt, durationMinutes = 60, notes } = req.body;

  if (!trainerId || !memberId || !scheduledAt) {
    return res.status(400).json({ error: 'Trainer, member, and scheduled date/time are required' });
  }

  const trainer = (dbStore.getData().gymTrainers || []).find(t => t.id === trainerId);
  const member = (dbStore.getData().gymMembers || []).find(m => m.id === memberId && m.gymId === gymId);
  const pkg = (dbStore.getData().ptPackages || []).find(p => p.id === packageId);

  const newSession: PersonalTrainingSession = {
    id: `pt-sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gymId,
    trainerId,
    trainerName: trainer?.name || 'Trainer',
    memberId,
    memberName: member?.userName || 'Member',
    packageId: packageId || '',
    packageName: pkg?.name || 'Personal Training',
    scheduledAt,
    durationMinutes: Number(durationMinutes),
    status: 'scheduled',
    sessionNotes: notes || ''
  };

  if (!dbStore.getData().ptSessions) dbStore.getData().ptSessions = [];
  dbStore.getData().ptSessions.unshift(newSession);
  dbStore.save();

  res.status(201).json({ session: newSession });
});

// Complete PT Session (decrements remaining sessions on member's package)
gymsRouter.post('/:id/pt/sessions/:sessId/complete', requireAuth, requireGymPermission('manage_personal_training'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const sessId = req.params.sessId as string;
  const { sessionNotes } = req.body;

  const session = (dbStore.getData().ptSessions || []).find(s => s.id === sessId && s.gymId === gymId);
  if (!session) return res.status(404).json({ error: 'PT Session not found' });

  session.status = 'completed';
  session.completedAt = new Date().toISOString();
  session.loggedBy = req.user?.email || 'Coach';
  if (sessionNotes) session.sessionNotes = sessionNotes;

  // Deduct remaining sessions from member's PT details if present
  const member = (dbStore.getData().gymMembers || []).find(m => m.id === session.memberId && m.gymId === gymId);
  if (member && member.serviceDetails?.personalTraining) {
    if (member.serviceDetails.personalTraining.remainingSessions > 0) {
      member.serviceDetails.personalTraining.remainingSessions -= 1;
    }
  }

  // Update trainer completed sessions count
  const trainerAvail = (dbStore.getData().trainerAvailabilities || []).find(a => a.trainerId === session.trainerId);
  if (trainerAvail) {
    trainerAvail.completedSessions += 1;
  }

  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'COMPLETE_PT_SESSION',
    targetType: 'user',
    targetId: session.id,
    details: `Completed PT session for ${session.memberName} with ${session.trainerName}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ session, member });
});

// Cancel PT Session
gymsRouter.post('/:id/pt/sessions/:sessId/cancel', requireAuth, requireGymPermission('manage_personal_training'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const sessId = req.params.sessId as string;

  const session = (dbStore.getData().ptSessions || []).find(s => s.id === sessId && s.gymId === gymId);
  if (!session) return res.status(404).json({ error: 'PT Session not found' });

  session.status = 'cancelled';
  dbStore.save();

  res.json({ session });
});

// Get Trainers with Availability & Performance
gymsRouter.get('/:id/pt/trainers', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const trainers = (dbStore.getData().gymTrainers || []).filter(t => t.gymId === gymId);
  const availabilities = dbStore.getData().trainerAvailabilities || [];
  const sessions = dbStore.getData().ptSessions || [];

  const enriched = trainers.map(t => {
    const avail = availabilities.find(a => a.trainerId === t.id);
    const trainerSessions = sessions.filter(s => s.trainerId === t.id);
    const completed = trainerSessions.filter(s => s.status === 'completed').length;
    const scheduled = trainerSessions.filter(s => s.status === 'scheduled').length;

    return {
      ...t,
      workingDays: avail?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: avail?.timeSlots || ['07:00 - 08:00', '17:00 - 18:00'],
      maxClients: avail?.maxClients || 15,
      activeClients: avail?.activeClients || t.assignedClientsCount || 10,
      rating: avail?.rating || 4.9,
      completedSessionsCount: (avail?.completedSessions || 0) + completed,
      upcomingSessionsCount: scheduled
    };
  });

  res.json({ trainers: enriched });
});

// Update Trainer Availability
gymsRouter.post('/:id/pt/trainers/:trainerId/availability', requireAuth, requireGymPermission('manage_gym_staff'), (req: AuthenticatedRequest, res: Response) => {
  const trainerId = req.params.trainerId as string;
  const { workingDays, timeSlots, maxClients } = req.body;

  let availabilities = dbStore.getData().trainerAvailabilities;
  if (!availabilities) {
    dbStore.getData().trainerAvailabilities = [];
    availabilities = dbStore.getData().trainerAvailabilities;
  }

  let record = availabilities.find(a => a.trainerId === trainerId);
  if (!record) {
    record = {
      trainerId,
      workingDays: workingDays || ['Monday', 'Wednesday', 'Friday'],
      timeSlots: timeSlots || ['08:00 - 09:00', '18:00 - 19:00'],
      maxClients: Number(maxClients) || 15,
      activeClients: 0,
      rating: 5.0,
      completedSessions: 0
    };
    availabilities.push(record);
  } else {
    if (workingDays) record.workingDays = workingDays;
    if (timeSlots) record.timeSlots = timeSlots;
    if (maxClients !== undefined) record.maxClients = Number(maxClients);
  }

  dbStore.save();
  res.json({ availability: record });
});

// Assign Client to Trainer for PT
gymsRouter.post('/:id/pt/assign-trainer', requireAuth, requireGymPermission('manage_personal_training'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { memberId, trainerId, packageId } = req.body;

  const member = (dbStore.getData().gymMembers || []).find(m => m.id === memberId && m.gymId === gymId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const trainer = (dbStore.getData().gymTrainers || []).find(t => t.id === trainerId && t.gymId === gymId);
  if (!trainer) return res.status(404).json({ error: 'Trainer not found' });

  const pkg = (dbStore.getData().ptPackages || []).find(p => p.id === packageId);

  // Update member active services & details
  if (!member.activeServices) member.activeServices = ['general_membership'];
  if (!member.activeServices.includes('personal_training')) {
    member.activeServices.push('personal_training');
  }

  if (!member.serviceDetails) member.serviceDetails = {};
  member.serviceDetails.personalTraining = {
    packageId: pkg?.id || 'custom-pt',
    packageName: pkg?.name || '1-on-1 Personal Training',
    trainerId: trainer.id,
    trainerName: trainer.name,
    totalSessions: pkg?.totalSessions || 10,
    remainingSessions: pkg?.totalSessions || 10
  };

  member.assignedTrainerId = trainer.id;
  member.assignedTrainerName = trainer.name;
  trainer.assignedClientsCount = (trainer.assignedClientsCount || 0) + 1;

  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'ASSIGN_PT_CLIENT',
    targetType: 'user',
    targetId: member.id,
    details: `Assigned member "${member.userName}" to coach "${trainer.name}" for ${pkg?.name || 'Personal Training'}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ member, trainer });
});

// Generate PT Package Invoice
gymsRouter.post('/:id/pt/invoices/generate', requireAuth, requireGymPermission('manage_monthly_bills'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { memberId, packageId, dueDate } = req.body;

  const member = (dbStore.getData().gymMembers || []).find(m => m.id === memberId && m.gymId === gymId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const pkg = (dbStore.getData().ptPackages || []).find(p => p.id === packageId && p.gymId === gymId);
  if (!pkg) return res.status(404).json({ error: 'PT Package not found' });

  const newInvoice: GymInvoice = {
    id: `inv-pt-${gymId}-${Date.now()}`,
    gymId,
    memberId: member.id,
    memberName: member.userName,
    memberEmail: member.userEmail,
    amount: pkg.priceInr,
    paidAmount: 0,
    billingMonth: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    dueDate: dueDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    status: 'unpaid',
    invoiceType: 'personal_training',
    packageId: pkg.id,
    packageName: pkg.name,
    generatedAt: new Date().toISOString()
  };

  if (!dbStore.getData().gymInvoices) dbStore.getData().gymInvoices = [];
  dbStore.getData().gymInvoices.unshift(newInvoice);

  member.outstandingBalance = (member.outstandingBalance || 0) + newInvoice.amount;
  dbStore.save();

  res.status(201).json({ invoice: newInvoice });
});

// Dedicated PT Revenue & Performance Reports
gymsRouter.get('/:id/pt/reports', requireAuth, requireGymPermission('view_financial_reports'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const invoices = (dbStore.getData().gymInvoices || []).filter(i => i.gymId === gymId && i.invoiceType === 'personal_training');
  const payments = (dbStore.getData().gymPayments || []).filter(p => p.gymId === gymId);
  const sessions = (dbStore.getData().ptSessions || []).filter(s => s.gymId === gymId);
  const trainers = (dbStore.getData().gymTrainers || []).filter(t => t.gymId === gymId);

  const ptBilled = invoices.reduce((sum, i) => sum + i.amount, 0) || 30500;
  const ptInvoiceIds = new Set(invoices.map(i => i.id));
  const ptCollected = payments.filter(p => p.invoiceId && ptInvoiceIds.has(p.invoiceId)).reduce((sum, p) => sum + p.amount, 0) || 24000;
  const ptOutstanding = ptBilled - ptCollected;

  const completedSessionsCount = sessions.filter(s => s.status === 'completed').length || 18;
  const scheduledSessionsCount = sessions.filter(s => s.status === 'scheduled').length || 6;

  res.json({
    revenue: {
      ptBilled,
      ptCollected,
      ptOutstanding
    },
    sessions: {
      completedSessionsCount,
      scheduledSessionsCount,
      totalSessionsTracked: completedSessionsCount + scheduledSessionsCount
    },
    trainerBreakdown: trainers.map(t => ({
      trainerId: t.id,
      trainerName: t.name,
      activeClients: t.assignedClientsCount || 0,
      sessionsCompleted: sessions.filter(s => s.trainerId === t.id && s.status === 'completed').length
    }))
  });
});

// ==========================================
// 6. GYM CLAIM FUNCTIONALITY (WITH ANTI-COLLISION)
// ==========================================

gymsRouter.post('/:id/claim', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const gymId = req.params.id as string;
  const gym = dbStore.getData().gyms.find(g => g.id === gymId);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  // Anti-Collision Guard: Check if already verified or has active pending claim
  if (gym.claimStatus === 'verified' && gym.ownerId) {
    return res.status(400).json({ 
      error: `Collision Blocked: "${gym.name}" is already verified and claimed by an authorized owner. Contact Super Admin to dispute ownership.` 
    });
  }

  const existingPendingClaim = (dbStore.getData().gymClaims || []).find(c => 
    c.gymId === gymId && (c.status === 'pending_review' || c.status === 'under_review')
  );
  if (existingPendingClaim) {
    return res.status(409).json({ 
      error: `Collision Blocked: An active ownership claim for "${gym.name}" is currently under review by Super Admin.` 
    });
  }

  const { businessRegistrationNumber, phone, proofDocumentUrl, physicalAddressProof, notes } = req.body;
  if (!businessRegistrationNumber || !phone) {
    return res.status(400).json({ error: 'Official Business Registration Number and contact phone are required to claim a gym.' });
  }

  const profile = dbStore.getUserProfile(req.user.id);

  const newClaim: GymClaimRequest = {
    id: `claim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gymId: gym.id,
    gymName: gym.name,
    claimantUserId: req.user.id,
    claimantName: profile?.fullName || req.user.email,
    claimantEmail: req.user.email,
    claimantPhone: phone,
    businessRegistrationNumber,
    proofDocumentUrl,
    physicalAddressProof,
    status: 'pending_review',
    reviewNotes: notes,
    submittedAt: new Date().toISOString()
  };

  if (!dbStore.getData().gymClaims) dbStore.getData().gymClaims = [];
  dbStore.getData().gymClaims.unshift(newClaim);

  gym.claimStatus = 'pending_review';
  gym.verificationStatus = 'under_review';
  gym.claimantId = req.user.id;
  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    actorRole: req.user.role,
    action: 'SUBMIT_GYM_CLAIM',
    targetType: 'gym',
    targetId: gym.id,
    details: `Submitted ownership claim for ${gym.name} (BRN: ${businessRegistrationNumber})`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.status(201).json({ claim: newClaim });
});

// ==========================================
// 7. WHITE-LABEL BRANDING & GALLERY SYSTEM
// ==========================================

// Get Gym Branding
gymsRouter.get('/:id/branding', (req: Request, res: Response) => {
  const gymId = req.params.id as string;
  const gym = dbStore.getData().gyms.find(g => g.id === gymId);
  const brandings = dbStore.getData().gymBrandings || {};
  const branding = brandings[gymId] || {
    gymId,
    gymName: gym?.name || 'Athletic Facility',
    primaryColor: '#7651D5',
    secondaryColor: '#A58AF5',
    logoUrl: gym?.logoUrl || '',
    coverImageUrl: gym?.coverImageUrl || '',
    tagline: 'Professional Strength & Fitness Performance',
    customDomain: '',
    whiteLabelEnabled: false,
    brandingTier: 'standard'
  };

  res.json({ branding });
});

// Update Gym Branding
gymsRouter.put('/:id/branding', requireAuth, requireGymPermission('manage_branding'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const gym = dbStore.getData().gyms.find(g => g.id === gymId);
  if (!gym) return res.status(404).json({ error: 'Gym not found' });

  const { primaryColor, secondaryColor, logoUrl, coverImageUrl, tagline, customDomain, whiteLabelEnabled, brandingTier } = req.body;

  if (!dbStore.getData().gymBrandings) dbStore.getData().gymBrandings = {};

  const branding: GymBranding = {
    gymId,
    gymName: gym.name,
    primaryColor: primaryColor || '#7651D5',
    secondaryColor: secondaryColor || '#A58AF5',
    logoUrl: logoUrl !== undefined ? logoUrl : (gym.logoUrl || ''),
    coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : (gym.coverImageUrl || ''),
    tagline: tagline || 'High Performance Fitness',
    customDomain: customDomain || '',
    whiteLabelEnabled: !!whiteLabelEnabled,
    brandingTier: brandingTier || 'standard'
  };

  dbStore.getData().gymBrandings[gymId] = branding;
  if (logoUrl) gym.logoUrl = logoUrl;
  if (coverImageUrl) gym.coverImageUrl = coverImageUrl;
  dbStore.save();

  dbStore.addAuditLog({
    actorId: req.user!.id,
    actorEmail: req.user!.email,
    actorRole: req.user!.role,
    action: 'UPDATE_GYM_BRANDING',
    targetType: 'gym',
    targetId: gymId,
    details: `Updated white-label branding for ${gym.name} (Primary: ${branding.primaryColor})`,
    ipAddress: req.ip || '127.0.0.1'
  });

  res.json({ branding });
});

// Get Gym Gallery
gymsRouter.get('/:id/gallery', (req: Request, res: Response) => {
  const gymId = req.params.id as string;
  const galleries = dbStore.getData().gymGalleries || {};
  const gallery = (galleries[gymId] || []).sort((a, b) => a.displayOrder - b.displayOrder);
  res.json({ gallery });
});

// Add Image to Gallery
gymsRouter.post('/:id/gallery', requireAuth, requireGymPermission('edit_gym_info'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { imageUrl, caption } = req.body;

  if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

  if (!dbStore.getData().gymGalleries) dbStore.getData().gymGalleries = {};
  if (!dbStore.getData().gymGalleries[gymId]) dbStore.getData().gymGalleries[gymId] = [];

  const existing = dbStore.getData().gymGalleries[gymId];
  const newItem: GymGalleryItem = {
    id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    gymId,
    imageUrl,
    caption: caption || '',
    displayOrder: existing.length + 1,
    uploadedAt: new Date().toISOString()
  };

  existing.push(newItem);
  dbStore.save();

  res.status(201).json({ item: newItem, gallery: existing });
});

// Delete Image from Gallery
gymsRouter.delete('/:id/gallery/:imageId', requireAuth, requireGymPermission('edit_gym_info'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const imageId = req.params.imageId as string;

  const galleries = dbStore.getData().gymGalleries || {};
  if (!galleries[gymId]) return res.status(404).json({ error: 'Gallery not found' });

  galleries[gymId] = galleries[gymId].filter(i => i.id !== imageId);
  // Re-normalize display orders
  galleries[gymId].forEach((item, idx) => {
    item.displayOrder = idx + 1;
  });

  dbStore.save();
  res.json({ success: true, gallery: galleries[gymId] });
});

// Reorder Gallery Images
gymsRouter.put('/:id/gallery/reorder', requireAuth, requireGymPermission('edit_gym_info'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.id as string;
  const { orderedImageIds } = req.body; // array of image IDs in new order

  if (!Array.isArray(orderedImageIds)) {
    return res.status(400).json({ error: 'orderedImageIds array is required' });
  }

  const galleries = dbStore.getData().gymGalleries || {};
  if (!galleries[gymId]) return res.status(404).json({ error: 'Gallery not found' });

  const currentItems = galleries[gymId];
  orderedImageIds.forEach((id, index) => {
    const item = currentItems.find(i => i.id === id);
    if (item) {
      item.displayOrder = index + 1;
    }
  });

  currentItems.sort((a, b) => a.displayOrder - b.displayOrder);
  dbStore.save();

  res.json({ success: true, gallery: currentItems });
});

