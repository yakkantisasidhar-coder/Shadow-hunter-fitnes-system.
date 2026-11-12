import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ArrowLeft, 
  DollarSign, 
  Download, 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  CreditCard, 
  Receipt, 
  X,
  PieChart,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GymExpenseRecord } from '../../types';

interface GymFinancialsScreenProps {
  onNavigate: (screen: string) => void;
}

export const GymFinancialsScreen: React.FC<GymFinancialsScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [financials, setFinancials] = useState<any>(null);
  const [expenses, setExpenses] = useState<GymExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Expense Modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    category: 'utilities' as GymExpenseRecord['category'],
    amount: 5000,
    date: new Date().toISOString().split('T')[0]
  });
  const [savingExpense, setSavingExpense] = useState(false);

  const gymId = user?.gymId || 'gym-apex-1';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [finRes, expRes] = await Promise.all([
        api.getGymFinancials(gymId),
        api.getGymExpenses(gymId)
      ]);
      setFinancials(finRes);
      setExpenses(expRes.expenses || []);
    } catch (err) {
      console.error('Failed to load financial analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) return;

    try {
      setSavingExpense(true);
      await api.addGymExpense(gymId, expenseForm);
      setShowExpenseModal(false);
      setExpenseForm({
        title: '',
        category: 'utilities',
        amount: 5000,
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (err: any) {
      alert(`Failed to add expense: ${err.message}`);
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!financials) return;

    const rows = [
      ['SHADOW HUNTER FITNESS SYSTEM - GYM FINANCIAL REPORT'],
      ['Facility', 'Apex Performance Athletic Club'],
      ['Generated On', new Date().toISOString()],
      [],
      ['Metric', 'Amount (INR)'],
      ['Total Billed Revenue', financials.metrics.totalBilled],
      ['Total Cash & UPI Collections', financials.metrics.totalCollections],
      ['Outstanding Receivables', financials.metrics.outstandingPayments],
      ['Total Operating Expenses', financials.metrics.totalExpenses],
      ['Net Operating Cash Flow', financials.metrics.netCashFlow],
      [],
      ['Membership Trends', 'Count'],
      ['Active Members in Good Standing', financials.metrics.activeMembers],
      ['New Enrollments (This Month)', financials.metrics.newMembershipsThisMonth],
      ['Renewals Processed', financials.metrics.renewalsCount],
      ['Memberships Expiring Soon (14d)', financials.metrics.expiringSoonCount],
      [],
      ['Recent Operating Expenses', 'Category', 'Date', 'Amount (INR)'],
      ...expenses.map(e => [e.title, e.category, e.date, e.amount])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gym_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const metrics = financials?.metrics || {
    totalBilled: 92000,
    totalCollections: 88000,
    outstandingPayments: 4000,
    totalExpenses: 48000,
    netCashFlow: 40000,
    activeMembers: 88,
    newMembershipsThisMonth: 6,
    renewalsCount: 14,
    expiringSoonCount: 3
  };

  const trends = financials?.revenueTrends || [];

  return (
    <div className="space-y-6">
      {/* Header */}
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
            Financial Analytics & Collections
          </h1>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Real-time cash flow oversight, operating expense breakdown, recurring renewals, and downloadable audit reports.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-textPrimary-light dark:text-textPrimary-dark text-xs font-bold flex items-center space-x-1.5 cursor-pointer hover:border-primary"
          >
            <Plus size={16} />
            <span>Record Expense</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <Download size={16} />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* 5-Card Analytics KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark block">
            Billed Revenue
          </span>
          <p className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1">
            ₹{metrics.totalBilled?.toLocaleString()}
          </p>
          <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-1 block">Monthly Generated</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block">
            Total Collections
          </span>
          <p className="text-xl font-black text-emerald-500 mt-1">
            ₹{metrics.totalCollections?.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-500/80 font-bold mt-1 block">Cash, UPI & Online</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block">
            Outstanding Due
          </span>
          <p className="text-xl font-black text-rose-500 mt-1">
            ₹{metrics.outstandingPayments?.toLocaleString()}
          </p>
          <span className="text-[10px] text-rose-500/80 font-bold mt-1 block">Unpaid Invoices</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">
            Operating Expenses
          </span>
          <p className="text-xl font-black text-amber-500 mt-1">
            ₹{metrics.totalExpenses?.toLocaleString()}
          </p>
          <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark mt-1 block">Rent, Staff, Utilities</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm col-span-2 md:col-span-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-primary dark:text-primary-light block">
            Net Cash Flow
          </span>
          <p className="text-xl font-black text-primary dark:text-primary-light mt-1">
            ₹{metrics.netCashFlow?.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 flex items-center space-x-0.5">
            <ArrowUpRight size={12} />
            <span>Operating Profit</span>
          </span>
        </div>
      </div>

      {/* Membership Flow Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">
            <Users size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-surface-mutedLight dark:text-surface-mutedDark">New Enrolled Memberships</span>
            <p className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-0.5">+{metrics.newMembershipsThisMonth} Athletes</p>
            <span className="text-[10px] text-emerald-500 font-bold">This Month</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center font-black">
            <Activity size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-surface-mutedLight dark:text-surface-mutedDark">Renewals Succeeded</span>
            <p className="text-xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-0.5">{metrics.renewalsCount} Renewals</p>
            <span className="text-[10px] text-primary dark:text-primary-light font-bold">98.4% Retention Rate</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-surface-mutedLight dark:text-surface-mutedDark">Expiring Within 14 Days</span>
            <p className="text-xl font-black text-rose-500 mt-0.5">{metrics.expiringSoonCount} Expiring</p>
            <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">Renewal notices active</span>
          </div>
        </div>
      </div>

      {/* Visual Revenue Trends Chart Strip */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Month-over-Month Revenue & Expense Flow
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-0.5">
              Comparative telemetry of billed dues, collections received, and operating expenses.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-bold">
            <span className="flex items-center space-x-1 text-primary dark:text-primary-light">
              <span className="w-3 h-3 rounded-full bg-primary" />
              <span>Billed</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-500">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Collected</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-400">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span>Expenses</span>
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="pt-4 grid grid-cols-5 gap-4 items-end h-48 border-b border-surface-borderLight dark:border-surface-borderDark pb-2">
          {trends.map((item: any, idx: number) => {
            const maxVal = 100000;
            const billedH = Math.min(100, Math.round((item.billed / maxVal) * 100));
            const collectedH = Math.min(100, Math.round((item.collected / maxVal) * 100));
            const expenseH = Math.min(100, Math.round((item.expenses / maxVal) * 100));

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end space-y-1">
                <div className="w-full flex justify-center items-end space-x-1 h-36">
                  <div
                    style={{ height: `${billedH}%` }}
                    className="w-3.5 bg-primary rounded-t-md transition-all"
                    title={`Billed: ₹${item.billed}`}
                  />
                  <div
                    style={{ height: `${collectedH}%` }}
                    className="w-3.5 bg-emerald-500 rounded-t-md transition-all"
                    title={`Collected: ₹${item.collected}`}
                  />
                  <div
                    style={{ height: `${expenseH}%` }}
                    className="w-3.5 bg-rose-400 rounded-t-md transition-all"
                    title={`Expenses: ₹${item.expenses}`}
                  />
                </div>
                <span className="text-[11px] font-bold text-surface-mutedLight dark:text-surface-mutedDark pt-1">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Facility Operating Expenses Table */}
      <div className="bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark rounded-3xl shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Recent Facility Operating Expenses
            </h3>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              Track maintenance, rent, trainer payroll, and commercial utility allocations.
            </p>
          </div>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-3 py-1.5 rounded-xl gradient-btn-primary text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Expense</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surface-borderLight dark:border-surface-borderDark bg-surface-light/50 dark:bg-[#1b1926]/50 text-surface-mutedLight dark:text-surface-mutedDark font-black uppercase text-[10px]">
                <th className="py-2.5 px-3">Expense Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Recorded By</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-borderLight dark:divide-surface-borderDark">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-surface-light/30 dark:hover:bg-[#1b1926]/30">
                  <td className="py-2.5 px-3 font-bold text-textPrimary-light dark:text-textPrimary-dark">{e.title}</td>
                  <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-surface-mutedLight dark:text-surface-mutedDark">
                    <span className="px-2 py-0.5 rounded bg-surface-light dark:bg-[#1b1926]">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-surface-mutedLight dark:text-surface-mutedDark">{e.date}</td>
                  <td className="py-2.5 px-3 text-surface-mutedLight dark:text-surface-mutedDark">{e.recordedBy}</td>
                  <td className="py-2.5 px-3 text-right font-black text-rose-500">₹{e.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: RECORD FACILITY EXPENSE */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#252330] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-surface-borderLight dark:border-surface-borderDark space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-surface-borderLight dark:border-surface-borderDark">
              <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark">
                Record Facility Operating Expense
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-surface-mutedLight hover:text-rose-500 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  placeholder="e.g. Olympic Barbell Calibration Service"
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Expense Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e: any) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-bold"
                  >
                    <option value="rent">Facility Rent / Lease</option>
                    <option value="salaries">Staff / Trainer Payroll</option>
                    <option value="utilities">Electricity & Water</option>
                    <option value="maintenance">Equipment Maintenance</option>
                    <option value="equipment">New Equipment Capital</option>
                    <option value="other">General Operational</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Amount (₹ INR) *</label>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-black text-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Expense Date</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] font-bold text-surface-mutedLight hover:text-textPrimary-light cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingExpense}
                  className="px-5 py-2 rounded-xl gradient-btn-primary text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {savingExpense ? 'Recording...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
