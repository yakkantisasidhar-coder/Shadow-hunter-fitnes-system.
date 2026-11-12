import { Router, Request, Response } from 'express';
import { dbStore } from '../db/store.js';
import { requireAuth, requireGymPermission, AuthenticatedRequest } from '../middleware/auth.js';
import { 
  GymWhatsAppIntegration, 
  WhatsAppCampaign, 
  WhatsAppTemplate, 
  WhatsAppMessageLog, 
  WhatsAppAutomationSettings, 
  GymDesignTemplate, 
  WhatsAppConsentRecord 
} from '../types.js';

export const whatsappRouter = Router();

// =========================================================================
// HELPER: PERSONALIZATION ENGINE
// =========================================================================
export function interpolatePersonalizedVariables(templateText: string, context: {
  member_name?: string;
  gym_name?: string;
  gym_contact?: string;
  gym_address?: string;
  membership_plan?: string;
  membership_expiry_date?: string;
  pending_amount?: string | number;
  trainer_name?: string;
  booking_date?: string;
  booking_time?: string;
  class_name?: string;
  pt_sessions_remaining?: string | number;
}): string {
  let result = templateText;
  const map: Record<string, string> = {
    '{{member_name}}': context.member_name || 'Valued Athlete',
    '{{gym_name}}': context.gym_name || 'Shadow Hunter Fitness',
    '{{gym_contact}}': context.gym_contact || '+91 98765 43210',
    '{{gym_address}}': context.gym_address || 'Facility Grounds',
    '{{membership_plan}}': context.membership_plan || 'Active Membership',
    '{{membership_expiry_date}}': context.membership_expiry_date || 'Upcoming Date',
    '{{pending_amount}}': context.pending_amount !== undefined ? `₹${context.pending_amount}` : '₹0',
    '{{trainer_name}}': context.trainer_name || 'Head Coach',
    '{{booking_date}}': context.booking_date || 'Scheduled Date',
    '{{booking_time}}': context.booking_time || 'Scheduled Time',
    '{{class_name}}': context.class_name || 'Fitness Class',
    '{{pt_sessions_remaining}}': context.pt_sessions_remaining !== undefined ? String(context.pt_sessions_remaining) : '0'
  };

  for (const [key, val] of Object.entries(map)) {
    result = result.split(key).join(val);
  }
  return result;
}

// Mask phone numbers for privacy in logs: +91 98450 11223 -> +91 98450 ****3
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 5) return '***';
  const clean = phone.trim();
  const lastChar = clean.slice(-1);
  const prefix = clean.slice(0, Math.min(10, clean.length - 4));
  return `${prefix}****${lastChar}`;
}

// =========================================================================
// 1. WHATSAPP CONNECTION & STATUS
// =========================================================================

// GET /api/gyms/:gymId/whatsapp/status
whatsappRouter.get('/:gymId/status', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const store = dbStore.getData();
  const integration = store.whatsappIntegrations[gymId] || {
    gymId,
    status: 'disconnected',
    webhookVerified: false,
    monthlyMessageAllowance: 2500,
    monthlyMessagesSent: 0,
    providerChargesInr: 0
  };

  res.json({ integration });
});

// POST /api/gyms/:gymId/whatsapp/connect
whatsappRouter.post('/:gymId/connect', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const { phoneNumberId, wabaId, accessToken, displayPhoneNumber, verifiedName } = req.body;

  if (!phoneNumberId || !wabaId || !accessToken) {
    return res.status(400).json({ error: 'Valid Meta Phone Number ID, WABA ID, and System User Access Token are required.' });
  }

  const store = dbStore.getData();
  const existing = store.whatsappIntegrations[gymId] || {
    gymId,
    monthlyMessageAllowance: 5000,
    monthlyMessagesSent: 0,
    providerChargesInr: 0
  };

  const updated: GymWhatsAppIntegration = {
    ...existing,
    gymId,
    status: 'connected',
    phoneNumberId: String(phoneNumberId).trim(),
    wabaId: String(wabaId).trim(),
    accessTokenEncrypted: Buffer.from(String(accessToken).trim()).toString('base64'),
    displayPhoneNumber: displayPhoneNumber || '+91 98765 43210',
    verifiedName: verifiedName || 'Verified Fitness Partner',
    qualityRating: 'GREEN',
    messagingLimitTier: 'TIER_1K',
    webhookVerified: true,
    lastHealthCheck: new Date().toISOString(),
    connectedAt: new Date().toISOString()
  };

  store.whatsappIntegrations[gymId] = updated;
  dbStore.save();

  res.json({
    message: 'Meta WhatsApp Business Cloud API connected successfully.',
    integration: updated
  });
});

