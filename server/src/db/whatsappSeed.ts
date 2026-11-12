import { 
  GymWhatsAppIntegration, 
  WhatsAppConsentRecord, 
  WhatsAppTemplate, 
  WhatsAppCampaign, 
  WhatsAppMessageLog, 
  WhatsAppAutomationSettings, 
  GymDesignTemplate 
} from '../types.js';

export const SEED_WHATSAPP_INTEGRATIONS: Record<string, GymWhatsAppIntegration> = {
  'gym-apex-1': {
    gymId: 'gym-apex-1',
    status: 'connected',
    phoneNumberId: '108492048593021',
    wabaId: '294029485029485',
    displayPhoneNumber: '+91 98765 43210',
    verifiedName: 'Apex Performance Athletic Club',
    qualityRating: 'GREEN',
    messagingLimitTier: 'TIER_10K',
    webhookVerified: true,
    lastHealthCheck: new Date().toISOString(),
    monthlyMessageAllowance: 5000,
    monthlyMessagesSent: 420,
    providerChargesInr: 630.00,
    connectedAt: '2026-01-15T09:00:00.000Z'
  },
  'gym-titan-2': {
    gymId: 'gym-titan-2',
    status: 'pending_verification',
    displayPhoneNumber: '+91 91234 56789',
    verifiedName: 'Titan Commercial Fitness Hub',
    qualityRating: 'UNKNOWN',
    messagingLimitTier: 'TIER_250',
    webhookVerified: false,
    monthlyMessageAllowance: 1000,
    monthlyMessagesSent: 0,
    providerChargesInr: 0,
    connectedAt: '2026-03-01T10:00:00.000Z'
  }
};

export const SEED_WHATSAPP_CONSENT_RECORDS: WhatsAppConsentRecord[] = [
  {
    id: 'consent-1',
    gymId: 'gym-apex-1',
    memberId: 'mem-apex-1',
    memberName: 'Alex Reynolds',
    phoneNumber: '+91 98450 11223',
    whatsappNumber: '+91 98450 11223',
    countryCode: '+91',
    hasConsent: true,
    consentDate: '2026-01-10T11:00:00.000Z',
    consentSource: 'digital_form',
    preferences: { promotional: true, serviceUpdates: true, workoutReminders: true },
    optedOut: false,
    updatedAt: '2026-01-10T11:00:00.000Z'
  },
  {
    id: 'consent-2',
    gymId: 'gym-apex-1',
    memberId: 'mem-apex-2',
    memberName: 'Priya Sharma',
    phoneNumber: '+91 97410 33445',
    whatsappNumber: '+91 97410 33445',
    countryCode: '+91',
    hasConsent: true,
    consentDate: '2026-01-12T14:30:00.000Z',
    consentSource: 'in_person',
    preferences: { promotional: true, serviceUpdates: true, workoutReminders: true },
    optedOut: false,
    updatedAt: '2026-01-12T14:30:00.000Z'
  },
  {
    id: 'consent-3',
    gymId: 'gym-apex-1',
    memberId: 'mem-apex-3',
    memberName: 'Vikram Malhotra',
    phoneNumber: '+91 99800 55667',
    whatsappNumber: '+91 99800 55667',
    countryCode: '+91',
    hasConsent: false,
    consentDate: '2026-02-01T10:00:00.000Z',
    consentSource: 'digital_form',
    preferences: { promotional: false, serviceUpdates: true, workoutReminders: false },
    optedOut: true,
    optedOutAt: '2026-02-15T09:00:00.000Z',
    updatedAt: '2026-02-15T09:00:00.000Z'
  }
];

