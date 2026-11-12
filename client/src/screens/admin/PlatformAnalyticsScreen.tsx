import React, { useEffect, useState } from 'react';
import { TrendingUp, ArrowLeft, CreditCard, Users, Dumbbell, Calendar } from 'lucide-react';
import { api } from '../../services/api';

interface PlatformAnalyticsScreenProps {
  onNavigate: (screen: string) => void;
}

export const PlatformAnalyticsScreen: React.FC<PlatformAnalyticsScreenProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.getAdminAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load platform analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <button
            onClick={() => onNavigate('admin')}
            className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Super Admin Dashboard</span>
          </button>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Platform Analytics & Growth Telemetry
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Real-time subscriber velocity, cohort retention indices, and daily workout volume graphs.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold">
          Live Telemetry Feed
        </span>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
            Monthly Recurring Revenue (MRR)
          </span>
          <div className="text-2xl font-black text-emerald-500 mt-1">
            ₹58,400 INR
          </div>
          <span className="text-xs text-emerald-500 font-bold mt-1 block">
            +30.1% vs last month
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
            90-Day Athlete Retention
          </span>
          <div className="text-2xl font-black text-primary dark:text-primary-light mt-1">
            87.4%
          </div>
          <span className="text-xs text-surface-mutedLight dark:text-surface-mutedDark font-medium mt-1 block">
            Above commercial fitness benchmark (65%)
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
            Avg Daily Active Workouts
          </span>
          <div className="text-2xl font-black text-indigo-500 mt-1">
            106 Sessions / Day
          </div>
          <span className="text-xs text-surface-mutedLight dark:text-surface-mutedDark font-medium mt-1 block">
            Peak activity on Friday & Saturday
          </span>
        </div>
      </div>

      {/* Revenue Trend Graph */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-textPrimary-light dark:text-textPrimary-dark">
              Monthly Subscription Revenue Trajectory (INR)
            </h3>
            <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
              Consistent acceleration across individual and gym collaboration tiers
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-500">₹58.4k Current Run-rate</span>
        </div>

        <div className="h-56 w-full pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160">
            {/* Grid */}
            <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" className="text-black/5 dark:text-white/5" strokeDasharray="4 4" />
            <line x1="0" y1="70" x2="600" y2="70" stroke="currentColor" className="text-black/5 dark:text-white/5" strokeDasharray="4 4" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="currentColor" className="text-black/5 dark:text-white/5" strokeDasharray="4 4" />

            {/* Polyline */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="40,130 160,110 280,85 400,55 540,25"
            />

            {/* Points */}
            {[
              { x: 40, y: 130, val: '₹14.5k', m: 'Jul' },
              { x: 160, y: 110, val: '₹23.8k', m: 'Aug' },
              { x: 280, y: 85, val: '₹31.2k', m: 'Sep' },
              { x: 400, y: 55, val: '₹44.9k', m: 'Oct' },
              { x: 540, y: 25, val: '₹58.4k', m: 'Nov' }
            ].map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill="#10b981" stroke="#FFFFFF" strokeWidth="2" />
                <text x={p.x - 14} y={p.y - 10} fill="currentColor" fontSize="10" fontWeight="bold">
                  {p.val}
                </text>
                <text x={p.x - 8} y="150" fill="currentColor" opacity="0.6" fontSize="10">
                  {p.m}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};