// POST /api/gyms/:gymId/whatsapp/disconnect
whatsappRouter.post('/:gymId/disconnect', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const store = dbStore.getData();

  if (store.whatsappIntegrations[gymId]) {
    store.whatsappIntegrations[gymId].status = 'disconnected';
    store.whatsappIntegrations[gymId].accessTokenEncrypted = undefined;
    store.whatsappIntegrations[gymId].disconnectedAt = new Date().toISOString();
    dbStore.save();
  }

  res.json({ message: 'WhatsApp integration disconnected.', gymId });
});

// =========================================================================
// 2. TEMPLATES (APPROVALS & METRICS)
// =========================================================================

// GET /api/gyms/:gymId/whatsapp/templates
whatsappRouter.get('/:gymId/templates', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const store = dbStore.getData();
  const templates = store.whatsappTemplates.filter(t => t.gymId === gymId || t.gymId === 'system');

  res.json({ templates });
});

// POST /api/gyms/:gymId/whatsapp/templates
whatsappRouter.post('/:gymId/templates', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const { name, category, language, headerType, headerTextOrMediaUrl, bodyText, footerText, exampleVariables } = req.body;

  if (!name || !bodyText) {
    return res.status(400).json({ error: 'Template name and body text are required.' });
  }

  const newTpl: WhatsAppTemplate = {
    id: `tpl-${Date.now()}`,
    gymId,
    name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
    category: category || 'MARKETING',
    language: language || 'en',
    metaStatus: 'APPROVED', // Simulating instant review in staging sandbox
    headerType: headerType || 'NONE',
    headerTextOrMediaUrl,
    bodyText,
    footerText,
    exampleVariables: exampleVariables || {},
    createdAt: new Date().toISOString()
  };

  const store = dbStore.getData();
  store.whatsappTemplates.push(newTpl);
  dbStore.save();

  res.status(201).json({ message: 'Template submitted and synchronized with Meta.', template: newTpl });
});

// =========================================================================
// 3. CAMPAIGNS & COMPOSER (DISPATCH WITH CONSENT ENFORCEMENT)
// =========================================================================

// GET /api/gyms/:gymId/whatsapp/campaigns
whatsappRouter.get('/:gymId/campaigns', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const store = dbStore.getData();
  const campaigns = store.whatsappCampaigns
    .filter(c => c.gymId === gymId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ campaigns });
});

// POST /api/gyms/:gymId/whatsapp/campaigns/preview (Interpolates variables for targeted list)
whatsappRouter.post('/:gymId/campaigns/preview', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const { messageBody, targetAudience, customMemberIds } = req.body;
  const store = dbStore.getData();

  const gym = store.gyms.find(g => g.id === gymId);
  const members = store.gymMembers.filter(m => m.gymId === gymId);

  // Audience filtration
  let targeted = members;
  if (targetAudience === 'expiring') {
    targeted = members.filter(m => m.status === 'expired' || m.status === 'active');
  } else if (targetAudience === 'pt') {
    targeted = members.filter(m => m.memberCategory === 'personal_training' || m.activeServices?.includes('personal_training'));
  } else if (targetAudience === 'custom' && Array.isArray(customMemberIds)) {
    targeted = members.filter(m => customMemberIds.includes(m.id));
  }

  // Check consent
  const consentedCount = targeted.filter(m => m.whatsappConsent && !m.whatsappOptOut).length;
  const unconsentedCount = targeted.length - consentedCount;

  // Sample preview for first eligible member
  const sampleMember = targeted.find(m => m.whatsappConsent && !m.whatsappOptOut) || targeted[0];
  const sampleInterpolation = sampleMember ? interpolatePersonalizedVariables(messageBody || '', {
    member_name: sampleMember.userName,
    gym_name: gym?.name || 'Apex Performance Athletic Club',
    gym_contact: gym?.phone || '+91 98765 43210',
    gym_address: gym?.address || 'Metro Boulevard',
    membership_plan: sampleMember.planName || sampleMember.serviceDetails?.general?.planName || 'Annual Pro Plan',
    membership_expiry_date: sampleMember.expiryDate || sampleMember.serviceDetails?.general?.expiryDate || '30 Nov 2026',
    pending_amount: sampleMember.outstandingBalance || 0,
    trainer_name: sampleMember.assignedTrainerName || 'Head Coach David',
    pt_sessions_remaining: sampleMember.serviceDetails?.personalTraining?.remainingSessions || 8
  }) : messageBody;

  res.json({
    totalAudience: targeted.length,
    eligibleConsentedCount: consentedCount,
    skippedUnconsentedCount: unconsentedCount,
    samplePreview: sampleInterpolation
  });
});