export const SEED_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl-welcome',
    gymId: 'gym-apex-1',
    name: 'member_welcome_v1',
    category: 'UTILITY',
    language: 'en',
    metaStatus: 'APPROVED',
    headerType: 'IMAGE',
    headerTextOrMediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    bodyText: 'Hi {{member_name}}! 👋 Welcome to {{gym_name}}! We are thrilled to partner with you on your high-performance fitness journey. Your membership plan {{membership_plan}} is active through {{membership_expiry_date}}. See you on the gym floor!',
    footerText: 'Team {{gym_name}}',
    buttons: [{ type: 'QUICK_REPLY', text: 'View Workout Plan' }],
    exampleVariables: {
      member_name: 'Rahul',
      gym_name: 'Apex Performance',
      membership_plan: 'Pro Annual Membership',
      membership_expiry_date: '31 Dec 2026'
    },
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'tpl-renewal-reminder',
    gymId: 'gym-apex-1',
    name: 'membership_renewal_alert',
    category: 'UTILITY',
    language: 'en',
    metaStatus: 'APPROVED',
    headerType: 'IMAGE',
    bodyText: 'Hi {{member_name}}! 👋 Hope your workouts are progressing powerfully. Your membership at {{gym_name}} is scheduled to expire on {{membership_expiry_date}}. Renew today to retain your uninterrupted tier benefits and personal locker.',
    footerText: 'Contact desk: {{gym_contact}}',
    buttons: [{ type: 'QUICK_REPLY', text: 'Renew Membership' }],
    exampleVariables: {
      member_name: 'Priya',
      gym_name: 'Apex Performance',
      membership_expiry_date: '25 Nov 2026',
      gym_contact: '+91 98765 43210'
    },
    createdAt: '2026-01-20T12:00:00.000Z'
  },
  {
    id: 'tpl-diwali-greeting',
    gymId: 'gym-apex-1',
    name: 'diwali_festive_wishes',
    category: 'MARKETING',
    language: 'en',
    metaStatus: 'APPROVED',
    headerType: 'IMAGE',
    bodyText: 'Happy Diwali to you and your family from everyone at {{gym_name}}! 🪔✨ May this festive season bring boundless energy, health, strength, and victory to your fitness journey. We remain open with festive morning hours for your training continuity!',
    footerText: 'Celebrations at {{gym_name}}',
    exampleVariables: {
      gym_name: 'Apex Performance Athletic Club'
    },
    createdAt: '2026-02-01T09:00:00.000Z'
  },
  {
    id: 'tpl-pt-reminder',
    gymId: 'gym-apex-1',
    name: 'pt_session_scheduled_alert',
    category: 'UTILITY',
    language: 'en',
    metaStatus: 'APPROVED',
    headerType: 'NONE',
    bodyText: 'Hi {{member_name}}! 🏋️ Reminder: Your 1-on-1 Personal Training session with Coach {{trainer_name}} is confirmed for {{booking_date}} at {{booking_time}}. You have {{pt_sessions_remaining}} sessions remaining in your package. Stay hydrated and see you soon!',
    footerText: '{{gym_name}} Strength Team',
    exampleVariables: {
      member_name: 'Alex',
      trainer_name: 'Marcus Vance',
      booking_date: 'Tomorrow, Nov 13',
      booking_time: '07:00 AM',
      pt_sessions_remaining: '8',
      gym_name: 'Apex Performance'
    },
    createdAt: '2026-02-10T11:00:00.000Z'
  }
];

export const SEED_WHATSAPP_CAMPAIGNS: WhatsAppCampaign[] = [
  {
    id: 'camp-1',
    gymId: 'gym-apex-1',
    name: 'Diwali Festive Strength Greetings 2026',
    type: 'festival',
    occasionKey: 'diwali',
    templateId: 'tpl-diwali-greeting',
    messageBody: 'Happy Diwali to you and your family from everyone at Apex Performance! 🪔✨ May this festive season bring boundless energy, health, and victory to your fitness goals.',
    posterImageUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80',
    posterTitle: 'Apex Gold Diwali Festive Edition',
    targetAudience: 'all_consented',
    status: 'completed',
    stats: {
      eligible: 85,
      submitted: 84,
      delivered: 82,
      read: 78,
      failed: 1,
      skippedNoConsent: 3
    },
    createdAt: '2026-03-01T10:00:00.000Z',
    completedAt: '2026-03-01T10:05:00.000Z'
  },
  {
    id: 'camp-2',
    gymId: 'gym-apex-1',
    name: 'November Membership Expiry Follow-up',
    type: 'renewal_reminder',
    templateId: 'tpl-renewal-reminder',
    messageBody: 'Hi {{member_name}}! Your membership at Apex Performance is expiring soon. Renew today for uninterrupted access.',
    posterImageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
    targetAudience: 'expiring',
    status: 'scheduled',
    scheduledAt: '2026-11-20T10:00:00.000Z',
    stats: {
      eligible: 12,
      submitted: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      skippedNoConsent: 1
    },
    createdAt: '2026-11-10T14:00:00.000Z'
  }
];

