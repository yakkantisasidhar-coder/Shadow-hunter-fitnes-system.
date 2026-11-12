import { 
  GymCustomPlan, 
  GymMemberRecord, 
  GymInvoice, 
  GymPaymentRecord, 
  GymAttendanceRecord, 
  GymExpenseRecord 
} from '../types.js';

export const SEED_GYM_PLANS: GymCustomPlan[] = [
  {
    id: 'plan-apex-1',
    gymId: 'gym-apex-1',
    name: 'Apex Gold All-Access',
    monthlyFee: 2500,
    billingCycle: 'monthly',
    durationMonths: 1,
    features: [
      'Unlimited Facility & Platform Access',
      'Sauna & Cold Plunge Recovery Suite',
      'Quarterly DEXA Body Composition Scan',
      'Monthly Certified Coach Consultation'
    ],
    isActive: true
  },
  {
    id: 'plan-apex-2',
    gymId: 'gym-apex-1',
    name: 'Strength & Conditioning Mastery',
    monthlyFee: 2000,
    billingCycle: 'monthly',
    durationMonths: 1,
    features: [
      'Olympic Weightlifting Platforms Access',
      'Turf Conditioning & Sled Track',
      'Locker Room & High-Pressure Showers'
    ],
    isActive: true
  },
  {
    id: 'plan-apex-3',
    gymId: 'gym-apex-1',
    name: 'Annual Apex High Performer',
    monthlyFee: 1800,
    billingCycle: 'annual',
    durationMonths: 12,
    features: [
      '24/7 Keycard Facility Access',
      'Free Guest Passes (2/month)',
      'All Recovery & Wet Facilities',
      'Complimentary Custom Sports Nutrition Guide'
    ],
    isActive: true
  }
];