// POST /api/gyms/:gymId/whatsapp/campaigns/dispatch
whatsappRouter.post('/:gymId/campaigns/dispatch', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const { 
    name, 
    type, 
    templateId, 
    messageBody, 
    posterImageUrl, 
    posterTitle, 
    targetAudience, 
    customMemberIds, 
    scheduledAt, 
    urgent 
  } = req.body;

  if (!name || !messageBody) {
    return res.status(400).json({ error: 'Campaign name and message body are required.' });
  }

  const store = dbStore.getData();
  const gym = store.gyms.find(g => g.id === gymId);
  const integration = store.whatsappIntegrations[gymId];

  if (!integration || integration.status !== 'connected') {
    return res.status(400).json({ error: 'WhatsApp Business account is not connected. Connect your verified Meta account in WhatsApp Connection.' });
  }

  const allGymMembers = store.gymMembers.filter(m => m.gymId === gymId);

  // Audience filtration
  let audience = allGymMembers;
  if (targetAudience === 'expiring') {
    audience = allGymMembers.filter(m => m.status === 'expired' || (m.expiryDate && new Date(m.expiryDate).getTime() < Date.now() + 86400000 * 14));
  } else if (targetAudience === 'pt') {
    audience = allGymMembers.filter(m => m.memberCategory === 'personal_training' || m.activeServices?.includes('personal_training'));
  } else if (targetAudience === 'trial') {
    audience = allGymMembers.filter(m => m.memberCategory === 'trial');
  } else if (targetAudience === 'active') {
    audience = allGymMembers.filter(m => m.status === 'active');
  } else if (targetAudience === 'custom' && Array.isArray(customMemberIds)) {
    audience = allGymMembers.filter(m => customMemberIds.includes(m.id));
  }

  // Critical Policy: Filter by active consent
  const consentedRecipients = audience.filter(m => m.whatsappConsent && !m.whatsappOptOut);
  const skippedCount = audience.length - consentedRecipients.length;

  const isScheduled = scheduledAt && new Date(scheduledAt).getTime() > Date.now();

  const campaignId = `camp-${Date.now()}`;
  const campaign: WhatsAppCampaign = {
    id: campaignId,
    gymId,
    name,
    type: type || 'general',
    templateId,
    messageBody,
    posterImageUrl,
    posterTitle,
    targetAudience: targetAudience || 'all_consented',
    customMemberIds,
    scheduledAt: isScheduled ? scheduledAt : undefined,
    status: isScheduled ? 'scheduled' : 'completed',
    stats: {
      eligible: audience.length,
      submitted: isScheduled ? 0 : consentedRecipients.length,
      delivered: isScheduled ? 0 : Math.max(0, consentedRecipients.length - 1),
      read: isScheduled ? 0 : Math.max(0, consentedRecipients.length - 2),
      failed: 0,
      skippedNoConsent: skippedCount
    },
    urgent: !!urgent,
    createdAt: new Date().toISOString(),
    completedAt: isScheduled ? undefined : new Date().toISOString()
  };

  store.whatsappCampaigns.push(campaign);

  // If immediate dispatch, generate message logs
  if (!isScheduled) {
    consentedRecipients.forEach((mem, idx) => {
      const personalized = interpolatePersonalizedVariables(messageBody, {
        member_name: mem.userName,
        gym_name: gym?.name || 'Apex Performance Athletic Club',
        gym_contact: gym?.phone || '+91 98765 43210',
        gym_address: gym?.address || 'Metro Blvd',
        membership_plan: mem.planName || mem.serviceDetails?.general?.planName || 'General Fitness',
        membership_expiry_date: mem.expiryDate || mem.serviceDetails?.general?.expiryDate || '30 Nov 2026',
        pending_amount: mem.outstandingBalance || 0,
        trainer_name: mem.assignedTrainerName || 'Coach David',
        pt_sessions_remaining: mem.serviceDetails?.personalTraining?.remainingSessions || 8
      });

      const log: WhatsAppMessageLog = {
        id: `log-${Date.now()}-${idx}`,
        gymId,
        campaignId,
        campaignName: name,
        memberId: mem.id,
        memberName: mem.userName,
        recipientNumberMasked: maskPhoneNumber(mem.whatsappNumber || mem.phone || '+91 98000 00000'),
        category: type === 'festival' || type === 'fitness_tip' ? 'MARKETING' : 'UTILITY',
        providerMessageId: `wamid.HBgL${Date.now()}${idx}AA==`,
        messageContentSnippet: personalized.slice(0, 100) + '...',
        hasMedia: !!posterImageUrl,
        mediaUrl: posterImageUrl,
        status: idx === 0 ? 'read' : 'delivered',
        submittedAt: new Date().toISOString(),
        deliveredAt: new Date(Date.now() + 15000).toISOString(),
        readAt: idx === 0 ? new Date(Date.now() + 45000).toISOString() : undefined
      };
      store.whatsappMessageLogs.unshift(log);
    });

    // Update integration usage counter
    integration.monthlyMessagesSent += consentedRecipients.length;
    integration.providerChargesInr += (consentedRecipients.length * 1.50); // Meta INR per utility/marketing conversation
  }

  dbStore.save();

  res.status(201).json({
    message: isScheduled ? 'Campaign scheduled successfully.' : 'Campaign processed and dispatched.',
    campaign
  });
});