export const SEED_WHATSAPP_MESSAGE_LOGS: WhatsAppMessageLog[] = [
  {
    id: 'log-1',
    gymId: 'gym-apex-1',
    campaignId: 'camp-1',
    campaignName: 'Diwali Festive Strength Greetings 2026',
    memberId: 'mem-apex-1',
    memberName: 'Alex Reynolds',
    recipientNumberMasked: '+91 98450 ****3',
    category: 'MARKETING',
    providerMessageId: 'wamid.HBgLMjUxOTg0NTAxMTIyMxUCABIYFDNBODQ5OTAwREVBMTExMDU4Njc3AA==',
    messageContentSnippet: 'Happy Diwali to you and your family from everyone at Apex Performance! 🪔✨ May this festive season...',
    hasMedia: true,
    mediaUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80',
    status: 'read',
    submittedAt: '2026-03-01T10:00:02.000Z',
    deliveredAt: '2026-03-01T10:00:15.000Z',
    readAt: '2026-03-01T10:14:22.000Z'
  },
  {
    id: 'log-2',
    gymId: 'gym-apex-1',
    campaignId: 'camp-1',
    campaignName: 'Diwali Festive Strength Greetings 2026',
    memberId: 'mem-apex-2',
    memberName: 'Priya Sharma',
    recipientNumberMasked: '+91 97410 ****5',
    category: 'MARKETING',
    providerMessageId: 'wamid.HBgLMjUxOTc0MTAzMzQ0NQUCABIYFDNBODQ5OTAwREVBMTExMDU4Njc4AA==',
    messageContentSnippet: 'Happy Diwali to you and your family from everyone at Apex Performance! 🪔✨ May this festive season...',
    hasMedia: true,
    mediaUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=800&q=80',
    status: 'delivered',
    submittedAt: '2026-03-01T10:00:03.000Z',
    deliveredAt: '2026-03-01T10:00:20.000Z'
  }
];

