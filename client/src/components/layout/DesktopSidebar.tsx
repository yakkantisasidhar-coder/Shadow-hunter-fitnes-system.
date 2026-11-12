import React from 'react';
import { 
  Home, 
  Dumbbell, 
  Library, 
  Flame, 
  History, 
  Apple, 
  CalendarDays, 
  PlusCircle, 
  Sparkles, 
  TrendingUp, 
  Ruler, 
  Camera, 
  Activity, 
  Trophy, 
  Award, 
  Building2, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Bell, 
  Settings, 
  Lock, 
  LayoutDashboard, 
  FileText,
  UserCheck,
  MessageSquare,
  DollarSign,
  Clock,
  Key,
  Palette,
  Globe,
  UserPlus,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DesktopSidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentScreen,
  onNavigate,
  collapsed
}) => {
  const { user } = useAuth();
  const isGymOwner = user?.role === 'gym_owner' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const navSections = [
    {
      title: 'TRAINING & FITNESS',
      items: [
        { id: 'home', label: 'Home Dashboard', icon: Home },
        { id: 'workouts', label: 'Workout Hub', icon: Dumbbell },
        { id: 'exercises', label: 'Exercise Library', icon: Library },
        { id: 'programs', label: 'Workout Programs', icon: Flame },
        { id: 'workout-history', label: 'Session History', icon: History }
      ]
    },
    {
      title: 'NUTRITION & MACROS',
      items: [
        { id: 'nutrition', label: 'Nutrition Tracker', icon: Apple },
        { id: 'meal-planner', label: 'Meal Planner', icon: CalendarDays },
        { id: 'food-log', label: 'Log Food', icon: PlusCircle }
      ]
    },
    {
      title: 'AI COACHING',
      items: [
        { id: 'ai-coach', label: 'AI Fitness Coach', icon: Sparkles }
      ]
    },
    {
      title: 'PROGRESS & BODY',
      items: [
        { id: 'progress', label: 'Progress Analytics', icon: TrendingUp },
        { id: 'measurements', label: 'Body Measurements', icon: Ruler },
        { id: 'progress-photos', label: 'Progress Photos', icon: Camera },
        { id: 'body-visualizer', label: 'Body Visualization', icon: Activity }
      ]
    },
    {
      title: 'COMMUNITY & CHALLENGES',
      items: [
        { id: 'challenges', label: 'Fitness Challenges', icon: Trophy },
        { id: 'achievements', label: 'Achievements', icon: Award },
        { id: 'leaderboards', label: 'Rankings & Boards', icon: Activity },
        { id: 'gym', label: 'Connected Gym', icon: Building2 },
        { id: 'gym-community', label: 'Trainer & Member Chat', icon: MessageSquare }
      ]
    },
    ...(isGymOwner
      ? [
          {
            title: 'GYM MANAGEMENT',
            items: [
              { id: 'gym-manage', label: 'Gym Portal Hub', icon: Building2 },
              { id: 'gym-members', label: 'Member Roster', icon: Users },
              { id: 'gym-billing', label: 'Monthly Billing & Dues', icon: DollarSign },
              { id: 'gym-financials', label: 'Financial Analytics', icon: TrendingUp },
              { id: 'gym-operations', label: 'Facility Operations', icon: Clock },
              { id: 'gym-trainers', label: 'Trainer Staff', icon: UserCheck },
              { id: 'gym-competitions', label: 'Gym Tournaments', icon: Trophy },
              { id: 'gym-pt', label: 'Personal Training', icon: Dumbbell },
              { id: 'gym-branding', label: 'Gym Branding', icon: Palette },
              { id: 'gym-whatsapp', label: 'WhatsApp & Follow-ups', icon: MessageSquare }
            ]
          }
        ]
      : [
          {
            title: 'COMMERCIAL GYM',
            items: [
              { id: 'gym-register', label: 'Register Gym Facility', icon: Building2 }
            ]
          }
        ]),
    ...(user?.subRoles?.includes('trainer') || user?.role === 'gym_owner' || user?.role === 'super_admin'
      ? [{
          title: 'TRAINER',
          items: [
            { id: 'trainer-dashboard', label: 'Trainer Dashboard', icon: GraduationCap }
          ]
        }]
      : []),
    {
      title: 'PLANS & BILLING',
      items: [
        { id: 'subscriptions', label: 'Membership Plans', icon: CreditCard },
        { id: 'payment-history', label: 'Payment Receipts', icon: FileText }
      ]
    },
    ...(isSuperAdmin
      ? [
          {
            title: 'SUPER HOST CONTROL',
            items: [
              { id: 'admin', label: 'Super Host Dashboard', icon: LayoutDashboard },
              { id: 'admin-gym-access', label: 'Gym Access Control', icon: Key },
              { id: 'admin-users', label: 'User Management', icon: Users },
              { id: 'admin-gyms', label: 'Gym Facility Approvals', icon: Building2 },
              { id: 'admin-permissions', label: 'Role & RBAC Matrix', icon: ShieldCheck },
              { id: 'admin-analytics', label: 'Platform Analytics', icon: TrendingUp },
              { id: 'admin-audit-logs', label: 'Audit Security Logs', icon: FileText },
              { id: 'admin-gym-network', label: 'Gym Network & Claims', icon: Globe },
              { id: 'admin-team', label: 'My Team', icon: UserPlus }
            ]
          }
        ]
      : []),
    {
      title: 'SETTINGS',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'settings', label: 'Account Settings', icon: Settings },
        { id: 'privacy-security', label: 'Privacy & Security', icon: Lock }
      ]
    }
  ];

  return (
    <aside
      className={`hidden md:flex flex-col flex-shrink-0 bg-white dark:bg-[#1a1824] border-r border-surface-borderLight dark:border-surface-borderDark transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand logo */}
      <div className="h-16 flex items-center px-5 border-b border-surface-borderLight dark:border-surface-borderDark justify-between">
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-black shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
            SH
          </div>
          {!collapsed && (
            <div className="leading-tight overflow-hidden">
              <span className="font-extrabold text-sm tracking-wider text-textPrimary-light dark:text-textPrimary-dark block">
                SHADOW HUNTER
              </span>
              <span className="text-[10px] font-semibold text-primary dark:text-primary-light uppercase tracking-widest block">
                FITNESS SYSTEM
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav items list */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-bold tracking-wider text-surface-mutedLight dark:text-surface-mutedDark uppercase">
                {sec.title}
              </h4>
            )}
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/25 font-semibold'
                      : 'text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark hover:bg-black/5 dark:hover:bg-white/5'
                  } ${collapsed ? 'justify-center px-0' : ''}`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-primary dark:text-primary-light'} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User profile compact banner at bottom */}
      <div className="p-3 border-t border-surface-borderLight dark:border-surface-borderDark bg-surface-light dark:bg-[#15131e]">
        <div 
          onClick={() => onNavigate('profile')}
          className="flex items-center space-x-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
        >
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt="User avatar"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/40 flex-shrink-0"
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark truncate">
                {user?.fullName || 'Fitness Athlete'}
              </p>
              <span className="inline-block px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded bg-primary/10 text-primary dark:text-primary-light">
                {user?.role?.replace('_', ' ') || 'Athlete'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
