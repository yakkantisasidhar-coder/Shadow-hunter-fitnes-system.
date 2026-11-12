import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Flame, Trophy, Building2, CreditCard, Shield, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { AppNotification } from '../../types';

interface NotificationsScreenProps {
  onNavigate: (screen: string) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAll = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifs();
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'workout': return Flame;
      case 'challenge': return Trophy;
      case 'gym': return Building2;
      case 'payment': return CreditCard;
      default: return Bell;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-textPrimary-light dark:text-textPrimary-dark">
            Notification Center
          </h2>
          <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1">
            Workout reminders, challenge achievements, payment confirmations, and gym notices.
          </p>
        </div>

        <button
          onClick={handleMarkAll}
          className="px-3.5 py-1.5 rounded-xl border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold flex items-center space-x-1.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <CheckCheck size={14} />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notifications Stream */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white dark:bg-[#252330] border border-surface-borderLight dark:border-surface-borderDark text-xs font-bold">
            No notifications at this time. You're all caught up!
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <div
                key={n.id}
                className={`p-4 md:p-5 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                  n.read
                    ? 'bg-white dark:bg-[#252330] border-surface-borderLight dark:border-surface-borderDark'
                    : 'bg-primary/5 dark:bg-primary/10 border-primary/30 shadow-sm'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary dark:text-primary-light flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-black text-textPrimary-light dark:text-textPrimary-dark">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-surface-mutedLight dark:text-surface-mutedDark whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-surface-mutedLight dark:text-surface-mutedDark mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