export const SEED_WHATSAPP_AUTOMATION_SETTINGS: Record<string, WhatsAppAutomationSettings> = {
  'gym-apex-1': {
    gymId: 'gym-apex-1',
    quietHours: { enabled: true, start: '21:00', end: '08:00' },
    timezone: 'Asia/Kolkata',
    duplicateSuppressionHours: 24,
    isPaused: false,
    updatedAt: new Date().toISOString(),
    triggers: {
      new_member_welcome: {
        id: 'new_member_welcome',
        name: 'New Member Onboarding',
        description: 'Send personalized welcome message & credentials when member is added or approved.',
        enabled: true,
        timingHoursBeforeOrAfter: 0,
        templateId: 'tpl-welcome',
        requireApproval: false,
        category: 'onboarding'
      },
      member_birthday: {
        id: 'member_birthday',
        name: 'Member Birthday Greeting & Free Shake',
        description: 'Send custom festive birthday wishes with poster attachment on member birth date.',
        enabled: true,
        timingHoursBeforeOrAfter: 9, // 9 AM
        requireApproval: false,
        category: 'lifecycle'
      },
      festival_occasions: {
        id: 'festival_occasions',
        name: 'Scheduled Festival Celebrations',
        description: 'Deliver scheduled festive greetings (Diwali, Sankranti, Ugadi, Eid, New Year).',
        enabled: true,
        timingHoursBeforeOrAfter: 9,
        requireApproval: true,
        category: 'lifecycle'
      },
      expiry_approaching_7d: {
        id: 'expiry_approaching_7d',
        name: 'Renewal Notice (7 Days Prior)',
        description: 'Remind members 7 days before membership expiry.',
        enabled: true,
        timingHoursBeforeOrAfter: 168,
        templateId: 'tpl-renewal-reminder',
        requireApproval: false,
        category: 'billing'
      },
      expiry_approaching_1d: {
        id: 'expiry_approaching_1d',
        name: 'Final Expiry Warning (24 Hours Prior)',
        description: 'Send immediate alert 1 day before access card deactivation.',
        enabled: true,
        timingHoursBeforeOrAfter: 24,
        requireApproval: false,
        category: 'billing'
      },
      membership_expired_followup: {
        id: 'membership_expired_followup',
        name: 'Post-Expiry Re-engagement',
        description: 'Warm check-in 3 days after expiry for eligible non-renewed athletes.',
        enabled: true,
        timingHoursBeforeOrAfter: 72,
        requireApproval: true,
        category: 'lifecycle'
      },
      pending_payment_reminder: {
        id: 'pending_payment_reminder',
        name: 'Unpaid Dues / Invoice Notice',
        description: 'Notify member with pending balance and invoice payment link.',
        enabled: true,
        timingHoursBeforeOrAfter: 48,
        requireApproval: false,
        category: 'billing'
      },
      missed_workouts_checkin: {
        id: 'missed_workouts_checkin',
        name: 'Consistency Motivational Check-in',
        description: 'Friendly message when no check-in recorded for 7 consecutive days.',
        enabled: false,
        timingHoursBeforeOrAfter: 168,
        requireApproval: true,
        category: 'attendance'
      },
      pt_session_reminder: {
        id: 'pt_session_reminder',
        name: 'Personal Training Session Reminder',
        description: 'Alert member 2 hours before scheduled 1-on-1 PT booking.',
        enabled: true,
        timingHoursBeforeOrAfter: 2,
        templateId: 'tpl-pt-reminder',
        requireApproval: false,
        category: 'training'
      },
      pt_session_completed: {
        id: 'pt_session_completed',
        name: 'PT Session Completion & Balance',
        description: 'Congratulatory session log and remaining package sessions summary.',
        enabled: true,
        timingHoursBeforeOrAfter: 0,
        requireApproval: false,
        category: 'training'
      },
      group_class_booking: {
        id: 'group_class_booking',
        name: 'Group Class Booking Confirmation',
        description: 'Immediate confirmation for HIIT, Yoga, or Spin class reserve.',
        enabled: true,
        timingHoursBeforeOrAfter: 0,
        requireApproval: false,
        category: 'training'
      },
      group_class_reminder: {
        id: 'group_class_reminder',
        name: 'Group Class Upcoming Alert',
        description: 'Notification 1 hour prior to scheduled group class.',
        enabled: true,
        timingHoursBeforeOrAfter: 1,
        requireApproval: false,
        category: 'training'
      },
      group_class_cancelled: {
        id: 'group_class_cancelled',
        name: 'Class Cancellation / Slot Release',
        description: 'Confirmation when member or trainer cancels a scheduled class.',
        enabled: true,
        timingHoursBeforeOrAfter: 0,
        requireApproval: false,
        category: 'training'
      },
      gym_facility_closure: {
        id: 'gym_facility_closure',
        name: 'Holiday / Emergency Closure Notice',
        description: 'Urgent broadcast regarding facility maintenance or unexpected closures.',
        enabled: true,
        timingHoursBeforeOrAfter: 0,
        requireApproval: true,
        category: 'facility'
      },
      fitness_milestone_badge: {
        id: 'fitness_milestone_badge',
        name: 'Personal Record & Milestone Greeting',
        description: 'Celebrate when member hits 100 workouts or verified weight-class PR.',
        enabled: true,
        timingHoursBeforeOrAfter: 0,
        requireApproval: false,
        category: 'lifecycle'
      }
    }
  }
};

