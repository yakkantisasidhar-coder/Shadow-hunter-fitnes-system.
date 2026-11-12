import React, { useState } from 'react';
import { Settings, Moon, Sun, Globe, Bell, Lock, LogOut, Trash2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface AccountSettingsScreenProps {
  onNavigate: (screen: string) => void;
}

export const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({ onNavigate }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [hydrationAlerts, setHydrationAlerts] = useState(true);
  const [gymBroadcasts, setGymBroadcasts] = useState(true);
  const [language, setLanguage] = useState('English (US)');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePreferences = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
          Account Settings & Preferences
        </h2>
        <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
          Customize system interface theme, telemetry preferences, and push notification triggers.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 size={16} />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      {/* Interface Theme & Appearance */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
          Display & Appearance
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark">
              Color Theme
            </h4>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              Toggle between high-contrast dark commercial mode and clean light mode
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold flex items-center space-x-2"
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-500" />}
            <span className="capitalize">{theme} Mode</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-surface-borderLight dark:border-surface-borderDark">
          <div>
            <h4 className="text-sm font-bold text-textPrimary-light dark:text-textPrimary-dark">
              Language / Locale
            </h4>
            <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark">
              Metric system defaults (kg / cm / ml)
            </p>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-surface-light dark:bg-[#1b1926] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold"
          >
            <option value="English (US)">English (US)</option>
            <option value="English (UK)">English (UK)</option>
            <option value="Spanish">Español</option>
            <option value="German">Deutsch</option>
          </select>
        </div>
      </div>

      {/* Notification Triggers */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
          Notification Preferences
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark block">
                Daily Workout Scheduling Reminders
              </span>
              <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                Prompt 30 minutes before your scheduled training split
              </span>
            </div>
            <input
              type="checkbox"
              checked={workoutReminders}
              onChange={(e) => setWorkoutReminders(e.target.checked)}
              className="accent-primary w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-surface-borderLight dark:border-surface-borderDark">
            <div>
              <span className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark block">
                Hydration & Macro Logs
              </span>
              <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                Periodic mid-day water intake milestone checks
              </span>
            </div>
            <input
              type="checkbox"
              checked={hydrationAlerts}
              onChange={(e) => setHydrationAlerts(e.target.checked)}
              className="accent-primary w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-surface-borderLight dark:border-surface-borderDark">
            <div>
              <span className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark block">
                Connected Gym Official Announcements
              </span>
              <span className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
                Urgent equipment notices and trainer schedule updates
              </span>
            </div>
            <input
              type="checkbox"
              checked={gymBroadcasts}
              onChange={(e) => setGymBroadcasts(e.target.checked)}
              className="accent-primary w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        <button
          onClick={handleSavePreferences}
          className="w-full mt-2 py-2.5 rounded-xl gradient-btn-primary text-white text-xs font-bold"
        >
          Save Notification Preferences
        </button>
      </div>

      {/* Account Security & Actions */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-surface-mutedLight dark:text-surface-mutedDark">
          Account Actions
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-textPrimary-light dark:text-textPrimary-dark">
              Privacy & Security Center
            </h4>
            <p className="text-[11px] text-surface-mutedLight dark:text-surface-mutedDark">
              Active sessions, encrypted biometric logs, GDPR data export
            </p>
          </div>
          <button
            onClick={() => onNavigate('privacy-security')}
            className="px-3.5 py-1.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5"
          >
            Review Security
          </button>
        </div>

        <div className="pt-3 border-t border-surface-borderLight dark:border-surface-borderDark flex justify-between items-center">
          <button
            onClick={() => {
              logout();
              onNavigate('login');
            }}
            className="text-xs font-bold text-rose-500 hover:underline flex items-center space-x-1.5"
          >
            <LogOut size={15} />
            <span>Sign Out of Shadow Hunter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
