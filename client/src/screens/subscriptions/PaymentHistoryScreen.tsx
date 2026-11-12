import React, { useEffect, useState } from 'react';
import { FileText, Download, CheckCircle2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { PaymentTransaction } from '../../types';

interface PaymentHistoryScreenProps {
  onNavigate: (screen: string) => void;
}

export const PaymentHistoryScreen: React.FC<PaymentHistoryScreenProps> = ({ onNavigate }) => {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getPaymentHistory();
        setPayments(res.payments || []);
      } catch (err) {
        console.error('Failed to load payment history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('subscriptions')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Membership Plans</span>
          </button>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Payment History & Invoices
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Certified Razorpay transaction receipts, invoice numbers, and active subscription cycles.
          </p>
        </div>

        <button
          onClick={() => onNavigate('subscriptions')}
          className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold"
        >
          Manage Plans
        </button>
      </div>

      {/* Receipts Table */}
      <div className="rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs">Loading billing receipts...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold">No payment transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight dark:text-surface-mutedDark font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Payment Reference</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-textPrimary-light dark:text-textPrimary-dark">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                      {p.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-primary dark:text-primary-light">
                      {p.planName}
                      {p.discountApplied && (
                        <span className="block text-[9px] font-bold text-emerald-500">
                          Gym Code {p.discountCode} (50% Off)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {p.razorpayPaymentId}
                    </td>
                    <td className="py-3.5 px-4 font-black text-textPrimary-light dark:text-textPrimary-dark">
                      ₹{p.amountInr} {p.currency}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Downloading verified tax invoice #${p.id}`)}
                        className="p-1.5 rounded-lg border border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary transition-colors"
                        title="Download Receipt"
                      >
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
