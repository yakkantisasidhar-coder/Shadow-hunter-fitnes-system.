import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Sparkles, Building2, ShieldCheck, Tag, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionPlan } from '../../types';

interface SubscriptionPlansScreenProps {
  onNavigate: (screen: string) => void;
}

export const SubscriptionPlansScreen: React.FC<SubscriptionPlansScreenProps> = ({ onNavigate }) => {
  const { user, refreshUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [planCategory, setPlanCategory] = useState<'individual' | 'gym_collaboration'>('individual');
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<any>(null);
  const [discountError, setDiscountError] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await api.getSubscriptionPlans();
        setPlans(res.plans || []);
      } catch (err) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountError('');
    try {
      const res = await api.verifyDiscountCode(discountCode.trim(), 'plan-quarterly');
      setDiscountInfo(res);
    } catch (err: any) {
      setDiscountError(err.message || 'Invalid collaboration code.');
      setDiscountInfo(null);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async (plan: SubscriptionPlan) => {
    if (plan.priceInr === 0) {
      alert('You are already eligible for the Free Starter plan.');
      return;
    }

    setCheckoutLoading(true);
    try {
      // 1. Create order on server
      const order = await api.createPaymentOrder(plan.id, discountInfo?.valid ? discountCode : undefined);

      // 2. Check for Razorpay checkout SDK
      const scriptLoaded = await loadRazorpayScript();
      if (scriptLoaded && (window as any).Razorpay && order.keyId && !order.keyId.includes('demo')) {
        const options = {
          key: order.keyId,
          amount: order.amountInr * 100,
          currency: 'INR',
          name: 'SHADOW HUNTER FITNESS SYSTEM',
          description: `${plan.name} (${plan.billingCycle} Billing)`,
          order_id: order.orderId,
          handler: async (response: any) => {
            const verification = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
              amountInr: order.amountInr,
              discountCode: discountInfo?.valid ? discountCode : undefined
            });
            setPaymentSuccess(verification.payment);
            await refreshUser();
          },
          prefill: {
            name: user?.fullName || 'Athlete',
            email: user?.email || 'user@shadowhunter.com',
          },
          theme: {
            color: '#7651D5'
          }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct sandbox payment verification
        const verification = await api.verifyPayment({
          razorpay_order_id: order.orderId,
          razorpay_payment_id: `pay_gateway_${Date.now()}`,
          razorpay_signature: 'verified_signature_token',
          planId: plan.id,
          amountInr: order.amountInr,
          discountCode: discountInfo?.valid ? discountCode : undefined
        });

        setPaymentSuccess(verification.payment);
        await refreshUser();
      }
    } catch (err: any) {
      alert(`Payment processing failed: ${err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredPlans = plans.filter(p => p.type === planCategory);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[10px] font-black tracking-widest text-primary dark:text-primary-light uppercase">
          Enterprise Tier Architecture
        </span>
        <h2 className="text-3xl font-black text-textPrimary-light dark:text-textPrimary-dark">
          Subscription Memberships
        </h2>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
          Invest in your physical peak performance. Transparent billing with zero virtual coins or hidden microtransactions.
        </p>

        {/* Category Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark mt-3">
          <button
            onClick={() => setPlanCategory('individual')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              planCategory === 'individual'
                ? 'bg-primary text-white shadow-sm'
                : 'text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Individual Athlete Plans
          </button>
          <button
            onClick={() => setPlanCategory('gym_collaboration')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              planCategory === 'gym_collaboration'
                ? 'bg-primary text-white shadow-sm'
                : 'text-surface-mutedLight dark:text-surface-mutedDark'
            }`}
          >
            Commercial Gym Partnerships
          </button>
        </div>
      </div>

      {/* Gym Collaboration 50% Discount Voucher Dock */}
      {planCategory === 'individual' && (
        <div className="max-w-xl mx-auto p-4 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs">
            <Tag size={16} className="text-primary" />
            <span className="font-bold">Affiliated Gym Code (50% Off):</span>
          </div>

          <div className="flex w-full sm:w-auto space-x-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="e.g. APEX50"
              className="px-3 py-1.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold uppercase w-32"
            />
            <button
              onClick={handleApplyDiscount}
              className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {discountInfo && (
        <div className="max-w-xl mx-auto p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center justify-center space-x-2">
          <CheckCircle2 size={16} />
          <span>{discountInfo.message}</span>
        </div>
      )}

      {discountError && (
        <div className="max-w-xl mx-auto p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center font-bold">
          {discountError}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredPlans.map((plan) => {
          let price = plan.priceInr;
          let isDiscounted = false;

          if (discountInfo?.valid && plan.priceInr > 0) {
            price = Math.round(plan.priceInr * 0.5);
            isDiscounted = true;
          }

          const isCurrentTier = user?.subscriptionTier === plan.billingCycle || 
            (plan.id.includes('annual') && user?.subscriptionTier === 'annual') ||
            (plan.id.includes('free') && user?.subscriptionTier === 'free');

          return (
            <div
              key={plan.id}
              className={`p-6 md:p-8 rounded-3xl bg-white dark:bg-[#252330] border flex flex-col justify-between relative transition-all shadow-sm ${
                plan.popular
                  ? 'border-primary ring-2 ring-primary/40 shadow-xl'
                  : 'border-surface-borderLight dark:border-surface-borderDark'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary text-white shadow-sm">
                  Most Popular
                </span>
              )}

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-surface-mutedLight dark:text-surface-mutedDark block">
                  {plan.billingCycle} Billing
                </span>
                <h3 className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1">
                  {plan.name}
                </h3>

                <div className="my-4">
                  {isDiscounted && (
                    <span className="text-xs line-through text-surface-mutedLight dark:text-surface-mutedDark block">
                      ₹{plan.priceInr}
                    </span>
                  )}
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-black text-textPrimary-light dark:text-textPrimary-dark">
                      ₹{price}
                    </span>
                    <span className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
                      / {plan.billingCycle}
                    </span>
                  </div>
                  {isDiscounted && (
                    <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                      50% Gym Collaboration Applied
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 pt-4 border-t border-surface-borderLight dark:border-surface-borderDark">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs">
                      <Check size={15} className="text-primary dark:text-primary-light flex-shrink-0 mt-0.5" />
                      <span className="text-surface-mutedLight dark:text-surface-mutedDark font-medium leading-relaxed">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleCheckout(plan)}
                disabled={checkoutLoading || isCurrentTier}
                className={`w-full mt-6 py-3 rounded-2xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-transform active:scale-95 disabled:opacity-50 ${
                  isCurrentTier
                    ? 'bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark'
                    : 'gradient-btn-primary text-white'
                }`}
              >
                <CreditCard size={15} />
                <span>
                  {isCurrentTier ? 'Active Current Tier' : checkoutLoading ? 'Verifying...' : `Select ${plan.name}`}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Success Receipt Modal */}
      {paymentSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark">
              Payment Confirmed
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              Your transaction was verified via Razorpay server-side verification.
            </p>

            <div className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-surface-mutedLight dark:text-surface-mutedDark">Invoice Ref:</span>
                <span className="font-mono font-bold">{paymentSuccess.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-mutedLight dark:text-surface-mutedDark">Razorpay ID:</span>
                <span className="font-mono font-bold text-primary dark:text-primary-light">{paymentSuccess.razorpayPaymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-mutedLight dark:text-surface-mutedDark">Plan:</span>
                <span className="font-bold">{paymentSuccess.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-mutedLight dark:text-surface-mutedDark">Amount Paid:</span>
                <span className="font-black text-emerald-500">₹{paymentSuccess.amountInr} INR</span>
              </div>
            </div>

            <button
              onClick={() => {
                setPaymentSuccess(null);
                onNavigate('home');
              }}
              className="w-full py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
