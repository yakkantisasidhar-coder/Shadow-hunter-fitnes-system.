import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface ForgotPasswordScreenProps {
  onNavigate: (screen: string) => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-md mx-auto">
      <div className="bg-white dark:bg-[#252330] rounded-2xl p-6 md:p-8 shadow-sm border border-surface-borderLight dark:border-surface-borderDark">
        <button
          onClick={() => onNavigate('login')}
          className="flex items-center space-x-1 text-xs text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Sign In</span>
        </button>

        <h2 className="text-2xl font-extrabold text-textPrimary-light dark:text-textPrimary-dark">
          Reset Password
        </h2>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1 mb-6">
          Enter the email address registered with your Shadow Hunter account. We will send you secure recovery instructions.
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center space-y-2">
            <CheckCircle2 size={36} className="text-green-500 mx-auto" />
            <h4 className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark">
              Instructions Dispatched
            </h4>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              We have sent password reset credentials to <strong>{email}</strong>. Check your inbox and spam folder.
            </p>
            <button
              onClick={() => onNavigate('login')}
              className="mt-3 w-full py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-semibold"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-textPrimary-light dark:text-textPrimary-dark">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-surface-mutedLight dark:text-surface-mutedDark" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-btn-primary text-white font-semibold text-sm transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Sending Instructions...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
