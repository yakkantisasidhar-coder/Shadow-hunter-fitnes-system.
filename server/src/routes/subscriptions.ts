import { Router, Response } from 'express';
import crypto from 'crypto';
import { dbStore } from '../db/store.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { PaymentTransaction } from '../types.js';

export const subscriptionsRouter = Router();

// Get Available Subscription Plans
subscriptionsRouter.get('/plans', (_req, res) => {
  const plans = dbStore.getData().subscriptionPlans;
  res.json({ plans });
});

// Verify Gym Collaboration Discount Code
subscriptionsRouter.post('/verify-discount-code', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { code, planId } = req.body;
  if (!code) return res.status(400).json({ error: 'Code is required' });

  // Find if matching gym code exists
  const gym = dbStore.getData().gyms.find(g => g.joinCode.toUpperCase() === code.trim().toUpperCase());
  if (!gym) {
    return res.status(404).json({ error: 'Invalid gym collaboration code.' });
  }

  // 50% discount as configured in Master Requirements
  res.json({
    valid: true,
    gymName: gym.name,
    discountPercentage: 50,
    message: `Gym Partnership Verified: 50% discount unlocked via ${gym.name} collaboration.`
  });
});

// Create Payment Order
subscriptionsRouter.post('/create-order', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { planId, gymDiscountCode } = req.body;
  const plan = dbStore.getData().subscriptionPlans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ error: 'Plan not found' });

  let finalAmount = plan.priceInr;
  let discountApplied = false;

  if (gymDiscountCode) {
    const gym = dbStore.getData().gyms.find(g => g.joinCode.toUpperCase() === gymDiscountCode.trim().toUpperCase());
    if (gym) {
      finalAmount = Math.round(plan.priceInr * 0.5);
      discountApplied = true;
    }
  }

  // Razorpay order simulation or integration
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  res.json({
    orderId,
    amountInr: finalAmount,
    currency: 'INR',
    planName: plan.name,
    discountApplied,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_shadow_hunter_demo'
  });
});

// Server-side Payment Verification
subscriptionsRouter.post('/verify-payment', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    planId,
    amountInr,
    discountCode
  } = req.body;

  const plan = dbStore.getData().subscriptionPlans.find(p => p.id === planId);
  if (!plan) return res.status(404).json({ error: 'Invalid subscription plan' });

  // If Razorpay secret is present and live signature sent, verify HMAC SHA256
  const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
  let isSignatureValid = true;

  if (razorpaySecret && razorpay_signature && razorpaySecret !== 'rzp_test_secret_demo_token') {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(body.toString())
      .digest('hex');
    isSignatureValid = (expectedSignature === razorpay_signature);
  }

  if (!isSignatureValid) {
    return res.status(400).json({ error: 'Payment signature verification failed. Untrusted transaction.' });
  }

  // Record payment
  const paymentRecord: PaymentTransaction = {
    id: `pay-${Date.now()}`,
    userId: req.user.id,
    userEmail: req.user.email,
    razorpayOrderId: razorpay_order_id || `sim-order-${Date.now()}`,
    razorpayPaymentId: razorpay_payment_id || `pay_sim_${Date.now()}`,
    amountInr: Number(amountInr) || plan.priceInr,
    currency: 'INR',
    planName: plan.name,
    status: 'success',
    discountApplied: !!discountCode,
    discountCode: discountCode || undefined,
    date: new Date().toISOString()
  };

  dbStore.getData().payments.unshift(paymentRecord);

  // Upgrade user's subscription tier
  const profile = dbStore.getUserProfile(req.user.id);
  if (profile) {
    if (plan.id.includes('annual')) profile.subscriptionTier = 'annual';
    else if (plan.id.includes('quarterly')) profile.subscriptionTier = 'quarterly';
    else if (plan.id.includes('monthly')) profile.subscriptionTier = 'monthly';
    else if (plan.type === 'gym_collaboration') profile.subscriptionTier = 'gym_collab';

    dbStore.setUserProfile(req.user.id, profile);
  }

  // Add Notification
  dbStore.getData().notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: req.user.id,
    title: 'Payment Confirmed',
    message: `Your ${plan.name} subscription is now active. Receipt #${paymentRecord.id}.`,
    type: 'payment',
    read: false,
    createdAt: new Date().toISOString()
  });

  // Audit log
  dbStore.addAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    actorRole: req.user.role,
    action: 'SUBSCRIPTION_PURCHASE',
    targetType: 'subscription',
    targetId: plan.id,
    details: `Purchased ${plan.name} for ₹${paymentRecord.amountInr}. Ref: ${paymentRecord.razorpayPaymentId}`,
    ipAddress: req.ip || '127.0.0.1'
  });

  dbStore.save();

  res.json({
    success: true,
    payment: paymentRecord,
    updatedTier: profile?.subscriptionTier
  });
});

// User Payment History
subscriptionsRouter.get('/payment-history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const payments = dbStore.getData().payments.filter(p => p.userId === req.user?.id);
  res.json({ payments });
});
