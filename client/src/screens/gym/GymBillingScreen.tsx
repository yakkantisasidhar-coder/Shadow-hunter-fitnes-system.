import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  ArrowLeft, 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Send, 
  Receipt, 
  CreditCard, 
  Plus, 
  Download, 
  CheckCircle2, 
  X, 
  Filter,
  Calendar,
  Building2,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GymInvoice, GymPaymentRecord, GymMemberRecord } from '../../types';

interface GymBillingScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymBillingScreen: React.FC<GymBillingScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<GymInvoice[]>([]);
  const [payments, setPayments] = useState<GymPaymentRecord[]>([]);
  const [members, setMembers] = useState<GymMemberRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments'>('invoices');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Batch Billing Generation Modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchMonth, setBatchMonth] = useState('December 2026');
  const [batchDueDate, setBatchDueDate] = useState('2026-12-05');
  const [generating, setGenerating] = useState(false);

  // Record Payment Modal
  const [selectedInvoice, setSelectedInvoice] = useState<GymInvoice | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'upi' as 'cash' | 'upi' | 'online',
    transactionRef: '',
    notes: ''
  });
  const [recording, setRecording] = useState(false);

  // Active Receipt View Modal
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  const gymId = user?.gymId || 'gym-apex-1';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, payRes, memRes] = await Promise.all([
        api.getGymInvoices(gymId),
        api.getGymPayments(gymId),
        api.getGymMembers(gymId)
      ]);
      setInvoices(invRes.invoices || []);
      setPayments(payRes.payments || []);
      setMembers(memRes.members || []);
    } catch (err) {
      console.error('Failed to load billing records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleGenerateBatchBills = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await api.generateMonthlyBills(gymId, batchMonth, batchDueDate);
      alert(res.message || 'Monthly invoices generated successfully.');
      setShowBatchModal(false);
      fetchData();
    } catch (err: any) {
      alert(`Failed to generate monthly bills: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const openPaymentModal = (invoice: GymInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      amount: invoice.amount - invoice.paidAmount,
      paymentMethod: 'upi',
      transactionRef: '',
      notes: `Settlement for ${invoice.billingMonth}`
    });
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      setRecording(true);
      const res = await api.recordInvoicePayment(gymId, selectedInvoice.id, paymentForm);
      setSelectedInvoice(null);
      fetchData();
      if (res.receipt) {
        setActiveReceipt(res.receipt);
      }
    } catch (err: any) {
      alert(`Payment recording failed: ${err.message}`);
    } finally {
      setRecording(false);
    }
  };

  const handleSendReminder = async (invoiceId: string) => {
    try {
      const res = await api.sendPaymentReminder(gymId, invoiceId);
      alert(res.message || 'Payment reminder sent successfully.');
    } catch (err: any) {
      alert(`Failed to send reminder: ${err.message}`);
    }
  };

  // Calculations
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'paid')
    .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.memberName.toLowerCase().includes(search.toLowerCase()) ||
      inv.memberEmail.toLowerCase().includes(search.toLowerCase()) ||
      inv.billingMonth.toLowerCase().includes(search.toLowerCase()) ||
      (inv.receiptNumber && inv.receiptNumber.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return inv.status === statusFilter;
  });

  const filteredPayments = payments.filter(p => 
    p.memberName.toLowerCase().includes(search.toLowerCase()) ||
    p.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
    (p.transactionRef && p.transactionRef.toLowerCase().includes(search.toLowerCase()))
  );

  const getInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Paid Full</span>;
      case 'partially_paid':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Partially Paid</span>;
      case 'overdue':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">Overdue</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Unpaid</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('gym-manage')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Gym Portal</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Monthly Billing & Invoicing Desk
          </h1>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Automated monthly fee generation, cash/UPI receipt reconciliation, overdue tracking, and member payment ledger.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowBatchModal(true)}
            className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <Plus size={16} />
            <span>Generate Monthly Billing Run</span>
          </button>
        </div>
      </div>

      {/* Financial Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
            Total Billed Invoices
          </span>
          <p className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1">
            ₹{totalBilled.toLocaleString()}
          </p>
          <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5 block">
            Across {invoices.length} invoices generated
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
            Total Collections Received
          </span>
          <p className="text-2xl font-black text-emerald-500 mt-1">
            ₹{totalCollected.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-500/80 font-bold mt-0.5 block">
            {payments.length} verified receipts issued
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">
            Outstanding Due Receivables
          </span>
          <p className="text-2xl font-black text-rose-500 mt-1">
            ₹{totalOutstanding.toLocaleString()}
          </p>
          <span className="text-[11px] text-rose-500/80 font-bold mt-0.5 block">
            {invoices.filter(i => i.status === 'overdue').length} overdue accounts
          </span>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex border-b border-surface-borderLight dark:border-surface-borderDark gap-4">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'invoices'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
          }`}
        >
          <FileText size={16} />
          <span>Member Invoices ({invoices.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center space-x-2 pb-3 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'payments'
              ? 'border-primary text-primary dark:text-primary-light'
              : 'border-transparent text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
          }`}
        >
          <Receipt size={16} />
          <span>Payment History & Receipts ({payments.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {activeTab === 'invoices' && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            {(['all', 'unpaid', 'overdue', 'partially_paid', 'paid'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === status
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white dark:bg-[#252330] text-surface-mutedLight dark:text-surface-mutedDark border border-surface-borderLight dark:border-surface-borderDark'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}

        <div className="relative min-w-[280px]">
          <Search className="absolute left-3 top-2.5 text-surface-mutedLight dark:text-surface-mutedDark" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'invoices' ? "Search member, month, or receipt..." : "Search payment record, transaction ref..."}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* VIEW A: INVOICES TABLE */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light/50 dark:bg-[#1b1926]/50 text-surface-mutedLight dark:text-surface-mutedDark font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Billing Period</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Paid Balance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-surface-mutedLight dark:text-surface-mutedDark font-medium">
                      Loading invoice ledgers...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-surface-mutedLight dark:text-surface-mutedDark">
                      <FileText className="mx-auto mb-2 opacity-40" size={32} />
                      <p className="font-bold">No invoices matching the selected criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface-light/30 dark:hover:bg-[#1b1926]/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-black text-textPrimary-light dark:text-textPrimary-dark">{inv.memberName}</p>
                        <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">{inv.memberEmail}</p>
                        {inv.receiptNumber && (
                          <span className="text-[10px] text-primary dark:text-primary-light font-bold">
                            {inv.receiptNumber}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-bold text-textPrimary-light dark:text-textPrimary-dark">
                        {inv.billingMonth}
                      </td>

                      <td className="py-3 px-4 text-surface-mutedLight dark:text-surface-mutedDark font-medium">
                        {inv.dueDate}
                      </td>

                      <td className="py-3 px-4 font-black text-textPrimary-light dark:text-textPrimary-dark">
                        ₹{inv.amount}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-500">₹{inv.paidAmount}</span>
                        {inv.amount > inv.paidAmount && (
                          <span className="block text-[10px] text-rose-500 font-bold">
                            Rem: ₹{inv.amount - inv.paidAmount}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {getInvoiceStatusBadge(inv.status)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {inv.status !== 'paid' ? (
                            <>
                              <button
                                onClick={() => openPaymentModal(inv)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-white font-bold text-[10px] hover:bg-emerald-600 transition-colors cursor-pointer shadow-sm"
                              >
                                Record Pay
                              </button>
                              <button
                                onClick={() => handleSendReminder(inv.id)}
                                title="Send Payment Reminder Alert"
                                className="p-1.5 rounded-lg bg-surface-light dark:bg-[#1b1926] hover:bg-primary hover:text-white text-surface-mutedLight dark:text-surface-mutedDark transition-colors cursor-pointer"
                              >
                                <Send size={13} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setActiveReceipt({
                                receiptNumber: inv.receiptNumber || 'REC-SETTLED',
                                memberName: inv.memberName,
                                amount: inv.amount,
                                date: inv.paidAt || inv.generatedAt,
                                method: inv.paymentMethod || 'upi',
                                transactionRef: 'VERIFIED_SETTLEMENT',
                                recordedBy: 'Marcus Sterling'
                              })}
                              className="px-2.5 py-1.5 rounded-lg bg-surface-light dark:bg-[#1b1926] text-primary dark:text-primary-light font-bold text-[10px] hover:bg-primary hover:text-white transition-colors flex items-center space-x-1 cursor-pointer"
                            >
                              <Receipt size={12} />
                              <span>Receipt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW B: PAYMENT HISTORY & RECEIPTS TABLE */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light/50 dark:bg-[#1b1926]/50 text-surface-mutedLight dark:text-surface-mutedDark font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Receipt #</th>
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Transaction Ref</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Date Recorded</th>
                  <th className="py-3.5 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-surface-mutedLight dark:text-surface-mutedDark">
                      <Receipt className="mx-auto mb-2 opacity-40" size={32} />
                      <p className="font-bold">No payments recorded yet.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-light/30 dark:hover:bg-[#1b1926]/30 transition-colors">
                      <td className="py-3 px-4 font-black text-primary dark:text-primary-light">
                        {p.receiptNumber}
                      </td>

                      <td className="py-3 px-4 font-bold text-textPrimary-light dark:text-textPrimary-dark">
                        {p.memberName}
                      </td>

                      <td className="py-3 px-4 uppercase font-bold text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          p.paymentMethod === 'upi' ? 'bg-purple-500/10 text-purple-400' :
                          p.paymentMethod === 'cash' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-indigo-500/10 text-indigo-400'
                        }`}>
                          {p.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                        {p.transactionRef}
                      </td>

                      <td className="py-3 px-4 font-black text-emerald-500 text-sm">
                        ₹{p.amount}
                      </td>

                      <td className="py-3 px-4 text-surface-mutedLight dark:text-surface-mutedDark">
                        {new Date(p.recordedAt).toLocaleDateString()} &bull; {new Date(p.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setActiveReceipt(p)}
                          className="px-2.5 py-1 rounded-lg bg-surface-light dark:bg-[#1b1926] text-primary dark:text-primary-light font-bold text-[10px] hover:bg-primary hover:text-white transition-colors cursor-pointer"
                        >
                          Print Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: BATCH GENERATE MONTHLY BILLS */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-surface-borderLight dark:border-surface-borderDark">
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark flex items-center space-x-2">
                <FileText size={18} className="text-primary" />
                <span>Run Monthly Member Billing</span>
              </h3>
              <button onClick={() => setShowBatchModal(false)} className="text-surface-mutedLight hover:text-rose-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              This will batch-generate monthly dues for all {members.filter(m => m.status === 'active' || m.status === 'expired').length} active and renewing members according to their assigned membership plans.
            </p>

            <form onSubmit={handleGenerateBatchBills} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Billing Month Designation *</label>
                <input
                  type="text"
                  required
                  value={batchMonth}
                  onChange={(e) => setBatchMonth(e.target.value)}
                  placeholder="e.g. December 2026"
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Invoice Payment Due Date *</label>
                <input
                  type="date"
                  required
                  value={batchDueDate}
                  onChange={(e) => setBatchDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] font-bold text-surface-mutedLight hover:text-textPrimary-light cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-5 py-2 rounded-xl gradient-btn-primary text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {generating ? 'Processing Invoices...' : 'Confirm & Generate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT (CASH / UPI / ONLINE) */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-surface-borderLight dark:border-surface-borderDark">
              <div>
                <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                  Record Member Payment
                </h3>
                <p className="text-xs text-primary dark:text-primary-light font-bold">
                  {selectedInvoice.memberName} &bull; {selectedInvoice.billingMonth}
                </p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-surface-mutedLight hover:text-rose-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Payment Amount (₹ INR) *</label>
                <input
                  type="number"
                  required
                  max={selectedInvoice.amount - selectedInvoice.paidAmount}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-black text-emerald-500 text-sm"
                />
                <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-0.5 block">
                  Remaining Invoice Due: ₹{selectedInvoice.amount - selectedInvoice.paidAmount}
                </span>
              </div>

              <div>
                <label className="block font-bold mb-1">Payment Method / Channel *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['upi', 'cash', 'online'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentForm({ ...paymentForm, paymentMethod: method })}
                      className={`py-2 px-3 rounded-xl font-bold uppercase text-[11px] border transition-all cursor-pointer ${
                        paymentForm.paymentMethod === method
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#1b1926] text-surface-mutedLight'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Transaction Reference / UTR Number</label>
                <input
                  type="text"
                  value={paymentForm.transactionRef}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                  placeholder={paymentForm.paymentMethod === 'cash' ? 'Cash Handed to Front Desk' : 'UPI UTR / Reference ID'}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Notes / Ledger Remarks</label>
                <input
                  type="text"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] font-bold text-surface-mutedLight hover:text-textPrimary-light cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={recording}
                  className="px-5 py-2 rounded-xl gradient-btn-primary text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {recording ? 'Processing...' : 'Confirm & Issue Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: FORMAL PRINTABLE PAYMENT RECEIPT */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <div className="text-center pb-3 border-b border-surface-borderLight dark:border-surface-borderDark relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black text-sm mx-auto mb-2 shadow-md">
                SH
              </div>
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Official Facility Payment Receipt
              </h3>
              <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark uppercase tracking-widest font-bold">
                Apex Performance Athletic Club
              </p>
              <button
                onClick={() => setActiveReceipt(null)}
                className="absolute right-0 top-0 text-surface-mutedLight hover:text-rose-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-surface-light dark:bg-[#1b1926] space-y-2.5 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-surface-mutedLight dark:text-surface-mutedDark">Receipt Number:</span>
                <span className="font-mono font-bold text-primary dark:text-primary-light">{activeReceipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-mutedLight dark:text-surface-mutedDark">Member Name:</span>
                <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark">{activeReceipt.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-mutedLight dark:text-surface-mutedDark">Payment Method:</span>
                <span className="uppercase font-bold">{activeReceipt.paymentMethod || activeReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-mutedLight dark:text-surface-mutedDark">Transaction Ref:</span>
                <span className="font-mono text-[11px]">{activeReceipt.transactionRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-mutedLight dark:text-surface-mutedDark">Date & Time:</span>
                <span>{new Date(activeReceipt.date || activeReceipt.recordedAt).toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between text-sm font-black">
                <span>Amount Paid:</span>
                <span className="text-emerald-500">₹{activeReceipt.amount} INR</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
              <p>Authorized by {activeReceipt.recordedBy || 'Marcus Sterling'}</p>
              <p className="mt-0.5">Thank you for training with SHADOW HUNTER FITNESS SYSTEM.</p>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] font-bold text-xs flex items-center space-x-1.5 hover:bg-primary hover:text-white cursor-pointer transition-colors"
              >
                <Printer size={14} />
                <span>Print / Save PDF</span>
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-5 py-2 rounded-xl gradient-btn-primary text-white font-bold text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
