import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface RegisterScreenProps {
  onNavigate: (screen: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'individual' | 'gym_owner'>('individual');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await register({
        fullName,
        email,
        password,
        role
      });
      // Redirect to onboarding assessment to configure biometrics and fitness goals
      onNavigate('onboarding');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-textPrimary-light dark:text-textPrimary-dark">
          Create Fitness Account
        </h2>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
          Join the professional Shadow Hunter Fitness System
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
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-surface-mutedLight dark:text-surface-mutedDark" size={18} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Marcus Vance"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

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
                placeholder="marcus@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-textPrimary-light dark:text-textPrimary-dark">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-surface-mutedLight dark:text-surface-mutedDark" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-textPrimary-light dark:text-textPrimary-dark">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('individual')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  role === 'individual'
                    ? 'bg-primary/10 border-primary text-primary dark:text-primary-light font-bold'
                    : 'border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark'
                }`}
              >
                Individual Athlete
              </button>
              <button
                type="button"
                onClick={() => setRole('gym_owner')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  role === 'gym_owner'
                    ? 'bg-primary/10 border-primary text-primary dark:text-primary-light font-bold'
                    : 'border-surface-borderLight dark:border-surface-borderDark text-surface-mutedLight dark:text-surface-mutedDark'
                }`}
              >
                Gym Owner / Leader
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-btn-primary text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Continue to Assessment'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-surface-mutedLight dark:text-surface-mutedDark">
          Already registered?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-primary dark:text-primary-light hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