export const SEED_GYM_DESIGN_TEMPLATES: GymDesignTemplate[] = [
  {
    id: 'des-diwali-1',
    gymId: 'system',
    title: 'Diwali Gold Elite Fitness',
    category: 'festival',
    subCategory: 'diwali',
    backgroundUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=80',
    backgroundColor: '#17151F',
    headline: 'HAPPY DIWALI',
    subheadline: 'IGNITE YOUR POWER • ILLUMINATE YOUR STRENGTH',
    badgeText: 'FESTIVE POWER',
    fontFamily: 'Montserrat, sans-serif',
    textColor: '#FFDF00',
    accentColor: '#7651D5',
    showLogo: true,
    showGymName: true,
    showContactInfo: true,
    previewUrl: 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'des-sankranti-1',
    gymId: 'system',
    title: 'Makara Sankranti / Pongal Harvest of Gains',
    category: 'festival',
    subCategory: 'sankranti',
    backgroundUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    backgroundColor: '#1E182B',
    headline: 'HAPPY MAKAR SANKRANTI',
    subheadline: 'SOAR HIGH IN HEALTH, DISCIPLINE & POWER',
    badgeText: 'FESTIVAL OF HARVEST',
    fontFamily: 'Inter, sans-serif',
    textColor: '#FFA500',
    accentColor: '#A58AF5',
    showLogo: true,
    showGymName: true,
    showContactInfo: true,
    previewUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-05T00:00:00.000Z'
  },
  {
    id: 'des-ugadi-1',
    gymId: 'system',
    title: 'Ugadi & Gudi Padwa Fresh Beginnings',
    category: 'festival',
    subCategory: 'ugadi',
    backgroundUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    backgroundColor: '#13111A',
    headline: 'HAPPY UGADI',
    subheadline: 'NEW YEAR • NEW PRs • ELEVATED DISCIPLINE',
    badgeText: 'NEW CALENDAR',
    fontFamily: 'Montserrat, sans-serif',
    textColor: '#10B981',
    accentColor: '#7651D5',
    showLogo: true,
    showGymName: true,
    showContactInfo: true,
    previewUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-08T00:00:00.000Z'
  },
  {
    id: 'des-newyear-1',
    gymId: 'system',
    title: 'New Year Athletic Transformation',
    category: 'festival',
    subCategory: 'new_year',
    backgroundUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    backgroundColor: '#17151F',
    headline: 'UNSTOPPABLE 2026',
    subheadline: 'COMMIT TO THE PROCESS • OWN YOUR RESULTS',
    badgeText: 'SEASON OF VICTORY',
    fontFamily: 'Inter, sans-serif',
    textColor: '#FFFFFF',
    accentColor: '#7651D5',
    showLogo: true,
    showGymName: true,
    showContactInfo: true,
    previewUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'des-maintenance-1',
    gymId: 'system',
    title: 'Facility Upgrade & Maintenance Notice',
    category: 'announcement',
    subCategory: 'maintenance',
    backgroundUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=80',
    backgroundColor: '#1B1726',
    headline: 'EQUIPMENT UPGRADE IN PROGRESS',
    subheadline: 'ENHANCING YOUR LIFTING ENVIRONMENT FOR PEAK PERFORMANCE',
    badgeText: 'FACILITY ADVISORY',
    fontFamily: 'Inter, sans-serif',
    textColor: '#F59E0B',
    accentColor: '#7651D5',
    showLogo: true,
    showGymName: true,
    showContactInfo: true,
    previewUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-10T00:00:00.000Z'
  },
  {
    id: 'des-motivation-1',
    gymId: 'system',
    title: 'High-Volume Hypertrophy Motivation',
    category: 'fitness_content',
    subCategory: 'motivation',
    backgroundUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1200&q=80',
    backgroundColor: '#14121C',
    headline: 'PROGRESSION IS EARNED',
    subheadline: 'CONSISTENCY DEFEATS COMPLACENCY EVERY SINGLE DAY',
    badgeText: 'MINDSET & RECOVERY',
    fontFamily: 'Montserrat, sans-serif',
    textColor: '#A58AF5',
    accentColor: '#7651D5',
    showLogo: true,
    showGymName: true,
    showContactInfo: false,
    previewUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-12T00:00:00.000Z'
  },
  {
    id: 'des-renewal-1',
    gymId: 'system',
    title: 'Membership Tier Renewal Notice',
    category: 'membership_business',
    subCategory: 'renewal',
    backgroundUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
    backgroundColor: '#1E1B29',
    headline: 'RENEW YOUR MEMBERSHIP',
    subheadline: 'MAINTAIN UNINTERRUPTED CLUB ACCESS & LOCKER PRIVILEGES',
    badgeText: 'RENEWAL REMINDER',
    fontFamily: 'Inter, sans-serif',
    textColor: '#FFFFFF',
    accentColor: '#10B981',
    showLogo: true,
    showGymName: true,
    showContactInfo: true,
    previewUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=400&q=80',
    createdAt: '2026-01-15T00:00:00.000Z'
  }
];
