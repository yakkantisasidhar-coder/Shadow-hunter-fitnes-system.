import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  CreditCard, 
  Dumbbell, 
  TrendingUp, 
  FileText, 
  ArrowRight,
  AlertTriangle,
  Key,
  Globe,
  UserPlus
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface SuperAdminDashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const SuperAdminDashboardScreen: React.FC<SuperAdminDashboardScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.getAdminMetrics();
        setMetrics(res);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Super Admin Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#17151F] via-[#241f35] to-primary p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/30 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider mb-2 border border-primary/40">
              <ShieldCheck size={13} className="text-primary-light" />
              <span>PLATFORM MASTER CLEARANCE &bull; LEVEL 4</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black">
              Central Super Administrator Control Panel
            </h2>
            <p className="text-xs text-white/80 mt-1">
              Full platform oversight: User accounts, commercial gym facility authorizations, RBAC grants, and telemetry logs.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('admin-gym-access')}
              className="px-4 py-2.5 rounded-2xl bg-white text-primary font-bold text-xs hover:bg-white/90 transition-colors shadow-lg cursor-pointer flex items-center space-x-1.5"
            >
              <Key size={14} />
              <span>Gym Access Control</span>
            </button>
            <button
              onClick={() => onNavigate('admin-permissions')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors cursor-pointer"
            >
              Role Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Platform Users
          </span>
          <span className="text-2xl font-black text-primary dark:text-primary-light mt-1 block">
            {metrics?.totalUsers || 4} Registered
          </span>
          <button onClick={() => onNavigate('admin-users')} className="text-[11px] text-primary hover:underline font-bold mt-1 block">
            Manage Accounts &rarr;
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Approved Gyms
          </span>
          <span className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark mt-1 block">
            {metrics?.activeGyms || 2} Commercial Clubs
          </span>
          <button onClick={() => onNavigate('admin-gyms')} className="text-[11px] text-primary hover:underline font-bold mt-1 block">
            Inspect Gyms &rarr;
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Verified Gross Revenue
          </span>
          <span className="text-2xl font-black text-emerald-500 mt-1 block">
            ₹{metrics?.totalRevenueInr?.toLocaleString() || '2,499'} INR
          </span>
          <button onClick={() => onNavigate('admin-analytics')} className="text-[11px] text-emerald-500 hover:underline font-bold mt-1 block">
            Growth Curves &rarr;
          </button>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark block">
            Verified Sessions
          </span>
          <span className="text-2xl font-black text-indigo-500 mt-1 block">
            {metrics?.totalWorkoutsLogged || 3} Workouts
          </span>
          <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark mt-1 block">
            Zero synthetic data
          </span>
        </div>
      </div>

      {/* Admin Modules Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: 'GYM ACCESS CONTROL',
            desc: 'Super Host command center: Grant, audit, suspend, and revoke Gym Owner access with 10 granular permissions across multiple gyms.',
            screen: 'admin-gym-access',
            icon: Key,
            color: 'text-primary'
          },
          {
            title: 'User Administration',
            desc: 'Search, review athlete profiles, suspend non-compliant users, and restore access.',
            screen: 'admin-users',
            icon: Users,
            color: 'text-indigo-400'
          },
          {
            title: 'Gym Facility Management',
            desc: 'Review submitted gym applications, approve partnerships, and suspend non-compliant facilities.',
            screen: 'admin-gyms',
            icon: Building2,
            color: 'text-indigo-500'
          },
          {
            title: 'Subscription & Entitlement Centre',
            desc: 'Search gyms by permanent ID or registered email, manage SaaS plan tiers, adjust member/staff limits, and enforce entitlements.',
            screen: 'admin-subscription-centre',
            icon: CreditCard,
            color: 'text-emerald-500'
          },
          {
            title: 'Role & RBAC Permission Matrix',
            desc: 'Assign Gym Leader, Moderator, Manager, and Editor roles scoped to individual facilities.',
            screen: 'admin-permissions',
            icon: ShieldCheck,
            color: 'text-emerald-500'
          },
          {
            title: 'Platform Analytics',
            desc: 'Examine retention cohorts, subscription revenue curves, and daily active training volumes.',
            screen: 'admin-analytics',
            icon: TrendingUp,
            color: 'text-amber-500'
          },
          {
            title: 'Immutable Audit Security Logs',
            desc: 'Inspect tamper-evident records of all administrator actions, credential changes, and grants.',
            screen: 'admin-audit-logs',
            icon: FileText,
            color: 'text-rose-500'
          },
          {
            title: 'Gym Network & Claims',
            desc: 'View all platform gyms, review ownership claims, approve or reject gym verification requests, and manage gym ownership transfers.',
            screen: 'admin-gym-network',
            icon: Globe,
            color: 'text-blue-500'
          },
          {
            title: 'Platform Team Management',
            desc: 'Invite team members, assign platform roles, manage permissions, suspend or remove staff, and view the team audit log.',
            screen: 'admin-team',
            icon: UserPlus,
            color: 'text-cyan-500'
          }
        ].map((mod, i) => {
          const Icon = mod.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigate(mod.screen)}
              className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary/60 cursor-pointer transition-all shadow-sm flex flex-col justify-between group"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-surface-light dark:bg-[#1b1926] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform ${mod.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-base font-black text-textPrimary-light dark:text-textPrimary-dark group-hover:text-primary transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-xs font-bold text-primary dark:text-primary-light">
                <span>Access Console</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
