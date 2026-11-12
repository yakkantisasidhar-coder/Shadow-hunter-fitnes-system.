import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { login, switchPersona } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email and password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await login(email, password);
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: any) => {
    setLoading(true);
    try {
      await switchPersona(role);
      onNavigate('home');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-xl shadow-primary/30">
          SH
        </div>
        <h2 className="text-2xl font-extrabold text-textPrimary-light dark:text-textPrimary-dark">
          Welcome to Shadow Hunter
        </h2>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
          Enterprise Commercial Fitness and Performance System
        </p>
      </div>

      <div className="bg-white dark:bg-[#252330] rounded-2xl p-6 md:p-8 shadow-sm border border-surface-borderLight dark:border-surface-borderDark">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-textPrimary-light dark:text-textPrimary-dark">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-surface-mutedLight dark:text-surface-mutedDark" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="athlete@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-textPrimary-light dark:text-textPrimary-dark">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-[11px] font-semibold text-primary dark:text-primary-light hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-surface-mutedLight dark:text-surface-mutedDark" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-btn-primary text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-surface-mutedLight dark:text-surface-mutedDark">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-primary dark:text-primary-light hover:underline"
          >
            Create Account
          </button>
        </div>

        {/* Quick Demo Persona Shortcuts */}
        <div className="mt-6 pt-5 border-t border-surface-borderLight dark:border-surface-borderDark">
          <p className="text-[10px] uppercase font-bold text-surface-mutedLight dark:text-surface-mutedDark text-center mb-3">
            One-Click Quick Persona Evaluation
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('individual')}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary text-left transition-colors"
            >
              <span className="block font-bold">Individual Athlete</span>
              <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">Alex Reynolds</span>
            </button>
            <button
              onClick={() => handleDemoLogin('gym_member')}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary text-left transition-colors"
            >
              <span className="block font-bold">Gym Member</span>
              <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">Sarah Jenkins</span>
            </button>
            <button
              onClick={() => handleDemoLogin('gym_owner')}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary text-left transition-colors"
            >
              <span className="block font-bold">Gym Owner</span>
              <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">Apex Athletics</span>
            </button>
            <button
              onClick={() => handleDemoLogin('super_admin')}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark hover:border-primary text-left transition-colors"
            >
              <span className="block font-bold">Super Admin</span>
              <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">Platform Director</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
