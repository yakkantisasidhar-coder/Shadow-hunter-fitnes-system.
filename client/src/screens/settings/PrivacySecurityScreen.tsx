import React, { useState } from 'react';
import { Lock, Shield, Smartphone, Key, Download, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface PrivacySecurityScreenProps {
  onNavigate: (screen: string) => void;
}

export const PrivacySecurityScreen: React.FC<PrivacySecurityScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  const activeSessions = [
    { device: 'Desktop Chrome 130 • Windows 11', ip: '192.168.1.14', location: 'Current Active Session', current: true },
    { device: 'PWA Mobile App • Android 15', ip: '172.56.21.90', location: 'Metropolis Region', current: false }
  ];

  const handleExportData = () => {
    setExportLoading(true);
    setTimeout(() => {
      setExportLoading(false);
      alert('Your complete athlete dataset (workouts, measurements, nutrition) has been compiled into JSON archive.');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center space-x-1.5 text-xs font-bold text-surface-mutedLight dark:text-surface-mutedDark hover:text-primary mb-2 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Account Settings</span>
        </button>
        <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
          Privacy & Security Safeguards
        </h2>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
          Manage identity security, multi-factor verification, and GDPR-compliant data portability.
        </p>
      </div>

      {/* Security Credentials */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
          Authentication Protection
        </h3>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark">
              Multi-Factor Authentication (2FA)
            </h4>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              Requires a one-time cryptographic code on new device sign-ins
            </p>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
              twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-surface-light text-surface-mutedLight'
            }`}
          >
            {twoFactorEnabled ? 'Active / Protected' : 'Disabled'}
          </button>
        </div>

        <div className="pt-3 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark">
              Password Security
            </h4>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              Last rotated 45 days ago &bull; Strong hashing algorithm
            </p>
          </div>
          <button
            onClick={() => onNavigate('forgot-password')}
            className="px-3.5 py-1.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Active Device Sessions */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
          Authorized Device Sessions
        </h3>

        <div className="space-y-3">
          {activeSessions.map((session, i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-textPrimary-light dark:text-textPrimary-dark block">
                  {session.device}
                </span>
                <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark">
                  IP: {session.ip} &bull; {session.location}
                </span>
              </div>
              {session.current ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                  This Device
                </span>
              ) : (
                <button
                  onClick={() => alert('Terminated remote session.')}
                  className="text-xs font-bold text-rose-500 hover:underline"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Data Export & Deletion */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
          Data Rights & Deletion
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
              Export Athlete Profile Data
            </h4>
            <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
              Download your complete biometric history, workouts, and macro logs in JSON format.
            </p>
          </div>
          <button
            onClick={handleExportData}
            disabled={exportLoading}
            className="px-3.5 py-1.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 flex items-center space-x-1"
          >
            <Download size={14} />
            <span>{exportLoading ? 'Compiling...' : 'Export JSON'}</span>
          </button>
        </div>

        <div className="pt-3 border-t border-surface-borderLight dark:border-surface-borderDark flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-rose-500">
              Permanent Account Deletion
            </h4>
            <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
              Permanently purges your account credentials, workouts, and subscriptions.
            </p>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to permanently erase your Shadow Hunter account? This action cannot be reversed.')) {
                alert('Account purge scheduled in accordance with privacy regulations.');
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500/20"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