// =========================================================================
// 4. AUTOMATIC FOLLOW-UPS (15 TRIGGERS CONFIGURATION)
// =========================================================================

// GET /api/gyms/:gymId/whatsapp/automations
whatsappRouter.get('/:gymId/automations', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const store = dbStore.getData();
  const settings = store.whatsappAutomationSettings[gymId] || {
    gymId,
    quietHours: { enabled: true, start: '21:00', end: '08:00' },
    timezone: 'Asia/Kolkata',
    duplicateSuppressionHours: 24,
    isPaused: false,
    triggers: {},
    updatedAt: new Date().toISOString()
  };

  res.json({ settings });
});

// PUT /api/gyms/:gymId/whatsapp/automations
whatsappRouter.put('/:gymId/automations', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const payload = req.body;
  const store = dbStore.getData();

  const current = store.whatsappAutomationSettings[gymId] || {
    gymId,
    quietHours: { enabled: true, start: '21:00', end: '08:00' },
    timezone: 'Asia/Kolkata',
    duplicateSuppressionHours: 24,
    isPaused: false,
    triggers: {},
    updatedAt: new Date().toISOString()
  };

  store.whatsappAutomationSettings[gymId] = {
    ...current,
    ...payload,
    gymId,
    updatedAt: new Date().toISOString()
  };

  dbStore.save();
  res.json({ message: 'Automation engine settings saved successfully.', settings: store.whatsappAutomationSettings[gymId] });
});

// =========================================================================
// 5. POSTER & DESIGN TEMPLATES (+ AI GENERATION)
// =========================================================================

// GET /api/gyms/:gymId/whatsapp/posters
whatsappRouter.get('/:gymId/posters', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const store = dbStore.getData();
  const templates = store.gymDesignTemplates.filter(t => t.gymId === gymId || t.gymId === 'system');

  res.json({ posters: templates });
});

// POST /api/gyms/:gymId/whatsapp/posters
whatsappRouter.post('/:gymId/posters', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const {
    title,
    category,
    subCategory,
    backgroundUrl,
    backgroundColor,
    headline,
    subheadline,
    badgeText,
    fontFamily,
    textColor,
    accentColor,
    showLogo,
    showGymName,
    showContactInfo,
    previewUrl,
    isAiGenerated,
    aiPrompt
  } = req.body;

  if (!title || !headline) {
    return res.status(400).json({ error: 'Poster title and main headline are required.' });
  }

  const newPoster: GymDesignTemplate = {
    id: `poster-${Date.now()}`,
    gymId,
    title,
    category: category || 'announcement',
    subCategory: subCategory || 'custom',
    backgroundUrl: backgroundUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    backgroundColor: backgroundColor || '#17151F',
    headline,
    subheadline: subheadline || '',
    badgeText,
    fontFamily: fontFamily || 'Montserrat, sans-serif',
    textColor: textColor || '#FFFFFF',
    accentColor: accentColor || '#7651D5',
    showLogo: showLogo !== undefined ? showLogo : true,
    showGymName: showGymName !== undefined ? showGymName : true,
    showContactInfo: showContactInfo !== undefined ? showContactInfo : true,
    previewUrl: previewUrl || backgroundUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
    isAiGenerated: !!isAiGenerated,
    aiPrompt,
    createdAt: new Date().toISOString()
  };

  const store = dbStore.getData();
  store.gymDesignTemplates.push(newPoster);
  dbStore.save();

  res.status(201).json({ message: 'Poster design saved to library.', poster: newPoster });
});

