import React from 'react';
import { Sun, Moon, Bell, Menu, Shield, Crown, Building2, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface TopHeaderProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount?: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentScreen,
  onNavigate,
  collapsed,
  onToggleCollapse,
  unreadCount = 2
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, switchPersona } = useAuth();

  const getScreenTitle = (screen: string) => {
    const titles: Record<string, string> = {
      'home': 'Fitness Dashboard',
      'workouts': 'Workout Hub',
      'exercises': 'Exercise Library',
      'exercise-details': 'Exercise Demonstration',
      'programs': 'Workout Programs',
      'workout-player': 'Live Workout Player',
      'workout-history': 'Training History',
      'nutrition': 'Daily Nutrition',
      'meal-planner': 'Meal Planner',
      'food-log': 'Food Logging',
      'ai-coach': 'AI Fitness Assistant',
      'progress': 'Progress & Analytics',
      'measurements': 'Body Measurements',
      'progress-photos': 'Progress Photos',
      'body-visualizer': 'Body Visualization',
      'challenges': 'Fitness Challenges',
      'achievements': 'Achievements & Badges',
      'profile': 'Personal Profile',
      'gym': 'Connected Gym',
      'gym-register': 'Gym Facility Registration',
      'gym-manage': 'Gym Administration Portal',
      'gym-members': 'Member Roster & Approvals',
      'gym-trainers': 'Trainer Management',
      'gym-competitions': 'Gym Competitions',
      'leaderboards': 'Fair Activity Leaderboards',
      'subscriptions': 'Subscription Plans',
      'payment-history': 'Payment History & Receipts',
      'notifications': 'Notifications Center',
      'settings': 'Account Settings',
      'privacy-security': 'Privacy & Security Controls',
      'admin': 'Super Admin Dashboard',
      'admin-users': 'User Administration',
      'admin-gyms': 'Gym Facility Approvals',
      'admin-permissions': 'Role & RBAC Matrix',
      'admin-analytics': 'Platform Analytics',
      'admin-audit-logs': 'Immutable Audit Logs',
      'login': 'Account Login',
      'register': 'Account Registration',
      'forgot-password': 'Password Recovery',
      'onboarding': 'Fitness Onboarding'
    };
    return titles[screen] || 'Shadow Hunter Fitness';
  };

  const personas: { role: UserRole; label: string; icon: any }[] = [
    { role: 'individual', label: 'Athlete', icon: User },
    { role: 'gym_member', label: 'Gym Member', icon: Crown },
    { role: 'gym_owner', label: 'Gym Owner', icon: Building2 },
    { role: 'super_admin', label: 'Super Admin', icon: Shield }
  ];

  return (
    <header className="h-16 bg-white/95 dark:bg-[#1a1824]/95 backdrop-blur-md border-b border-surface-borderLight dark:border-surface-borderDark px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl text-surface-mutedLight dark:text-surface-mutedDark hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-sm md:text-base font-bold text-textPrimary-light dark:text-textPrimary-dark">
            {getScreenTitle(currentScreen)}
          </h1>
          <p className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark hidden sm:block">
            SHADOW HUNTER FITNESS SYSTEM • Enterprise Commercial Edition
          </p>
        </div>
      </div>

      {/* Center/Right persona switcher & quick controls */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Role Persona Switcher Pill Dock */}
        <div className="hidden lg:flex items-center bg-surface-light dark:bg-[#15131e] p-1 rounded-xl border border-surface-borderLight dark:border-surface-borderDark">
          <span className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark px-2">
            Persona:
          </span>
          {personas.map((p) => {
            const Icon = p.icon;
            const isCurrent = user?.role === p.role;
            return (
              <button
                key={p.role}
                onClick={() => switchPersona(p.role)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-surface-mutedLight dark:text-surface-mutedDark hover:text-textPrimary-light dark:hover:text-textPrimary-dark'
                }`}
              >
                <Icon size={13} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-surface-mutedLight dark:text-surface-mutedDark hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun size={19} className="text-amber-400" />
          ) : (
            <Moon size={19} className="text-indigo-600" />
          )}
        </button>

        {/* Notifications Icon Button */}
        <button
          onClick={() => onNavigate('notifications')}
          className="p-2 rounded-xl text-surface-mutedLight dark:text-surface-mutedDark hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative"
          title="Notification Center"
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>

        {/* Avatar Profile Shortcut */}
        <button
          onClick={() => onNavigate('profile')}
          className="flex items-center space-x-2 pl-1 group"
        >
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt="User profile"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/40 group-hover:ring-primary transition-all"
          />
        </button>
      </div>
    </header>
  );
};