export const SEED_GYM_MEMBERS: GymMemberRecord[] = [
  {
    id: 'gm-1',
    gymId: 'gym-apex-1',
    userId: 'user-member-1',
    userName: 'Sarah Jenkins',
    userEmail: 'member@apexfitness.com',
    phone: '+1 (555) 234-9011',
    status: 'active',
    planId: 'plan-apex-1',
    planName: 'Apex Gold All-Access',
    monthlyFee: 2500,
    startDate: '2026-09-01',
    expiryDate: '2026-12-01',
    fitnessGoal: 'Body Recomposition & Fat Loss',
    workoutsCompleted: 26,
    lastActive: '2026-11-10T18:30:00Z',
    outstandingBalance: 0,
    assignedTrainerId: 'trainer-1',
    assignedTrainerName: 'David Miller',
    appliedAt: '2026-08-25T10:00:00Z',
    approvedAt: '2026-08-26T09:00:00Z'
  },
  {
    id: 'gm-2',
    gymId: 'gym-apex-1',
    userId: 'user-michael-2',
    userName: 'Michael Chang',
    userEmail: 'm.chang@apexathlete.com',
    phone: '+1 (555) 890-1288',
    status: 'active',
    planId: 'plan-apex-2',
    planName: 'Strength & Conditioning Mastery',
    monthlyFee: 2000,
    startDate: '2026-10-01',
    expiryDate: '2026-12-01',
    fitnessGoal: 'Powerlifting Total Enhancement',
    workoutsCompleted: 20,
    lastActive: '2026-11-11T09:00:00Z',
    outstandingBalance: 0,
    assignedTrainerId: 'trainer-1',
    assignedTrainerName: 'David Miller',
    appliedAt: '2026-09-28T14:00:00Z',
    approvedAt: '2026-09-29T11:00:00Z'
  },
  {
    id: 'gm-3',
    gymId: 'gym-apex-1',
    userId: 'user-emma-3',
    userName: 'Emma Watson',
    userEmail: 'emma.w@apexathlete.com',
    phone: '+1 (555) 762-9901',
    status: 'expired',
    planId: 'plan-apex-1',
    planName: 'Apex Gold All-Access',
    monthlyFee: 2500,
    startDate: '2026-08-01',
    expiryDate: '2026-10-31',
    fitnessGoal: 'Functional Mobility & Posture',
    workoutsCompleted: 15,
    lastActive: '2026-10-28T16:00:00Z',
    outstandingBalance: 2500,
    assignedTrainerId: 'trainer-2',
    assignedTrainerName: 'Clara Hughes',
    appliedAt: '2026-07-28T09:30:00Z',
    approvedAt: '2026-07-29T10:15:00Z'
  },
  {
    id: 'gm-4',
    gymId: 'gym-apex-1',
    userId: 'user-david-4',
    userName: 'David Vance',
    userEmail: 'david.vance@techcorp.io',
    phone: '+1 (555) 441-2099',
    status: 'suspended',
    planId: 'plan-apex-2',
    planName: 'Strength & Conditioning Mastery',
    monthlyFee: 2000,
    startDate: '2026-07-01',
    expiryDate: '2026-11-01',
    fitnessGoal: 'Strength Improvement',
    workoutsCompleted: 9,
    lastActive: '2026-10-15T12:00:00Z',
    outstandingBalance: 4000,
    appliedAt: '2026-06-25T11:00:00Z',
    approvedAt: '2026-06-26T14:30:00Z'
  },
  {
    id: 'gm-5',
    gymId: 'gym-apex-1',
    userId: 'user-jessica-5',
    userName: 'Jessica Taylor',
    userEmail: 'jessica.t@apexathlete.com',
    phone: '+1 (555) 332-9012',
    status: 'inactive',
    planId: 'plan-apex-2',
    planName: 'Strength & Conditioning Mastery',
    monthlyFee: 2000,
    startDate: '2026-09-01',
    expiryDate: '2026-10-01',
    fitnessGoal: 'Lean Muscle Conditioning',
    workoutsCompleted: 6,
    lastActive: '2026-09-26T17:00:00Z',
    outstandingBalance: 0,
    appliedAt: '2026-08-28T08:00:00Z',
    approvedAt: '2026-08-29T09:00:00Z'
  },
  {
    id: 'gm-6',
    gymId: 'gym-apex-1',
    userId: 'user-liam-6',
    userName: 'Liam O’Connor',
    userEmail: 'liam.oc@athlete.net',
    phone: '+1 (555) 601-3829',
    status: 'pending',
    planId: 'plan-apex-1',
    planName: 'Apex Gold All-Access',
    monthlyFee: 2500,
    fitnessGoal: 'Hypertrophy & Athletic Endurance',
    workoutsCompleted: 0,
    outstandingBalance: 0,
    appliedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const SEED_GYM_INVOICES: GymInvoice[] = [
  {
    id: 'inv-apex-101',
    gymId: 'gym-apex-1',
    memberId: 'gm-1',
    memberName: 'Sarah Jenkins',
    memberEmail: 'member@apexfitness.com',
    amount: 2500,
    paidAmount: 2500,
    billingMonth: 'November 2026',
    dueDate: '2026-11-05',
    status: 'paid',
    generatedAt: '2026-11-01T00:00:00Z',
    paidAt: '2026-11-03T10:15:00Z',
    paymentMethod: 'upi',
    receiptNumber: 'REC-APX-202611-001',
    notes: 'Paid promptly via Google Pay UPI'
  },
  {
    id: 'inv-apex-102',
    gymId: 'gym-apex-1',
    memberId: 'gm-2',
    memberName: 'Michael Chang',
    memberEmail: 'm.chang@apexathlete.com',
    amount: 2000,
    paidAmount: 2000,
    billingMonth: 'November 2026',
    dueDate: '2026-11-05',
    status: 'paid',
    generatedAt: '2026-11-01T00:00:00Z',
    paidAt: '2026-11-04T16:30:00Z',
    paymentMethod: 'cash',
    receiptNumber: 'REC-APX-202611-002',
    notes: 'Paid cash at front reception desk'
  },
  {
    id: 'inv-apex-103',
    gymId: 'gym-apex-1',
    memberId: 'gm-3',
    memberName: 'Emma Watson',
    memberEmail: 'emma.w@apexathlete.com',
    amount: 2500,
    paidAmount: 0,
    billingMonth: 'November 2026',
    dueDate: '2026-11-05',
    status: 'overdue',
    generatedAt: '2026-11-01T00:00:00Z',
    notes: 'Automated reminder dispatched on 2026-11-06'
  },
  {
    id: 'inv-apex-104',
    gymId: 'gym-apex-1',
    memberId: 'gm-4',
    memberName: 'David Vance',
    memberEmail: 'david.vance@techcorp.io',
    amount: 2000,
    paidAmount: 0,
    billingMonth: 'November 2026',
    dueDate: '2026-11-05',
    status: 'overdue',
    generatedAt: '2026-11-01T00:00:00Z',
    notes: 'Membership access placed on hold due to non-payment'
  },
  {
    id: 'inv-apex-105',
    gymId: 'gym-apex-1',
    memberId: 'gm-1',
    memberName: 'Sarah Jenkins',
    memberEmail: 'member@apexfitness.com',
    amount: 2500,
    paidAmount: 2500,
    billingMonth: 'October 2026',
    dueDate: '2026-10-05',
    status: 'paid',
    generatedAt: '2026-10-01T00:00:00Z',
    paidAt: '2026-10-03T11:00:00Z',
    paymentMethod: 'online',
    receiptNumber: 'REC-APX-202610-088'
  }
];

export const SEED_GYM_PAYMENTS: GymPaymentRecord[] = [
  {
    id: 'pay-apex-201',
    gymId: 'gym-apex-1',
    memberId: 'gm-1',
    memberName: 'Sarah Jenkins',
    invoiceId: 'inv-apex-101',
    amount: 2500,
    paymentMethod: 'upi',
    transactionRef: 'UPI-774928190-ICICI',
    notes: 'Monthly Gold Membership Dues - November 2026',
    recordedBy: 'Marcus Sterling (Gym Director)',
    recordedAt: '2026-11-03T10:15:00Z',
    receiptNumber: 'REC-APX-202611-001'
  },
  {
    id: 'pay-apex-202',
    gymId: 'gym-apex-1',
    memberId: 'gm-2',
    memberName: 'Michael Chang',
    invoiceId: 'inv-apex-102',
    amount: 2000,
    paymentMethod: 'cash',
    transactionRef: 'CASH-RCP-9912',
    notes: 'Front Desk Cash Payment',
    recordedBy: 'Marcus Sterling (Gym Director)',
    recordedAt: '2026-11-04T16:30:00Z',
    receiptNumber: 'REC-APX-202611-002'
  },
  {
    id: 'pay-apex-203',
    gymId: 'gym-apex-1',
    memberId: 'gm-1',
    memberName: 'Sarah Jenkins',
    invoiceId: 'inv-apex-105',
    amount: 2500,
    paymentMethod: 'online',
    transactionRef: 'pay_online_live_881',
    notes: 'October Membership Dues via Razorpay Gateway',
    recordedBy: 'Automated Gateway Verification',
    recordedAt: '2026-10-03T11:00:00Z',
    receiptNumber: 'REC-APX-202610-088'
  }
];

export const SEED_GYM_ATTENDANCE: GymAttendanceRecord[] = [
  {
    id: 'att-1',
    gymId: 'gym-apex-1',
    memberId: 'gm-1',
    memberName: 'Sarah Jenkins',
    checkInTime: '2026-11-11T07:15:00Z',
    checkOutTime: '2026-11-11T08:35:00Z',
    date: '2026-11-11'
  },
  {
    id: 'att-2',
    gymId: 'gym-apex-1',
    memberId: 'gm-2',
    memberName: 'Michael Chang',
    checkInTime: '2026-11-11T09:00:00Z',
    checkOutTime: '2026-11-11T10:15:00Z',
    date: '2026-11-11'
  },
  {
    id: 'att-3',
    gymId: 'gym-apex-1',
    memberId: 'gm-1',
    memberName: 'Sarah Jenkins',
    checkInTime: '2026-11-10T17:30:00Z',
    checkOutTime: '2026-11-10T18:45:00Z',
    date: '2026-11-10'
  },
  {
    id: 'att-4',
    gymId: 'gym-apex-1',
    memberId: 'gm-2',
    memberName: 'Michael Chang',
    checkInTime: '2026-11-10T08:15:00Z',
    checkOutTime: '2026-11-10T09:30:00Z',
    date: '2026-11-10'
  },
  {
    id: 'att-5',
    gymId: 'gym-apex-1',
    memberId: 'gm-3',
    memberName: 'Emma Watson',
    checkInTime: '2026-10-28T16:00:00Z',
    checkOutTime: '2026-10-28T17:15:00Z',
    date: '2026-10-28'
  }
];

export const SEED_GYM_EXPENSES: GymExpenseRecord[] = [
  {
    id: 'exp-1',
    gymId: 'gym-apex-1',
    category: 'rent',
    title: 'Highline Commercial Facility Lease',
    amount: 65000,
    date: '2026-11-01',
    recordedBy: 'Marcus Sterling'
  },
  {
    id: 'exp-2',
    gymId: 'gym-apex-1',
    category: 'salaries',
    title: 'Certified Trainer & Support Staff Payroll',
    amount: 52000,
    date: '2026-11-02',
    recordedBy: 'Marcus Sterling'
  },
  {
    id: 'exp-3',
    gymId: 'gym-apex-1',
    category: 'utilities',
    title: 'HVAC Air Purification & 3-Phase Commercial Electricity',
    amount: 14200,
    date: '2026-11-05',
    recordedBy: 'Marcus Sterling'
  },
  {
    id: 'exp-4',
    gymId: 'gym-apex-1',
    category: 'maintenance',
    title: 'Olympic Barbell Bearing Overhaul & Sauna Filter Replacements',
    amount: 7800,
    date: '2026-11-08',
    recordedBy: 'Marcus Sterling'
  }
];