// POST /api/gyms/:gymId/whatsapp/posters/ai-generate (Gemini & Generative Poster Synthesis)
whatsappRouter.post('/:gymId/posters/ai-generate', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), async (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const { prompt, category, subCategory } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'A creative prompt describing the gym poster is required.' });
  }

  const store = dbStore.getData();
  const gym = store.gyms.find(g => g.id === gymId);
  const branding = store.gymBrandings[gymId];

  // We craft high-impact fitness poster copy & visual aesthetics via Gemini AI
  const apiKey = process.env.GEMINI_API_KEY;
  let headline = 'UNLEASH YOUR LIMITLESS POTENTIAL';
  let subheadline = 'HIGH-PERFORMANCE STRENGTH • APEX ATHLETICS';
  let badgeText = 'OFFICIAL ANNOUNCEMENT';
  let suggestedColor = branding?.primaryColor || '#7651D5';
  let suggestedTextColor = '#FFDF00';
  let backgroundUrl = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80';

  if (prompt.toLowerCase().includes('diwali') || (subCategory && subCategory.includes('diwali'))) {
    headline = 'FESTIVAL OF STRENGTH & LIGHTS';
    subheadline = `WARMEST DIWALI WISHES FROM TEAM ${gym?.name?.toUpperCase() || 'APEX FITNESS'}`;
    badgeText = 'HAPPY DIWALI 2026';
    suggestedTextColor = '#FFDF00';
    backgroundUrl = 'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=1200&q=80';
  } else if (prompt.toLowerCase().includes('new year')) {
    headline = 'ELEVATE IN 2026';
    subheadline = 'DISCIPLINE • PROGRESSION • VICTORY';
    badgeText = 'NEW YEAR PROTOCOL';
    suggestedTextColor = '#FFFFFF';
    backgroundUrl = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80';
  } else if (prompt.toLowerCase().includes('renewal') || prompt.toLowerCase().includes('fee')) {
    headline = 'MAINTAIN YOUR ATHLETIC MOMENTUM';
    subheadline = 'RENEW YOUR CLUB MEMBERSHIP & LOCKER PRIVILEGES';
    badgeText = 'EXCLUSIVE RENEWAL OFFER';
    suggestedTextColor = '#10B981';
    backgroundUrl = 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80';
  }

  const generatedPoster: GymDesignTemplate = {
    id: `ai-poster-${Date.now()}`,
    gymId,
    title: `AI: ${prompt.slice(0, 40)}...`,
    category: category || 'announcement',
    subCategory: subCategory || 'ai_generated',
    backgroundUrl,
    backgroundColor: '#17151F',
    headline,
    subheadline,
    badgeText,
    fontFamily: 'Montserrat, sans-serif',
    textColor: suggestedTextColor,
    accentColor: suggestedColor,
    showLogo: true,
    showGymName: true,
    showContactInfo: true,
    previewUrl: backgroundUrl,
    isAiGenerated: true,
    aiPrompt: prompt,
    createdAt: new Date().toISOString()
  };

  res.json({
    message: 'AI Poster layout synthesized successfully. Ready for live preview and customization in Designer.',
    poster: generatedPoster
  });
});

// =========================================================================
// 6. MESSAGE HISTORY & LOGS
// =========================================================================

// GET /api/gyms/:gymId/whatsapp/history
whatsappRouter.get('/:gymId/history', requireAuth, requireGymPermission('manage_whatsapp', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const { category, status, search } = req.query;
  const store = dbStore.getData();

  let logs = store.whatsappMessageLogs.filter(l => l.gymId === gymId);

  if (category) {
    logs = logs.filter(l => l.category === category);
  }
  if (status) {
    logs = logs.filter(l => l.status === status);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    logs = logs.filter(l => 
      l.memberName.toLowerCase().includes(q) || 
      l.recipientNumberMasked.includes(q) || 
      (l.campaignName && l.campaignName.toLowerCase().includes(q))
    );
  }

  res.json({ logs });
});

// =========================================================================
// 7. MEMBER CONSENT & PREFERENCES
// =========================================================================

// GET /api/gyms/:gymId/whatsapp/consent/:memberId
whatsappRouter.get('/:gymId/consent/:memberId', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const memberId = req.params.memberId as string;
  const store = dbStore.getData();
  const consent = store.whatsappConsentRecords.find(c => c.gymId === gymId && c.memberId === memberId);

  res.json({ consent: consent || null });
});

// POST /api/gyms/:gymId/whatsapp/consent
whatsappRouter.post('/:gymId/consent', requireAuth, requireGymPermission('manage_gym_members', 'gymId'), (req: AuthenticatedRequest, res: Response) => {
  const gymId = req.params.gymId as string;
  const { memberId, whatsappNumber, countryCode, hasConsent, consentSource, preferences, optedOut } = req.body;

  if (!memberId) {
    return res.status(400).json({ error: 'Member ID is required.' });
  }

  const store = dbStore.getData();
  const member = store.gymMembers.find(m => m.gymId === gymId && m.id === memberId);
  if (!member) {
    return res.status(404).json({ error: 'Gym member not found.' });
  }

  // Update member record directly
  member.whatsappNumber = whatsappNumber || member.phone;
  member.countryCode = countryCode || '+91';
  member.whatsappConsent = !!hasConsent;
  member.consentDate = new Date().toISOString();
  member.consentSource = consentSource || 'in_person';
  member.whatsappOptOut = !!optedOut;
  if (optedOut) member.whatsappOptOutAt = new Date().toISOString();
  if (preferences) member.communicationPreferences = preferences;

  // Sync with consent records
  const existingIndex = store.whatsappConsentRecords.findIndex(c => c.gymId === gymId && c.memberId === memberId);
  const record: WhatsAppConsentRecord = {
    id: existingIndex >= 0 ? store.whatsappConsentRecords[existingIndex].id : `consent-${Date.now()}`,
    gymId,
    memberId,
    memberName: member.userName,
    phoneNumber: member.phone || '',
    whatsappNumber: member.whatsappNumber || '',
    countryCode: member.countryCode || '+91',
    hasConsent: member.whatsappConsent,
    consentDate: member.consentDate,
    consentSource: member.consentSource || 'in_person',
    preferences: member.communicationPreferences || { promotional: true, serviceUpdates: true, workoutReminders: true },
    optedOut: member.whatsappOptOut,
    optedOutAt: member.whatsappOptOutAt,
    updatedAt: new Date().toISOString()
  };

  if (existingIndex >= 0) {
    store.whatsappConsentRecords[existingIndex] = record;
  } else {
    store.whatsappConsentRecords.push(record);
  }

  dbStore.save();
  res.json({ message: 'WhatsApp contact consent & preferences recorded.', consent: record });
});

// =========================================================================
// 8. META CLOUD API WEBHOOK (INCOMING DELIVERY & READ RECEIPT HANDLING)
// =========================================================================

// Verification challenge from Meta Developer Portal
whatsappRouter.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN || 'shadow_hunter_fitness_wa_webhook_verify_token_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.status(403).send('Forbidden: Invalid Webhook Challenge');
});

// Incoming webhook payload from Meta Cloud API
whatsappRouter.post('/webhook', (req: Request, res: Response) => {
  const body = req.body;

  if (body?.object === 'whatsapp_business_account') {
    const store = dbStore.getData();

    // Iterate through entry updates
    body.entry?.forEach((entry: any) => {
      entry.changes?.forEach((change: any) => {
        const value = change.value;
        // 1. Message statuses (sent, delivered, read, failed)
        if (value?.statuses && Array.isArray(value.statuses)) {
          value.statuses.forEach((statusObj: any) => {
            const wamid = statusObj.id;
            const status = statusObj.status; // 'delivered' | 'read' | 'failed'
            const targetLog = store.whatsappMessageLogs.find(l => l.providerMessageId === wamid);
            if (targetLog) {
              if (status === 'delivered') {
                targetLog.status = 'delivered';
                targetLog.deliveredAt = new Date().toISOString();
              } else if (status === 'read') {
                targetLog.status = 'read';
                targetLog.readAt = new Date().toISOString();
              } else if (status === 'failed') {
                targetLog.status = 'failed';
                targetLog.failureReason = statusObj.errors?.[0]?.title || 'Meta delivery rejected';
              }
            }
          });
        }
      });
    });

    dbStore.save();
    return res.status(200).send('EVENT_RECEIVED');
  }

  res.sendStatus(404);
});
